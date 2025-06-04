"""
Weekly Stock Minimum Update Pipeline

This script performs the following operations:
1. Connects to the database and extracts necessary data
2. Trains/retrains the inventory prediction model using the most recent data
3. Makes predictions for the upcoming period
4. Updates the stock_minimo values in the database based on predictions
5. Saves the model for future use

This script is designed to be run weekly via a scheduler.
"""

import os
import sys
import pickle
import datetime
import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error
import hana_ml
import hana_ml.dataframe as dataframe
from dotenv import load_dotenv
import logging

# Import configuration
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import stock_update_config as config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'../logs/weekly_stock_update_{datetime.datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('weekly_stock_update')

def create_directory_if_not_exists(directory):
    """Create directory if it doesn't exist"""
    if not os.path.exists(directory):
        os.makedirs(directory)
        logger.info(f"Created directory: {directory}")

# Ensure necessary directories exist
create_directory_if_not_exists('../logs')
create_directory_if_not_exists('../models')
create_directory_if_not_exists('../models/results')

class WeeklyStockUpdate:
    """Class to handle weekly stock minimum updates based on ML predictions"""
    
    def __init__(self):
        """Initialize the weekly stock update process"""
        self.conn = None
        self.model = None
        self.le_loc = None
        self.le_prod = None
        self.features = ['loc_enc', 'prod_enc', 'year', 'month', 'month_sin', 'month_cos']
        self.target = 'unidades_vendidas'
        self.safety_factor = config.SAFETY_FACTOR  # Load from config
        
    def connect_to_database(self):
        """Connect to the HANA database"""
        try:
            logger.info("Loading environment variables")
            load_dotenv('../.env')
            
            logger.info("Connecting to database")
            self.conn = dataframe.ConnectionContext(
                address=os.getenv('HANA_HOST'),
                port=int(os.getenv('HANA_PORT', 443)),
                user=os.getenv('HANA_USER'),
                password=os.getenv('HANA_PASSWORD')
            )
            
            if self.conn.connection.isconnected():
                logger.info(f"Successfully connected to database. Schema: {self.conn.get_current_schema()}")
                return True
            else:
                logger.error("Failed to connect to database")
                return False
        except Exception as e:
            logger.error(f"Error connecting to database: {e}")
            return False
    
    def fetch_data(self):
        """Fetch required data from the database"""
        try:
            logger.info("Fetching data from database")
            
            # Get the real table names with correct case sensitivity
            table_inventory = 'INVENTARIO2'
            table_history = 'HISTORIALPRODUCTOS2'
            table_article = 'ARTICULO2'
            table_orders_products = 'ORDENESPRODUCTOS2'
            table_orders = 'ORDENES2'
            
            # Load tables as HANA ML DataFrames
            inventario_df = self.conn.table(table_inventory, schema='DBADMIN')
            historial_df = self.conn.table(table_history, schema='DBADMIN')
            articulo_df = self.conn.table(table_article, schema='DBADMIN')
            ordenes_productos_df = self.conn.table(table_orders_products, schema='DBADMIN')
            ordenes_df = self.conn.table(table_orders, schema='DBADMIN')
            
            # Convert to pandas DataFrames
            inventario_pd = inventario_df.collect()
            historial_pd = historial_df.collect()
            articulo_pd = articulo_df.collect()
            ordenes_productos_pd = ordenes_productos_df.collect()
            ordenes_pd = ordenes_df.collect()
            
            logger.info(f"Data fetched successfully. Inventory rows: {len(inventario_pd)}")
            
            # Check if we need to handle case sensitivity in column names
            inventario_id_col = [col for col in inventario_pd.columns if col.upper() == 'INVENTARIO_ID'][0]
            articulo_id_col = [col for col in articulo_pd.columns if col.upper() == 'ARTICULO_ID'][0]
            orden_id_col = [col for col in ordenes_pd.columns if col.upper() == 'ORDEN_ID'][0]
            
            # Merge DataFrames (use left joins to retain inventory even if no matching records)
            df = inventario_pd.merge(historial_pd, on=inventario_id_col, how='left') \
                          .merge(articulo_pd, on=articulo_id_col, how='left') \
                          .merge(ordenes_productos_pd, on=inventario_id_col, how='left') \
                          .merge(ordenes_pd, on=orden_id_col, how='left')
            
            # Clean up column names and select relevant ones
            df_clean = df[[
                'INVENTARIO_ID',
                'ARTICULO_ID', 
                'LOCATION_ID_x',  # Using _x version from inventario table
                'STOCKACTUAL',
                'STOCKMINIMO',
                'STOCKRECOMENDADO',
                'MARGENGANANCIA',
                'TIEMPOREPOSICION_x',
                'STOCKSEGURIDAD',
                'DEMANDAPROMEDIO',
                'ANIO',
                'MES', 
                'IMPORTACION_y',  # Using _y version from historial table
                'EXPORTACION_y',
                'STOCKSTART',
                'STOCKEND',
                'CATEGORIA',
                'PRECIOPROVEEDOR',
                'PRECIOVENTA',
                'TEMPORADA',
                'CANTIDAD',
                'PRECIOUNITARIO',
                'FECHACREACION',
                'FECHAENTREGA',
                'TIPOORDEN'
            ]].copy()
            
            # Rename columns to remove suffixes and have consistent naming
            df_clean = df_clean.rename(columns={
                'LOCATION_ID_x': 'LOCATION_ID',
                'IMPORTACION_y': 'IMPORTACION',
                'EXPORTACION_y': 'EXPORTACION',
                'TIEMPOREPOSICION_x': 'TIEMPOREPOSICION'
            })
            
            logger.info(f"Data processed successfully. Final rows: {len(df_clean)}")
            return df_clean
        
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            return None
    
    def prepare_sales_data(self, df):
        """Prepare sales data for modeling"""
        try:
            logger.info("Preparing sales data for modeling")
            
            # Create sales DataFrame
            df_ventas = df.copy()
            
            # Aggregate by product, location, year, and month to calculate total sales
            df_ventas_agrupado = df_ventas.groupby(['ARTICULO_ID', 'LOCATION_ID', 'ANIO', 'MES'])[
                'EXPORTACION'].sum().reset_index()
            
            # Rename columns for consistency
            df_ventas_agrupado = df_ventas_agrupado.rename(columns={
                'ARTICULO_ID': 'articulo_id',
                'LOCATION_ID': 'location_id',
                'ANIO': 'year',
                'MES': 'month',
                'EXPORTACION': 'unidades_vendidas'
            })
            
            # Create date column for temporal analysis
            df_ventas_agrupado['date'] = pd.to_datetime(
                df_ventas_agrupado['year'].astype(str) + '-' + 
                df_ventas_agrupado['month'].astype(str).str.zfill(2) + '-01'
            )
            
            logger.info(f"Sales data prepared. Records: {len(df_ventas_agrupado)}")
            return df_ventas_agrupado
        
        except Exception as e:
            logger.error(f"Error preparing sales data: {e}")
            return None
    
    def perform_feature_engineering(self, df_sales):
        """Perform feature engineering for the model"""
        try:
            logger.info("Performing feature engineering")
            
            # Create copy for modeling
            df_model = df_sales.copy()
            
            # Cyclic transformations for month (capture seasonality)
            df_model['month_sin'] = np.sin(2 * np.pi * (df_model['month'] - 1) / 12)
            df_model['month_cos'] = np.cos(2 * np.pi * (df_model['month'] - 1) / 12)
            
            # Apply encoding to categorical variables
            self.le_loc = LabelEncoder()
            self.le_prod = LabelEncoder()
            df_model['loc_enc'] = self.le_loc.fit_transform(df_model['location_id'])
            df_model['prod_enc'] = self.le_prod.fit_transform(df_model['articulo_id'])
            
            logger.info(f"Feature engineering completed. Features: {self.features}")
            return df_model
        
        except Exception as e:
            logger.error(f"Error in feature engineering: {e}")
            return None
    
    def train_model(self, df_model):
        """Train the prediction model"""
        try:
            logger.info("Training prediction model")
            
            # Identify the last period of data to separate training and testing
            ultimo_periodo = df_model['date'].max()
            logger.info(f"Last available period: {ultimo_periodo}")
            
            # Separate training data (all except the last month)
            train_data = df_model[df_model['date'] < ultimo_periodo]
            test_data = df_model[df_model['date'] == ultimo_periodo].copy()
            
            logger.info(f"Training data: {len(train_data)} records")
            logger.info(f"Test data: {len(test_data)} records")
            
            # Verify that there's enough data for training
            if len(train_data) > 10:  # Arbitrary threshold, adjust as needed
                # Prepare training sets
                X_train = train_data[self.features]
                y_train = train_data[self.target]
                
                # Train XGBoost model
                self.model = XGBRegressor(
                    n_estimators=100,
                    max_depth=3,
                    learning_rate=0.1,
                    random_state=42
                )
                self.model.fit(X_train, y_train)
                logger.info("XGBoost model trained successfully")
                
                # Evaluate on test data if available
                if len(test_data) > 0:
                    X_test = test_data[self.features]
                    y_test = test_data[self.target]
                    y_pred = self.model.predict(X_test)
                    
                    # Convert predictions to integers
                    test_data['unidades_pred'] = y_pred.round().astype(int)
                    
                    # Show accuracy metrics
                    mae = mean_absolute_error(y_test, y_pred)
                    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
                    
                    logger.info(f"Evaluation results:")
                    logger.info(f"Mean Absolute Error (MAE): {mae:.2f}")
                    logger.info(f"Root Mean Squared Error (RMSE): {rmse:.2f}")
                
                return True
            else:
                logger.warning("Not enough data for training")
                return False
        
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return False
    
    def predict_next_period(self, df_model):
        """Predict sales for the next period"""
        try:
            logger.info("Preparing next period prediction")
            
            # Get the last period in the data
            ultimo_periodo = df_model['date'].max()
            
            # Prepare next period for prediction
            next_month_date = ultimo_periodo + pd.DateOffset(months=1)
            next_year = next_month_date.year
            next_month = next_month_date.month
            
            # Get unique list of articles and locations
            unique_articles = df_model['articulo_id'].unique()
            unique_locations = df_model['location_id'].unique()
            
            logger.info(f"Preparing predictions for next period: {next_month_date.strftime('%Y-%m-%d')}")
            logger.info(f"Total articles: {len(unique_articles)}")
            logger.info(f"Total locations: {len(unique_locations)}")
            
            # Create data for future prediction
            pred_list = []
            for loc in unique_locations:
                for prod in unique_articles:
                    pred_list.append({
                        'location_id': loc,
                        'articulo_id': prod,
                        'date': next_month_date,
                        'year': next_year,
                        'month': next_month,
                        'month_sin': np.sin(2 * np.pi * (next_month - 1) / 12),
                        'month_cos': np.cos(2 * np.pi * (next_month - 1) / 12),
                        'loc_enc': self.le_loc.transform([loc])[0],
                        'prod_enc': self.le_prod.transform([prod])[0]
                    })
            
            # Create DataFrame for prediction
            df_next = pd.DataFrame(pred_list)
            X_next = df_next[self.features]
            
            # Make predictions for the next period
            df_next['unidades_pred'] = self.model.predict(X_next).round().astype(int)
            # Ensure predictions are positive
            df_next['unidades_pred'] = df_next['unidades_pred'].clip(lower=0)
            
            logger.info(f"Predictions completed. Total predictions: {len(df_next)}")
            return df_next
        
        except Exception as e:
            logger.error(f"Error predicting next period: {e}")
            return None
    def calculate_new_stock_minimums(self, df_next, df):
        """Calculate new stock minimums based on predictions"""
        try:
            logger.info("Calculating new stock minimums")
            
            # Extract relevant columns from inventory
            df_inventory = df[['ARTICULO_ID', 'LOCATION_ID', 'STOCKACTUAL', 'STOCKMINIMO']].copy()
            
            # Rename columns for consistency
            df_inventory = df_inventory.rename(columns={
                'ARTICULO_ID': 'articulo_id',
                'LOCATION_ID': 'location_id',
                'STOCKACTUAL': 'stock_actual',
                'STOCKMINIMO': 'stock_min_actual'
            })
            
            # Remove duplicates (keeping one record per article/location)
            df_inventory = df_inventory.drop_duplicates(subset=['articulo_id', 'location_id'])
            
            # Join inventory data with predictions
            df_update = df_next.merge(df_inventory, on=['articulo_id', 'location_id'], how='left')
            
            # Calculate new recommended minimum stock based on predictions
            # Add safety margin
            df_update['stock_min_nuevo'] = (df_update['unidades_pred'] * self.safety_factor).round().astype(int)
            
            logger.info(f"Calculation completed. New stock minimums calculated for {len(df_update)} products")
            
            return df_update
        
        except Exception as e:
            logger.error(f"Error calculating new stock minimums: {e}")
            return None
    
    def update_database(self, df_update):
        """Update the stock_minimo values in the database"""
        try:
            logger.info("Updating stock_minimo values in database")
            
            # Prepare update data
            updates = []
            for _, row in df_update.iterrows():
                inventario_id = row['INVENTARIO_ID'] if 'INVENTARIO_ID' in row else None
                if inventario_id is None:
                    # If we don't have the Inventario_ID, we need to find it from the database
                    # This would be unusual since we should have merged with the inventory table
                    continue
                
                stock_min_nuevo = max(1, row['stock_min_nuevo'])  # Ensure minimum value of 1
                
                updates.append({
                    'INVENTARIO_ID': inventario_id,
                    'STOCKMINIMO': stock_min_nuevo
                })
            
            # Create a dataframe to handle the updates in batch
            updates_df = pd.DataFrame(updates)
            
            if len(updates_df) == 0:
                logger.warning("No updates to perform")
                return 0
            
            # Log the first few updates for debugging
            logger.info(f"Sample updates (first 5 of {len(updates_df)}):")
            for _, row in updates_df.head(5).iterrows():
                logger.info(f"  Inventory ID: {row['INVENTARIO_ID']}, New Stock Min: {row['STOCKMINIMO']}")
            
            # Perform the database update
            for _, row in updates_df.iterrows():
                update_query = f"""
                UPDATE DBADMIN.INVENTARIO2 
                SET STOCKMINIMO = {row['STOCKMINIMO']} 
                WHERE INVENTARIO_ID = {row['INVENTARIO_ID']}
                """
                self.conn.sql(update_query)
            
            logger.info(f"Updated {len(updates_df)} records in database")
            return len(updates_df)
        
        except Exception as e:
            logger.error(f"Error updating database: {e}")
            return 0
    def save_model_and_results(self, df_update):
        """Save the model and results for future use"""
        try:
            today_str = datetime.datetime.now().strftime("%Y%m%d")
            
            # Save the trained model
            model_path = os.path.join('../models', f'inventory_prediction_model_{today_str}.pkl')
            with open(model_path, 'wb') as f:
                pickle.dump(self.model, f)
            
            # Save encoders for future use
            encoders_path = os.path.join('../models', f'inventory_encoders_{today_str}.pkl')
            encoders = {
                'location_encoder': self.le_loc,
                'product_encoder': self.le_prod
            }
            with open(encoders_path, 'wb') as f:
                pickle.dump(encoders, f)
            
            # Save predictions
            predictions_path = os.path.join('../models/results', f'predictions_{today_str}.csv')
            df_update.to_csv(predictions_path, index=False)
            
            logger.info(f"Model saved to: {model_path}")
            logger.info(f"Encoders saved to: {encoders_path}")
            logger.info(f"Predictions saved to: {predictions_path}")
            
            return True
        
        except Exception as e:
            logger.error(f"Error saving model and results: {e}")
            return False
    
    def run_pipeline(self):
        """Run the entire pipeline"""
        logger.info("Starting weekly stock update pipeline")
        
        # Connect to database
        if not self.connect_to_database():
            logger.error("Database connection failed. Exiting pipeline.")
            return False
        
        # Fetch data
        df = self.fetch_data()
        if df is None or len(df) == 0:
            logger.error("Data fetching failed. Exiting pipeline.")
            return False
        
        # Prepare sales data
        df_sales = self.prepare_sales_data(df)
        if df_sales is None:
            logger.error("Sales data preparation failed. Exiting pipeline.")
            return False
        
        # Feature engineering
        df_model = self.perform_feature_engineering(df_sales)
        if df_model is None:
            logger.error("Feature engineering failed. Exiting pipeline.")
            return False
        
        # Train model
        if not self.train_model(df_model):
            logger.error("Model training failed. Exiting pipeline.")
            return False
        
        # Predict next period
        df_next = self.predict_next_period(df_model)
        if df_next is None:
            logger.error("Prediction failed. Exiting pipeline.")
            return False
        
        # Calculate new stock minimums
        df_update = self.calculate_new_stock_minimums(df_next, df)
        if df_update is None:
            logger.error("Stock minimum calculation failed. Exiting pipeline.")
            return False
        
        # Update database
        update_count = self.update_database(df_update)
        if update_count == 0:
            logger.warning("No database updates performed.")
        
        # Save model and results
        self.save_model_and_results(df_update)
        
        logger.info("Weekly stock update pipeline completed successfully")
        return True


# Main execution
if __name__ == "__main__":
    updater = WeeklyStockUpdate()
    success = updater.run_pipeline()
    sys.exit(0 if success else 1)
