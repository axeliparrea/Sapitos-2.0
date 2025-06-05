#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Validación de Datos Sintéticos
========================================
Este script verifica que los datos sintéticos se insertaron correctamente
en SAP HANA y muestra estadísticas de los datos generados.
"""

import os
import sys
import datetime
from dotenv import load_dotenv

try:
    from hdbcli import dbapi
except ImportError:
    print("❌ Error: hdbcli no está instalado. Instálalo con: pip install hdbcli")
    sys.exit(1)

# Cargar variables de entorno
load_dotenv('../../backend/.env')

class DataValidator:
    def __init__(self):
        self.connection = None

    def connect_to_hana(self):
        """Conecta a la base de datos SAP HANA"""
        try:
            server_node = os.getenv('SERVER_NODE')
            username = os.getenv('DB_USERNAME')
            password = os.getenv('DB_PASSWORD')
            
            if not all([server_node, username, password]):
                raise ValueError("Faltan variables de entorno: SERVER_NODE, DB_USERNAME, DB_PASSWORD")
            
            # Split host and port if needed
            if ':' in server_node:
                host, port = server_node.split(':')
                self.connection = dbapi.connect(
                    address=host,
                    port=int(port),
                    user=username,
                    password=password
                )
            else:
                self.connection = dbapi.connect(
                    address=server_node,
                    user=username,
                    password=password
                )
            
            print("✅ Conectado exitosamente a SAP HANA")
            return True
            
        except Exception as e:
            print(f"❌ Error conectando a HANA: {e}")
            return False

    def disconnect_from_hana(self):
        """Desconecta de la base de datos SAP HANA"""
        if self.connection:
            self.connection.close()
            print("🔌 Desconectado de SAP HANA")

    def execute_query(self, query, description=""):
        """Ejecuta una consulta y retorna los resultados"""
        try:
            cursor = self.connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()
            return results
        except Exception as e:
            print(f"❌ Error en consulta {description}: {e}")
            return None

    def validate_basic_counts(self):
        """Valida los conteos básicos de registros"""
        print("\n📊 === CONTEOS DE REGISTROS ===")
        
        tables = {
            'Ordenes2': 'Órdenes',
            'OrdenesProductos2': 'Productos de Órdenes',
            'HistorialProductos2': 'Historial de Productos',
            'PagoOrden2': 'Pagos',
            'ComentariosOrdenes2': 'Comentarios'
        }
        
        for table, description in tables.items():
            query = f"SELECT COUNT(*) FROM {table}"
            result = self.execute_query(query, description)
            
            if result:
                count = result[0][0]
                print(f"📋 {description}: {count:,} registros")
            else:
                print(f"❌ Error obteniendo conteo de {description}")

    def validate_date_ranges(self):
        """Valida los rangos de fechas"""
        print("\n📅 === RANGOS DE FECHAS ===")
        
        # Fechas de órdenes
        query = """
        SELECT 
            MIN(FechaCreacion) as fecha_min,
            MAX(FechaCreacion) as fecha_max
        FROM Ordenes2
        """
        result = self.execute_query(query, "fechas de órdenes")
        
        if result:
            fecha_min, fecha_max = result[0]
            print(f"🗓️  Órdenes: {fecha_min} → {fecha_max}")
        
        # Fechas de historial
        query = """
        SELECT 
            MIN(Anio) as anio_min,
            MAX(Anio) as anio_max,
            MIN(Mes) as mes_min,
            MAX(Mes) as mes_max
        FROM HistorialProductos2
        """
        result = self.execute_query(query, "fechas de historial")
        
        if result:
            anio_min, anio_max, mes_min, mes_max = result[0]
            print(f"📊 Historial: {anio_min}/{mes_min} → {anio_max}/{mes_max}")

    def validate_business_logic(self):
        """Valida la lógica de negocio"""
        print("\n🧮 === VALIDACIÓN DE LÓGICA DE NEGOCIO ===")
        
        # Órdenes con productos
        query = """
        SELECT 
            COUNT(DISTINCT o.Orden_ID) as ordenes_con_productos,
            COUNT(DISTINCT o2.Orden_ID) as total_ordenes
        FROM Ordenes2 o2
        LEFT JOIN OrdenesProductos2 op ON o2.Orden_ID = op.Orden_ID
        LEFT JOIN Ordenes2 o ON op.Orden_ID = o.Orden_ID
        """
        result = self.execute_query(query, "órdenes con productos")
        
        if result:
            con_productos, total = result[0]
            porcentaje = (con_productos / total * 100) if total > 0 else 0
            print(f"📦 Órdenes con productos: {con_productos:,}/{total:,} ({porcentaje:.1f}%)")
        
        # Órdenes con pagos
        query = """
        SELECT 
            COUNT(DISTINCT p.Orden_ID) as ordenes_con_pago,
            COUNT(DISTINCT o.Orden_ID) as total_ordenes
        FROM Ordenes2 o
        LEFT JOIN PagoOrden2 p ON o.Orden_ID = p.Orden_ID
        """
        result = self.execute_query(query, "órdenes con pago")
        
        if result:
            with_payment = self.execute_query("SELECT COUNT(DISTINCT Orden_ID) FROM PagoOrden2")[0][0]
            total = self.execute_query("SELECT COUNT(*) FROM Ordenes2")[0][0]
            porcentaje = (with_payment / total * 100) if total > 0 else 0
            print(f"💳 Órdenes con pago: {with_payment:,}/{total:,} ({porcentaje:.1f}%)")
        
        # Órdenes con comentarios
        query = """
        SELECT COUNT(DISTINCT Orden_ID) FROM ComentariosOrdenes2
        """
        result = self.execute_query(query, "órdenes con comentarios")
        
        if result:
            with_comments = result[0][0]
            total = self.execute_query("SELECT COUNT(*) FROM Ordenes2")[0][0]
            porcentaje = (with_comments / total * 100) if total > 0 else 0
            print(f"💬 Órdenes con comentarios: {with_comments:,}/{total:,} ({porcentaje:.1f}%)")

    def validate_data_distribution(self):
        """Valida la distribución de datos"""
        print("\n📈 === DISTRIBUCIÓN DE DATOS ===")
        
        # Estados de órdenes
        query = """
        SELECT Estado, COUNT(*) as cantidad
        FROM Ordenes2
        GROUP BY Estado
        ORDER BY cantidad DESC
        """
        result = self.execute_query(query, "estados de órdenes")
        
        if result:
            print("📊 Estados de órdenes:")
            for estado, cantidad in result:
                print(f"   • {estado}: {cantidad:,}")
        
        # Métodos de pago
        query = """
        SELECT MetodoPago_ID, COUNT(*) as cantidad
        FROM Ordenes2
        GROUP BY MetodoPago_ID
        ORDER BY cantidad DESC
        """
        result = self.execute_query(query, "métodos de pago")
        
        if result:
            print("\n💳 Métodos de pago:")
            for metodo, cantidad in result:
                print(f"   • Método {metodo}: {cantidad:,}")

    def validate_totals_consistency(self):
        """Valida la consistencia de totales"""
        print("\n💰 === CONSISTENCIA DE TOTALES ===")
        
        # Verificar que los totales de órdenes coincidan con la suma de productos
        query = """
        SELECT 
            o.Orden_ID,
            o.Total as total_orden,
            COALESCE(SUM(op.Cantidad * op.PrecioUnitario), 0) as total_calculado
        FROM Ordenes2 o
        LEFT JOIN OrdenesProductos2 op ON o.Orden_ID = op.Orden_ID
        GROUP BY o.Orden_ID, o.Total
        HAVING ABS(o.Total - COALESCE(SUM(op.Cantidad * op.PrecioUnitario), 0)) > 0.01
        """
        result = self.execute_query(query, "consistencia de totales")
        
        if result:
            inconsistentes = len(result)
            total_ordenes = self.execute_query("SELECT COUNT(*) FROM Ordenes2")[0][0]
            print(f"⚠️  Órdenes con totales inconsistentes: {inconsistentes}/{total_ordenes}")
            
            if inconsistentes > 0 and inconsistentes <= 5:
                print("   Ejemplos:")
                for orden_id, total_orden, total_calc in result[:5]:
                    print(f"   • Orden {orden_id}: {total_orden} vs {total_calc}")
        else:
            print("✅ Todos los totales son consistentes")

    def generate_summary_report(self):
        """Genera un reporte resumen"""
        print("\n📋 === REPORTE RESUMEN ===")
        
        # Totales generales
        queries = {
            'órdenes': "SELECT COUNT(*) FROM Ordenes2",
            'productos': "SELECT COUNT(*) FROM OrdenesProductos2", 
            'historial': "SELECT COUNT(*) FROM HistorialProductos2",
            'pagos': "SELECT COUNT(*) FROM PagoOrden2",
            'comentarios': "SELECT COUNT(*) FROM ComentariosOrdenes2"
        }
        
        totals = {}
        for name, query in queries.items():
            result = self.execute_query(query)
            if result:
                totals[name] = result[0][0]
        
        print(f"📊 Total de registros generados: {sum(totals.values()):,}")
        print(f"   • Órdenes: {totals.get('órdenes', 0):,}")
        print(f"   • Productos en órdenes: {totals.get('productos', 0):,}")
        print(f"   • Registros de historial: {totals.get('historial', 0):,}")
        print(f"   • Pagos: {totals.get('pagos', 0):,}")
        print(f"   • Comentarios: {totals.get('comentarios', 0):,}")
        
        # Rango de fechas
        query = "SELECT MIN(FechaCreacion), MAX(FechaCreacion) FROM Ordenes2"
        result = self.execute_query(query)
        if result:
            fecha_min, fecha_max = result[0]
            print(f"📅 Período cubierto: {fecha_min} → {fecha_max}")

    def run_validation(self):
        """Ejecuta todas las validaciones"""
        print("🔍 VALIDADOR DE DATOS SINTÉTICOS")
        print("=" * 50)
        
        if not self.connect_to_hana():
            return False
        
        try:
            self.validate_basic_counts()
            self.validate_date_ranges()
            self.validate_business_logic()
            self.validate_data_distribution()
            self.validate_totals_consistency()
            self.generate_summary_report()
            
            print("\n✅ Validación completada exitosamente")
            return True
            
        except Exception as e:
            print(f"\n❌ Error durante la validación: {e}")
            return False
            
        finally:
            self.disconnect_from_hana()

def main():
    """Función principal"""
    try:
        validator = DataValidator()
        success = validator.run_validation()
        
        if not success:
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Validación interrumpida por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
