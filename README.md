# 🚀 Sapitos 2.0: Next-Gen Inventory & Order Management Platform

![Sapitos Logo](frontend/public/assets/images/logo.png)

## ✨ Overview
Sapitos 2.0 is a full-stack, role-based inventory and order management system designed for modern businesses. Built with a robust Node.js/Express backend, a beautiful React + Vite frontend, and a powerful SAP HANA database, it delivers a seamless, real-time experience for admins, owners, clients, and suppliers.

---

## 📦 Requirements
- **Node.js** v16 or higher
- **npm** (comes with Node.js)
- **SAP HANA** instance (running and accessible)
- **.env** files for backend configuration (see below)

### Backend `.env` Example
```env
SERVER_NODE=your-hana-server:port
DB_USERNAME=your-hana-username
DB_PASSWORD=your-hana-password
BACK_PORT=5000
JWT_SECRET=your-secret
```

---

## 🚀 How to Use

### 1. Clone the repository
```sh
git clone https://github.com/your-org/sapitos-2.0.git
cd sapitos-2.0
```

### 2. Install dependencies
```sh
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables
- Copy the example above to `backend/.env` and fill in your SAP HANA credentials.

### 4. Start the backend
```sh
cd backend
npx nodemon server.js
```

### 5. Start the frontend
```sh
cd ../frontend
npm run dev
```

### 6. Access the app
- **API Docs:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Frontend UI:** [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Bootstrap 5, ApexCharts, DnD Kit, React-Icons, SweetAlert2, React-Quill, and more
- **Backend:** Node.js, Express, SAP HANA Client, JWT Auth, Swagger, CORS, dotenv
- **Database:** SAP HANA (with advanced triggers, metrics, and custom SQL scripts)
- **API Docs:** Swagger UI ([http://localhost:5000/api-docs](http://localhost:5000/api-docs))

---

## 📁 Project Structure
```text
Sapitos-2.0/
├── backend/         # Node.js/Express API, Auth, Swagger, Controllers
├── frontend/        # Vite + React, UI, Role-based Dashboards
├── Database/        # SAP HANA SQL scripts, triggers, table creation
└── README.md        # This file
```

---

## 🎨 Features That Impress
- **Role-based Dashboards:** Admin, Owner, Client, and Supplier each get a tailored experience
- **Modern UI:** Responsive, mobile-friendly, and visually stunning (Bootstrap, custom CSS, Remix Icons)
- **Inventory Management:** Advanced filtering, CSV export, real-time stock status, and analytics
- **Order Management:** Create, track, and manage orders with status flows and supplier integration
- **User Management:** Secure registration, login, JWT sessions, profile image upload, and CRUD
- **Data Visualization:** Interactive charts (ApexCharts) for sales, inventory, and supplier performance
- **API-first:** Fully documented REST API with Swagger
- **SAP HANA Integration:** High-performance queries, triggers, and business logic
- **Extensible:** Modular codebase, easy to add new features or roles

---

## 🖥️ Example Screenshots

| Login Page | Admin Dashboard | Inventory Table |
|:---:|:---:|:---:|
| ![Login](frontend/public/assets/images/auth/auth-img.png) | ![Dashboard](frontend/public/assets/images/logo-light.png) | ![Inventory](frontend/public/assets/images/Logo-SAPITOS.jpg) |

---

## 🚦 Quick Usage Example
```sh
# 1. Start backend (in /backend)
npm install
npx nodemon server.js

# 2. Start frontend (in /frontend)
npm install
npm run dev

