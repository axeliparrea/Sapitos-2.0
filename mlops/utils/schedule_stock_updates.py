"""
Stock Prediction Model Scheduler

This script sets up a scheduler to run the weekly stock update pipeline
at regular intervals (weekly by default). It uses APScheduler for scheduling.

Usage:
    python schedule_stock_updates.py

The script will run in the background, executing the weekly_stock_update.py 
script at the configured interval.
"""

import os
import sys
import time
import logging
import subprocess
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

# Import configuration
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import stock_update_config as config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'../logs/scheduler_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('stock_update_scheduler')

# Create logs directory if it doesn't exist
if not os.path.exists('../logs'):
    os.makedirs('../logs')
    logger.info("Created logs directory")

def run_stock_update_pipeline():
    """Run the weekly stock update pipeline"""
    try:
        logger.info("Starting weekly stock update pipeline execution")
        
        # Get the absolute path to the weekly_stock_update.py script
        script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        script_path = os.path.join(script_dir, 'pipelines', 'weekly_stock_update.py')
        
        # Run the script as a subprocess
        process = subprocess.Popen(
            [sys.executable, script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Capture output
        stdout, stderr = process.communicate()
        
        # Log output
        if stdout:
            logger.info(f"Pipeline output: {stdout.decode('utf-8')}")
        
        if stderr:
            logger.error(f"Pipeline errors: {stderr.decode('utf-8')}")
            
        # Check return code
        if process.returncode == 0:
            logger.info("Weekly stock update completed successfully")
        else:
            logger.error(f"Weekly stock update failed with return code {process.returncode}")
            
        return process.returncode == 0
        
    except Exception as e:
        logger.error(f"Error running weekly stock update: {e}")
        return False

def main():
    """Main function to set up and start the scheduler"""
    try:
        logger.info("Setting up scheduler for weekly stock updates")
        
        # Create a scheduler
        scheduler = BackgroundScheduler()
          # Schedule the job to run weekly based on configuration
        # Convert day number to day name (0=Monday, 1=Tuesday, etc.)
        day_names = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        day_of_week = day_names[config.SCHEDULE_DAY]
        
        scheduler.add_job(
            run_stock_update_pipeline,
            trigger=CronTrigger(
                day_of_week=day_of_week, 
                hour=config.SCHEDULE_HOUR, 
                minute=config.SCHEDULE_MINUTE
            ),
            id='stock_update_job',
            name='Weekly Stock Update Job',
            replace_existing=True
        )
        
        # Start the scheduler
        scheduler.start()
        logger.info("Scheduler started successfully")
        logger.info("Stock update pipeline will run weekly on Monday at 1:00 AM")
        
        # Run the pipeline once immediately to ensure everything works
        logger.info("Running initial stock update pipeline")
        success = run_stock_update_pipeline()
        if success:
            logger.info("Initial run completed successfully")
        else:
            logger.warning("Initial run failed, but scheduler will continue")
        
        # Keep the script running
        try:
            while True:
                time.sleep(3600)  # Sleep for 1 hour between checks
        except (KeyboardInterrupt, SystemExit):
            scheduler.shutdown()
            logger.info("Scheduler shutdown")
        
    except Exception as e:
        logger.error(f"Error in scheduler setup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
