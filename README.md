## Prerequisites  
Before running the project, ensure you have the following:  

- **Node.js**: Version 16 or higher  
- **Backend `.env` file**: Ensure it's correctly configured  
- **HANA Instance**: Must be running  

---

## How to Run the Project h 

### **1️. Start the Backend**  
_Open a terminal and run:_  
```sh
cd backend
npm install
npx nodemon server.js
```

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

///////Test/////

Pruebas Unitarias - Proyecto SAPATOS

Este proyecto contiene pruebas unitarias para backend (Node.js con Express) y frontend (React con Vite) utilizando Jest, Vitest, y Testing Library.

Estructura del proyecto

Sapatos/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── tests/            Pruebas backend con Jest
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/   Componentes y pruebas con Vitest
│   │   └── ...
│   └── ...

🔧 Requisitos Previos

- Node.js ≥ 18.x
- NPM ≥ 9.x

Instalación de dependencias

Backend
```bash
cd backend
npm install
```

Frontend
```bash
cd ../frontend
npm install
```

Pruebas del Backend

Herramientas
- Jest para pruebas unitarias
- supertest para pruebas de rutas

Ubicación
Todas las pruebas están en la carpeta backend/tests/.

▶ Ejecutar pruebas
```bash
cd backend
npm test
```

Asegúrate de que tu base de datos esté desconectada o mockeada, ya que se utilizan mocks para db y no se requiere conexión real.

Pruebas del Frontend

Herramientas
- Vitest como test runner
- @testing-library/react para pruebas de componentes
- @testing-library/jest-dom para matchers extendidos

Ubicación
Las pruebas están en:
frontend/src/components/*.test.jsx

Ejecutar pruebas
```bash
cd frontend
npx vitest run
```

Ejecutar pruebas en modo interactivo (watch)
```bash
npx vitest
```

Linter (Frontend y Backend)

Backend (ESLint con CommonJS)
```bash
cd backend
npm run lint
```

Frontend (ESLint con Flat Config y React)
```bash
cd frontend
npm run lint
```

Notas

- Las llamadas a axios y db están mockeadas para evitar dependencia de servicios externos.
- Puedes extender las pruebas cubriendo formularios, rutas protegidas, y validaciones.
