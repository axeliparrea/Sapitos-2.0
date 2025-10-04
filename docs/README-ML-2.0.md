## Sapitos ML: Cómo funciona el sistema de Machine Learning

Este documento resume, de forma práctica y basada en el código del repo, cómo opera el pipeline de predicción de demanda y actualización de stock mínimo.

### Componentes clave del repo

- Python (mlops)
  - `mlops/pipelines/weekly_stock_update.py`: pipeline principal semanal.
  - `mlops/utils/schedule_stock_updates.py`: scheduler Python opcional (APScheduler).
  - `mlops/config/stock_update_config.py`: día/hora/min configurables para la ejecución.
  - `mlops/config/model_status.json`: estado del modelo (active/inactive) y última actualización.
  - `mlops/config/model_metrics.json`: métricas históricas (train/test) que el pipeline escribe.
  - `mlops/models/*.pkl`: modelos y encoders guardados por fecha.
  - `mlops/models/results/*.csv`: predicciones guardadas por fecha.
  - `mlops/logs/*.log`: logs del pipeline y del scheduler.
  - `mlops/requirements.txt`: dependencias Python.
- Backend (Node)
  - `backend/services/stockUpdateScheduler.js`: scheduler Node que corre el script Python según la config.
  - `backend/controllers/mlModelController.js`: endpoints reales para ejecutar, leer logs, estado, métricas.
  - `backend/controllers/mlModelControllerDev.js`: endpoints mock para desarrollo.
  - `backend/routes/ml.js`: rutas expuestas: `/ml/update`, `/ml/logs`, `/ml/schedule`, `/ml/status`, `/ml/toggle-status`, `/ml/metrics`.
  - `backend/server.js`: inicializa el scheduler (`initializeScheduler`).
- Frontend
  - `frontend/src/pages/admin/ModelManagement.jsx`: panel admin para ver estado, logs, schedule y métricas, y lanzar actualización manual.

### Flujo end-to-end (alto nivel)

1) Scheduler (Node) lee `mlops/config/stock_update_config.py` y programa un cron con `node-cron`.
2) A la hora indicada, el backend ejecuta el script `mlops/pipelines/weekly_stock_update.py` con Python (intenta `py`, `python`, `python3`).
3) El script Python:
   - Carga `.env` de `backend/.env` (credenciales HANA: `SERVER_NODE`, `DB_USERNAME`, `DB_PASSWORD`).
   - Conecta a SAP HANA mediante `hana_ml`.
   - Extrae tablas: `INVENTARIO2`, `HISTORIALPRODUCTOS2`, `ARTICULO2`, `ORDENESPRODUCTOS2`, `ORDENES2` (schema `DBADMIN`).
   - Prepara datos de ventas mensuales y features (mes sen/cos, encoders de producto y ubicación).
   - Entrena `XGBRegressor` (XGBoost), evalúa y registra métricas (MAE, RMSE) en `model_metrics.json`.
   - Predice demanda del próximo período por producto/ubicación y calcula `stock_min_nuevo` con un factor de seguridad `SAFETY_FACTOR` (config).
   - Actualiza `DBADMIN.INVENTARIO2` (`STOCKMINIMO`) vía SQL.
   - Guarda modelo/encoders/predicciones y escribe logs.
4) Al terminar, el scheduler Node actualiza `mlops/config/model_status.json` con estado y timestamp.
5) El frontend consulta `/ml/status`, `/ml/logs`, `/ml/schedule`, `/ml/metrics` para mostrar todo en la UI admin.

### Diagrama simple del pipeline

```mermaid
flowchart LR
  A[Scheduler Node (cron)] -->|spawn Python| B[weekly_stock_update.py]
  B --> C[Conexión HANA (hana_ml)]
  C --> D[Extracción tablas DBADMIN]
  D --> E[Feature engineering]
  E --> F[Entrenamiento XGBoost]
  F --> G[Predicción próxima ventana]
  G --> H[Calcula STOCKMINIMO (safety factor)]
  H --> I[UPDATE DBADMIN.INVENTARIO2]
  F --> J[Escribe métricas model_metrics.json]
  B --> K[Guarda modelo/encoders/predicciones]
  B --> L[Logs mlops/logs]
  A --> M[Actualiza model_status.json]
  subgraph Frontend Admin
    N[/GET /ml/status\nGET /ml/logs\nGET /ml/schedule\nGET /ml/metrics\nPOST /ml/update/]
  end
  M -.-> N
  L -.-> N
  J -.-> N
```

