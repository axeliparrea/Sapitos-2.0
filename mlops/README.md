# ML Stock Prediction System

This system automates the prediction of product demand and updates stock minimum levels in the database on a weekly basis.

## Overview

The stock prediction system consists of several components:

1. **Weekly Stock Update Pipeline**: A Python script that connects to the database, trains a prediction model using XGBoost, predicts future demand, and updates the `stock_minimo` values in the database.

2. **Scheduler**: A background process that runs the pipeline weekly.

3. **Models and Results Storage**: The trained models and prediction results are stored for reference and analysis.

## Architecture

```
mlops/
├── api/
├── config/
├── models/          # Stores trained models and encoders
│   └── results/     # Stores prediction results and alerts
├── pipelines/
│   ├── db_fill.ipynb
│   ├── sap_master.ipynb
│   └── weekly_stock_update.py     # Main prediction pipeline
├── logs/            # Log files from pipeline and scheduler
└── utils/
    └── schedule_stock_updates.py  # Scheduler script
```

## Features

### Weekly Model Training

- The system automatically retrains the model each week using the most recent data from the database.
- This ensures that the model adapts to changing patterns in product demand over time.
- Model performance metrics are logged for tracking and improvement.

### Stock Minimum Prediction

- The model predicts product demand for the upcoming period.
- Stock minimum values are calculated based on the predictions with an added safety margin (20% by default).
- These values are then updated directly in the database.

### Prevention Adjustments

- The system includes safety factors to prevent stockouts.
- A minimum threshold ensures stock levels are never set too low.
- Historical data informs the prediction to account for seasonality.

## How It Works

1. **Data Collection**: The pipeline connects to the HANA database and extracts relevant data from inventory, historical products, articles, orders, and orders_products tables.

2. **Data Processing**: The data is cleaned, merged, and prepared for modeling.

3. **Feature Engineering**: Features are created to capture temporal patterns, seasonality, and product-location relationships.

4. **Model Training**: An XGBoost regression model is trained on historical sales data.

5. **Prediction**: The model predicts future demand for each product-location combination.

6. **Stock Minimum Update**: New stock minimum levels are calculated based on the predictions.

7. **Database Update**: The `STOCKMINIMO` column in the `INVENTARIO2` table is updated with the new values.

8. **Storage and Logging**: Models, predictions, and logs are saved for future reference.

## Running the System

### Prerequisites

- Python 3.8+
- Database connection credentials in `.env` file
- Required Python packages:
  - hana_ml
  - pandas
  - numpy
  - scikit-learn
  - xgboost
  - apscheduler
  - python-dotenv

### Starting the Scheduler

To start the weekly updates:

```bash
cd mlops/utils
python schedule_stock_updates.py
```

The scheduler will:
- Run the stock update pipeline immediately
- Schedule future runs for every Monday at 1:00 AM
- Keep running in the background

### Manual Pipeline Execution

To run the pipeline manually:

```bash
cd mlops/pipelines
python weekly_stock_update.py
```

## Maintenance and Monitoring

- Check the log files in `mlops/logs/` for any errors or warnings.
- Review prediction accuracy by comparing actual sales with predicted values.
- Adjust the safety factor in the `WeeklyStockUpdate` class if stockouts or excess inventory are occurring.

## Future Improvements

- Add API endpoints to trigger updates on demand
- Create visualization dashboards for prediction accuracy
- Implement anomaly detection for unusual demand patterns
- Expand features to include external factors (seasonality, promotions, etc.)
- Add A/B testing for different prediction models
