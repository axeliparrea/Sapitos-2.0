"""
Test script for the weekly stock update pipeline.

This script tests the stock update pipeline without actually making
database updates. It's useful for verifying that the pipeline works correctly
before scheduling it to run automatically.
"""

import os
import sys
import logging
from datetime import datetime

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

# Import the pipeline class
from pipelines.weekly_stock_update import WeeklyStockUpdate

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'../logs/test_pipeline_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('test_pipeline')

# Create directories if they don't exist
for directory in ['../logs', '../models', '../models/results']:
    if not os.path.exists(directory):
        os.makedirs(directory)
        logger.info(f"Created directory: {directory}")

def test_pipeline_without_db_update():
    """
    Test the pipeline without updating the database
    """
    logger.info("Starting pipeline test (without database updates)")
    
    # Create the updater but override the update_database method
    updater = WeeklyStockUpdate()
    
    # Store the original update_database method
    original_update_database = updater.update_database
    
    # Override the update_database method to skip actual updates
    def mock_update_database(df_update):
        logger.info(f"[TEST] Would update {len(df_update)} records in database (skipped)")
        logger.info("Sample updates (first 5):")
        for i, row in df_update.head(5).iterrows():
            logger.info(f"  {row['articulo_id']} @ {row['location_id']}: {row.get('stock_min_actual')} -> {row['stock_min_nuevo']}")
        return len(df_update)
    
    # Replace the method
    updater.update_database = mock_update_database
    
    # Run the pipeline
    success = updater.run_pipeline()
    
    # Restore the original method
    updater.update_database = original_update_database
    
    return success

def main():
    """
    Main test function
    """
    logger.info("Starting pipeline test")
    
    # Run the test
    success = test_pipeline_without_db_update()
    
    if success:
        logger.info("Pipeline test completed successfully")
    else:
        logger.error("Pipeline test failed")
        
    return success

if __name__ == "__main__":
    main()
