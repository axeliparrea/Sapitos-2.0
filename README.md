## Prerequisites  
Before running the project, ensure you have the following:  

- **Node.js**: Version 16 or higher  
- **Python**: Version 3.8 or higher (for ML functionality)
- **Backend `.env` file**: Ensure it's correctly configured  
- **HANA Instance**: Must be running  
- **Python libraries**: Required for ML functionality (`hana_ml`, `pandas`, `numpy`, `scikit-learn`, `xgboost`, `python-dotenv`)

---

## How to Run the Project  

### **1️. Start the Backend**  
_Open a terminal and run:_  
```sh
cd backend
npm install
npm npx nodemon server.js
```

The backend includes the ML model scheduler which will automatically run weekly. The scheduler will:
- Automatically run the stock prediction model every Monday at 1:00 AM
- Update `stock_minimo` values in the database based on predictions
- Log all activities to `mlops/logs`

### **ML Model Management**

The system includes an ML management API with the following endpoints:
- `POST /ml/update`: Trigger a manual model update (admin only)
- `GET /ml/logs`: View logs from the last model run (admin only)
- `GET /ml/schedule`: Check when the next scheduled update will run (admin only)

In development environments without the full ML setup, the system uses a simulation mode that provides dummy data without requiring Python or the full ML stack.

### **2. Start the Frontend**  
_Open a second terminal and run:_  
```sh
cd frontend
npm install
npm run dev
```

### **3. Open them in browser**  
_Backend:_  http://localhost:5000/api-docs

_Frontend:_  http://localhost:5173