### Detalles técnicos por etapa

- Conexión y datos
  - Carga `.env` desde `backend/.env` con `python-dotenv`.
  - Tablas usadas (en mayúsculas por sensibilidad de HANA): `INVENTARIO2`, `HISTORIALPRODUCTOS2`, `ARTICULO2`, `ORDENESPRODUCTOS2`, `ORDENES2`.
  - Combina dataframes y normaliza nombres de columnas.

- Features y modelo
  - Features: `loc_enc`, `prod_enc`, `year`, `month`, `month_sin`, `month_cos`.
  - Target: `unidades_vendidas` (ventas mensuales agregadas).
  - Modelo: `XGBRegressor` con hiperparámetros básicos (100 árboles, profundidad 3).
  - Métricas: MAE y RMSE en último período hold-out; persiste en `mlops/config/model_metrics.json`.

- Cálculo de stock mínimo
  - Predicciones enteras no negativas por producto/ubicación.
  - `stock_min_nuevo = unidades_pred * SAFETY_FACTOR` (redondeo y mínimo 1).
  - Actualización por lotes: `UPDATE DBADMIN.INVENTARIO2 SET STOCKMINIMO = ... WHERE INVENTARIO_ID = ...`.

### Endpoints backend (protegidos)

- POST `/ml/update` — Ejecuta pipeline manualmente.
- GET `/ml/logs` — Devuelve el último log `weekly_stock_update_*.log`.
- GET `/ml/schedule` — Lee la configuración `stock_update_config.py` y calcula próxima corrida.
- GET `/ml/status` — Lee `model_status.json` o infiere por logs.
- POST `/ml/toggle-status` — Cambia estado (active/inactive) persistiendo en `model_status.json`.
- GET `/ml/metrics` — Devuelve arrays `training`/`test` desde `model_metrics.json`.

Todos requieren rol `admin` y OTP (ver middlewares `auth` y `requireOtp`).

### Requisitos y setup rápido (Windows PowerShell)

1) Python y dependencias
   - Instala Python 3.8+ y crea un venv (opcional).
   - Instala dependencias:
     - En la carpeta `mlops` usa `mlops/requirements.txt`.

2) Variables de entorno
   - Define en `backend/.env` (no subas credenciales reales al repo):
     - `SERVER_NODE=host:port`
     - `DB_USERNAME=...`
     - `DB_PASSWORD=...`

3) Ejecutar manualmente el pipeline (opcional)
   - Desde `mlops/pipelines`, corre `weekly_stock_update.py` con tu intérprete de Python.

4) Servidor y scheduler Node
   - Levanta el backend; `server.js` inicializa el scheduler Node que programará el script Python.

Nota: el scheduler Node intenta `py`, `python`, luego `python3`. Asegúrate de tener uno disponible en PATH.

### Observabilidad

- Logs: `mlops/logs/weekly_stock_update_YYYYMMDD.log` (Python) y `backend/logs/app_*.log` (Node).
- Métricas históricas: `mlops/config/model_metrics.json` (consumidas por el frontend admin para gráficos).
- Estado del modelo: `mlops/config/model_status.json`.

### Consideraciones y límites

- Conectividad HANA: verifica certificados/puertos y schema correcto (`DBADMIN`).
- Volumen de datos: el script usa `collect()` a pandas; para grandes volúmenes, considerar push-down/queries paginadas.
- Robustez de UPDATE: hoy hace updates por fila; para alto throughput, considerar procedimientos o batch masivo.
- Mantenibilidad: parametrizar más hiperparámetros/modelos y versionar artefactos en un registro.

### Próximos pasos sugeridos

- Orquestación: mover scheduling totalmente a backend o a un job runner externo (Azure/AWS/GCP) con colas/reintentos.
- Métricas: añadir MAPE, cobertura de predicciones y dashboards en frontend.
- Validación de datos: endurecer `validate_data.py` antes de entrenar.
- Batch UPDATE optimizado en HANA (procedimientos/merge transaccional).