# 3. Access:
#   - API Docs:    http://localhost:5000/api-docs
#   - Frontend UI: http://localhost:5173
```

---

## 🧑‍💻 API Example (Login)
```http
POST /users/login
Content-Type: application/json
{
  "correo": "admin@example.com",
  "contrasena": "yourpassword"
}
```

---

## 🔒 Two-Factor Authentication (OTP)

Sapitos 2.0 implements a robust Two-Factor Authentication (2FA) system using Time-based One-Time Passwords (TOTP) to enhance security for user accounts.

![OTP Verification Screen](frontend/public/assets/images/otp-verification.png)

### Implementation Details

- **TOTP Algorithm**: Leverages industry-standard time-based verification with 6-digit codes.
- **200-Second Validity**: Each code expires after 200 seconds for optimal security and user convenience.
- **Email Delivery**: Authentication codes are securely delivered to the user's registered email.
- **Secure Storage**: OTP secrets are temporarily stored in sessionStorage and cleared upon successful verification.

### Technology Stack

- **Speakeasy**: Powers the core TOTP implementation (RFC 6238 compliant)
- **Nodemailer**: Handles secure email delivery of verification codes
- **JWT**: Tracks authentication timestamps for periodic OTP verification
- **React**: Creates an accessible, user-friendly verification interface

### OTP Flow Diagram

```
┌─────────────┐     ┌───────────────┐     ┌─────────────┐     ┌─────────────────┐
│ Login Form  │────►│ Authentication │────►│ OTP Request │────►│ Email Delivery  │
└─────────────┘     │ Valid          │     │ Generation  │     └─────────────────┘
                    └───────────────┘     └──────┬──────┘              │
                            │                    │                      │
                            │                    ▼                      ▼
┌─────────────────┐   ┌────┴───────┐      ┌─────────────┐     ┌─────────────────┐
│ Protected Route │◄──│ Successful │◄─────│ OTP         │◄────│ User Receives   │
│ Access Granted  │   │ Validation │      │ Verification │     │ & Enters Code   │
└─────────────────┘   └────────────┘      └─────────────┘     └─────────────────┘
```

### User Experience

- **Intuitive Interface**: Individual input fields with automatic focus advancement.
- **Accessibility Features**: Support for clipboard pasting and keyboard navigation.
- **Visual Feedback**: Countdown timer indicates code validity period.
- **Automatic Submission**: Codes are verified instantly when all digits are entered.

### Technical Implementation

The OTP system is implemented through several coordinated components:

1. **OTP Generation (`backend/utils/otp.js`)**:
   - Utilizes Speakeasy to create a secure random secret for each session
   - Generates a time-based 6-digit code valid for 200 seconds
   - Returns both the secret and code (secret sent to client, code to email)

2. **Email Service (`backend/utils/emailService.js`)**:
   - Uses Nodemailer to send professionally formatted emails
   - Supports both development (testing) and production environments
   - Includes the OTP code in a clearly formatted HTML template

3. **Controller Logic (`backend/controllers/otpController.js`)**:
   - Handles API endpoints for OTP generation and verification
   - Manages authentication timestamps in JWT tokens
   - Implements security policies like expiration and rate limiting

4. **Frontend Verification (`frontend/src/pages/OtpPage.jsx`)**:
   - Provides a user-friendly interface for code entry
   - Handles automatic verification when all digits are entered
   - Manages resend functionality with cooldown periods

### Security Benefits

- **Protection Against Credential Theft**: Even if passwords are compromised, attackers cannot access accounts without the time-sensitive code.
- **Replay Attack Prevention**: TOTP's time-based algorithm prevents the reuse of captured codes.
- **Configurable Enforcement**: Can be mandated for all users or specific user roles through environment variables.
- **Brute Force Protection**: Rate limiting and lockout features prevent systematic guessing attempts.

This implementation strikes an optimal balance between enhanced security and seamless user experience, following best practices for multi-factor authentication.

---

## 🏆 Why Sapitos 2.0?
- **Lightning Fast:** Vite + React for instant feedback
- **Enterprise-Ready:** SAP HANA backend, JWT security, modular code
- **Beautiful & Usable:** Modern design, dark/light themes, mobile support
- **Open & Documented:** Swagger UI, clear folder structure, easy onboarding

---

## 📚 Advanced: Database & Triggers
- All business logic and metrics are handled with custom SQL and triggers in `/Database`.
- Example: `TRG_ActualizarMetricasProducto.sql` auto-updates product KPIs on every order.

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License
[MIT](LICENSE)

---

## 🙋 FAQ
- **Q:** Can I use another DB?  
  **A:** The backend is tightly integrated with SAP HANA for advanced features, but you can adapt it.
- **Q:** Is there multi-language support?  
  **A:** The UI is easily translatable (currently Spanish/English mix).
- **Q:** How do I add a new role?  
  **A:** Add new routes/components in both backend and frontend, and update the role logic in `App.jsx`.

---

## 📬 Contact
For questions, reach out to the project maintainer.

---

> Made with ❤️ by the Sapitos 2.0 Team

