# Stock Update Pipeline Configuration

# Safety factor to apply to predicted demand (1.2 = 20% safety margin)
SAFETY_FACTOR = 1.2

# Minimum value for stock_minimo to prevent setting it too low
MIN_STOCK_VALUE = 1

# Number of previous months to use for training
TRAINING_MONTHS = 6

# Model parameters
MODEL_PARAMS = {
    "n_estimators": 100,
    "max_depth": 3,
    "learning_rate": 0.1,
    "random_state": 42
}

# Schedule parameters (day of week: 0=Monday, 6=Sunday)
SCHEDULE_DAY = 0  # Monday
SCHEDULE_HOUR = 1  # 1:00 AM
SCHEDULE_MINUTE = 0

# Database schema
DB_SCHEMA = "DBADMIN"

# Table names
TABLES = {
    "INVENTORY": "INVENTARIO2",
    "HISTORY": "HISTORIALPRODUCTOS2",
    "ARTICLE": "ARTICULO2",
    "ORDERS_PRODUCTS": "ORDENESPRODUCTOS2",
    "ORDERS": "ORDENES2"
}

# File paths
PATHS = {
    "MODELS": "../models",
    "RESULTS": "../models/results",
    "LOGS": "../logs"
}
