#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Optimized Synthetic Data Generator for SAP HANA
Period: 2021-2025, configurable volume multiplier
"""
import os
import sys
import datetime
import random
import logging
from decimal import Decimal
from typing import List, Dict, Tuple

import numpy as np
from dotenv import load_dotenv

# Ensure hdbcli is installed
try:
    from hdbcli import dbapi
except ImportError:
    print("Error: hdbcli no instalado. Instálalo con 'pip install hdbcli'")
    sys.exit(1)

# Load environment and configure logging
load_dotenv('../../backend/.env')
# Configure dynamic log file path in mlops/logs with date-based filename
logs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'logs'))
os.makedirs(logs_dir, exist_ok=True)
log_file = os.path.join(logs_dir, datetime.datetime.now().strftime("%Y%m%d_%H%:%M%:S_data_generator.log"))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)

class SyntheticDataGenerator:
    def __init__(self, volume_multiplier: int = 5):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.volume_multiplier = max(1, volume_multiplier)
        self.start_date = datetime.date(2021, 1, 1)
        self.end_date = datetime.date(2025, 12, 31)

        # Database connection and ID counters
        self.conn = None
        self.next_id = {
            'order': 11,
            'order_item': 12,
            'history': 1,
            'payment': 1,
            'comment': 1
        }

        # System data holders
        self.users: List[int] = []
        self.locations: List[int] = []  # Location IDs from Location2 table
        self.inventories: List[int] = list(range(1, 11))
        self.products_price: Dict[int, float] = {}

        # Stats
        self.stats = {
            'orders': 0,
            'order_items': 0,
            'history_records': 0,
            'payments': 0,
            'comments': 0,
            'total_value': Decimal('0.0')
        }

    def connect(self) -> bool:
        host = os.getenv('HANA_HOST') or os.getenv('SERVER_NODE')
        user = os.getenv('HANA_USER') or os.getenv('DB_USERNAME')
        pwd = os.getenv('HANA_PASSWORD') or os.getenv('DB_PASSWORD')
        port = int(os.getenv('HANA_PORT', '443'))

        if not all([host, user, pwd]):
            self.logger.error("SAP HANA credentials are incomplete")
            return False

        try:
            self.conn = dbapi.connect(
                address=host,
                port=port,
                user=user,
                password=pwd,
                encrypt=True,
                sslValidateCertificate=False
            )
            self.logger.info("Connected to SAP HANA")
            return True
        except Exception as e:
            self.logger.error(f"Connection error: {e}")
            return False

    def disconnect(self):
        if self.conn:
            self.conn.close()
            self.logger.info("Disconnected from SAP HANA")

    def _batch_insert(self, sql: str, data: List[Tuple], batch_size: int = 1000):
        cursor = self.conn.cursor()
        for i in range(0, len(data), batch_size):
            chunk = data[i:i + batch_size]
            cursor.executemany(sql, chunk)
            self.conn.commit()
        cursor.close()

    def load_existing_data(self):
        """Load users and product prices from DB and Location & Article IDs"""
        cur = self.conn.cursor()
        cur.execute("SELECT DISTINCT Usuario_ID FROM Usuario2")
        self.users = [r[0] for r in cur.fetchall()] or [2, 3, 4]
        cur.execute("SELECT DISTINCT Location_ID FROM Location2")
        self.locations = [r[0] for r in cur.fetchall()] or list(range(1, 6))
        cur.execute("SELECT Articulo_ID, PrecioVenta FROM Articulo2")
        self.products_price.clear()
        for pid, price in cur.fetchall():
            self.products_price[pid] = float(price)
        # Load inventory mapping for history and inventory initialization
        cur.execute("SELECT Inventario_ID, Location_ID, Articulo_ID FROM Inventario2")
        self.inventory_map = {r[0]: (r[1], r[2]) for r in cur.fetchall()}  # inv_id: (loc_id, prod_id)
        self.inventories = list(self.inventory_map.keys())
        cur.close()
        self.logger.info(f"Loaded: {len(self.users)} users, {len(self.locations)} locations, {len(self.products_price)} products, {len(self.inventories)} inventories")

    def _get_table_columns(self, table_name: str) -> List[str]:
        """Fetch column names for a given table from HANA catalog"""
        cur = self.conn.cursor()
        # HANA catalog view SYS.TABLE_COLUMNS
        cur.execute(
            "SELECT COLUMN_NAME FROM SYS.TABLE_COLUMNS "
            f"WHERE TABLE_NAME = '{table_name.upper()}' "
            "AND SCHEMA_NAME = CURRENT_SCHEMA"
        )
        cols = [row[0] for row in cur.fetchall()]
        cur.close()
        return cols

    def _random_date(self) -> datetime.date:
        days = (self.end_date - self.start_date).days
        weight = 1 - np.random.beta(a=2, b=5)
        return self.start_date + datetime.timedelta(days=int(weight * days))

    def generate_orders(self) -> Dict[int, Decimal]:
        """Generate order records and return a map of order_id to total value placeholder"""
        count = 2000 * self.volume_multiplier
        orders, totals = [], {}
        for _ in range(count):
            oid = self.next_id['order']
            self.next_id['order'] += 1

            created = self._random_date()
            accepted = created + datetime.timedelta(days=random.randint(1, 3))
            limit = accepted + datetime.timedelta(days=random.randint(3, 7))
            delivery = accepted + datetime.timedelta(days=int(np.random.gamma(3, 2)))
            on_time = delivery <= limit
            state = 'Completado' if on_time else random.choice(['En Proceso', 'Retrasado'])

            orders.append((
                oid,
                random.choice(self.users),
                random.choice(self.users),
                'Venta',
                str(random.choice(self.locations)),  # organization field expects string
                created, accepted, limit, delivery, delivery,
                on_time, state, 0.0,
                random.choice([1, 2, 3]), 0.0,
                (delivery - accepted).days,
                (delivery - accepted).days
            ))
            totals[oid] = Decimal('0.0')

        insert_sql = (
            "INSERT INTO Ordenes2 (Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion, "
            "FechaCreacion, FechaAceptacion, FechaLimitePago, FechaEstimadaEntrega, FechaEntrega, "
            "EntregaATiempo, Estado, Total, MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        self._batch_insert(insert_sql, orders, batch_size=500)
        self.stats['orders'] = count
        self.logger.info(f"Inserted {count} orders")
        return totals

    def generate_history(self):
        """Generate monthly import/export history records for inventory and products over 5 years using Gaussian distribution"""
        self.logger.info("Generando historial de productos...")
        # Debug: log actual table columns
        table_cols = self._get_table_columns('HistorialProductos2')
        self.logger.info(f"HistorialProductos2 table columns: {table_cols}")
        # Determine target columns dynamically
        desired = ['INVENTARIO_ID', 'LOCATION_ID', 'ANIO', 'MES', 'IMPORTACION', 'EXPORTACION', 'STOCKSTART', 'STOCKEND']
        cols = [c for c in desired if c in table_cols]
        self.logger.info(f"Selected columns for HistorialProductos2 insertion: {cols}")
        records = []
        # Prepare time range by month
        current = datetime.date(self.start_date.year, self.start_date.month, 1)
        end = datetime.date(self.end_date.year, self.end_date.month, 1)
        # Initialize stock levels dict
        last_stock = {}
        # For each month in range (one record per inventory)
        while current <= end:
            year = current.year
            month = current.month
            # Unpack inventory_id and its location (ignore product_id)
            for inv_id, (loc, _) in self.inventory_map.items():
                # Sample import/export
                imp = max(0, int(np.random.normal(loc=50, scale=20)))
                exp = max(0, int(np.random.normal(loc=40, scale=15)))
                # Determine stock start and end
                stock_start = last_stock.get(inv_id, max(0, int(np.random.normal(loc=200, scale=50))))
                stock_end = max(0, stock_start + imp - exp)
                last_stock[inv_id] = stock_end
                row = [inv_id, loc, year, month, imp, exp, stock_start, stock_end]
                # Filter values for available cols
                values = [row[desired.index(c)] for c in cols]
                records.append(tuple(values))
            # Increment month
            if month == 12:
                current = datetime.date(year + 1, 1, 1)
            else:
                current = datetime.date(year, month + 1, 1)
        # Batch insert into HISTORIALPRODUCTOS2 with dynamic columns
        placeholders = ', '.join(['?'] * len(cols))
        insert_sql = f"INSERT INTO HistorialProductos2 ({', '.join(cols)}) VALUES ({placeholders})"
        self._batch_insert(insert_sql, records, batch_size=1000)
        self.stats['history_records'] = len(records)
        self.logger.info(f"Inserted {len(records)} history records")

    def initialize_inventory(self):
        """Initialize INVENTARIO2 table with Gaussian-distributed values based on history"""
        self.logger.info("Inicializando tabla de inventario con columnas dinámicas...")
        # Debug: log actual table columns
        cols_all = self._get_table_columns('Inventario2')
        self.logger.info(f"Inventario2 table columns: {cols_all}")
        # Determine table columns dynamically
        desired = [
            'INVENTARIO_ID','ARTICULO_ID','LOCATION_ID','STOCKACTUAL',
            'IMPORTACION','EXPORTACION','STOCKMINIMO','STOCKRECOMENDADO',
            'FECHAULTIMAIMPORTACION','FECHAULTIMAEXPORTACION','MARGENGANANCIA',
            'TIEMPOREPOSICION','STOCKSEGURIDAD','DEMANDAPROMEDIO'
        ]
        self.logger.info(f"Selected columns for Inventario2 insertion: {[c for c in desired if c in cols_all]}")
        cols = [c for c in desired if c in cols_all]
        records = []
        today = datetime.date.today()
        for inv_id, (loc, prod) in self.inventory_map.items():
            stock_actual = max(0, int(np.random.normal(loc=200, scale=50)))
            imp = max(0, int(np.random.normal(loc=50, scale=20)))
            exp = max(0, int(np.random.normal(loc=40, scale=15)))
            stock_min = max(1, int(np.random.normal(loc=stock_actual * 0.2, scale=10)))
            stock_rec = max(stock_actual, stock_actual + int(np.random.normal(loc=50, scale=20)))
            margen = round(abs(np.random.normal(loc=0.3, scale=0.1)), 2)
            t_repos = max(1, int(np.random.normal(loc=7, scale=2)))
            stock_seg = max(1, int(np.random.normal(loc=stock_actual * 0.1, scale=5)))
            demanda = max(0, int(np.random.normal(loc=40, scale=15)))
            # escolha fechas ultimas import/export como today
            row = [inv_id, prod, loc, stock_actual, imp, exp, stock_min, stock_rec, today, today, margen, t_repos, stock_seg, demanda]
            vals = [row[desired.index(c)] for c in cols]
            records.append(tuple(vals))
        # Batch insert with dynamic columns
        placeholders = ','.join(['?'] * len(cols))
        insert_sql = f"INSERT INTO Inventario2 ({','.join(cols)}) VALUES ({placeholders})"
        self._batch_insert(insert_sql, records, batch_size=500)
        self.stats['inventories'] = len(records)
        self.logger.info(f"Inserted {len(records)} inventory records into columns: {cols}")

    def run(self) -> bool:
        if not self.connect():
            return False
        try:
            self.load_existing_data()
            # Clear existing synthetic data tables in child-to-parent order to avoid FK violations
            self.logger.info("Clearing existing synthetic data tables...   ")
            cur = self.conn.cursor()
            # Remove dependent data
            cur.execute("DELETE FROM ComentariosOrdenes2")
            cur.execute("DELETE FROM PagoOrden2")
            cur.execute("DELETE FROM OrdenesProductos2")
            cur.execute("DELETE FROM HistorialProductos2")
            cur.execute("DELETE FROM Ordenes2")
            cur.execute("DELETE FROM Inventario2")
            self.conn.commit()
            cur.close()
            # Generate data following table dependency order
            self.initialize_inventory()
            self.generate_history()
            totals = self.generate_orders()
            # Order items, payments, comments generation can be added here once methods are implemented
            # self.generate_order_items(totals)
            # self.generate_payments()
            # self.generate_comments()
            self.logger.info("Data generation completed successfully")
            return True
        except Exception as e:
            self.logger.error(f"Generation error: {e}")
            return False
        finally:
            self.disconnect()


def main():
    print("Generador Optimizado de Datos Sintéticos (2021-2025)")
    try:
        vol = int(input("Multiplicador de volumen (2,5,10,20) [5]: ") or 5)
    except:
        vol = 5
    gen = SyntheticDataGenerator(volume_multiplier=vol)
    if gen.run():
        print("Generación completada con éxito")
    else:
        print("Error en la generación de datos")

if __name__ == "__main__":
    main()
