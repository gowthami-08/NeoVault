# 🏦 NeoVault – Banking System API

NeoVault is a secure RESTful banking backend built with **Node.js**, **Express**, and **MongoDB**. It supports user authentication, bank account management, and double-entry ledger-based transactions with email notifications.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server & routing |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Nodemailer | Email notifications |
| cookie-parser | Cookie handling |
| dotenv | Environment variables |

---

## 📁 Project Structure

```
BankApplication/
├── server.js                   # Entry point – starts server & connects DB
├── src/
│   ├── app.js                  # Express app setup, middleware & routes
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   ├── user.model.js       # User schema (email, name, password, SystemUser)
│   │   ├── account.model.js    # Bank account schema
│   │   ├── transaction.model.js# Transaction schema (PENDING/COMPLETED/FAILED/REVERSED)
│   │   ├── ledger.model.js     # Double-entry ledger schema (DEBIT/CREDIT)
│   │   └── blackList.model.js  # Blacklisted JWT tokens (auto-expire in 3 days)
│   ├── controllers/
│   │   ├── auth.controllers.js       # Register, Login, Logout
│   │   ├── account.controller.js     # Create account, get accounts, get balance
│   │   └── transaction.controller.js # Transfer funds, initial fund injection
│   ├── middleware/
│   │   └── auth.middleware.js  # JWT verification + blacklist check
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth/*
│   │   ├── accounts.routes.js    # /api/accounts/*
│   │   └── transaction.routes.js # /api/transactions/*
│   └── services/
│       └── email.service.js    # Nodemailer email service
├── update_system_user.js       # Script to promote a user to System User
├── .env                        # Environment variables (not committed)
├── .gitignore
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/gowthami-08/NeoVault.git
cd NeoVault
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a `.env` file in the root directory
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### 4. Start the server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs at: `http://localhost:3000`

---

## 🔐 Authentication

NeoVault uses **JWT-based authentication**. Tokens are:
- Sent in the response body and set as an HTTP cookie on login/register
- Verified on every protected route via middleware
- **Blacklisted on logout** — invalidated tokens are stored in MongoDB and auto-expire after **3 days** (matching token lifespan)

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| POST | `/api/auth/logout` | Public | Logout and blacklist token |

#### POST `/api/auth/register`
**Request Body:**
```json
{
  "name": "Gowthami",
  "email": "gowthami@example.com",
  "password": "securepassword"
}
```
**Response (201):**
```json
{
  "user": { "_id": "...", "email": "...", "name": "..." },
  "token": "<jwt_token>"
}
```

#### POST `/api/auth/login`
**Request Body:**
```json
{
  "email": "gowthami@example.com",
  "password": "securepassword"
}
```
**Response (200):**
```json
{
  "user": { "_id": "...", "email": "...", "name": "..." },
  "token": "<jwt_token>"
}
```

#### POST `/api/auth/logout`
**Headers:** `Authorization: Bearer <token>` or uses cookie  
**Response (200):**
```json
{ "message": "User logged out successfully" }
```

---

### Account Routes — `/api/accounts` 🔒 Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts/` | Create a new bank account |
| GET | `/api/accounts/` | Get all accounts of logged-in user |
| GET | `/api/accounts/balance/:accountId` | Get balance of a specific account |

All routes require a valid JWT in the `Authorization` header or cookie.

---

### Transaction Routes — `/api/transactions` 🔒 Protected

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/transactions/` | Auth User | Transfer funds between accounts |
| POST | `/api/transactions/system/initial-funds` | System User Only | Inject initial funds into an account |

#### POST `/api/transactions/`
**Request Body:**
```json
{
  "fromAccount": "<account_id>",
  "toAccount": "<account_id>",
  "amount": 500,
  "idempotencyKey": "unique-key-to-prevent-duplicate-transactions"
}
```
**Response (200):**
```json
{
  "message": "Transaction completed successfully",
  "transaction": { ... }
}
```

---

## 💡 Key Concepts

### Double-Entry Ledger System
Every transaction creates **two ledger entries**:
- A **DEBIT** entry on the sender's account
- A **CREDIT** entry on the receiver's account

This ensures complete financial auditability and balance accuracy.

### Transaction States
```
PENDING → COMPLETED
       ↘ FAILED
       ↘ REVERSED
```

### Idempotency
Each transaction requires a unique `idempotencyKey`. If the same key is sent again, the server **won't process a duplicate** — it returns the status of the existing transaction. This protects against double-spending due to retries or network errors.

### MongoDB Transactions (Sessions)
Transfers use **MongoDB sessions** to ensure atomicity — if anything fails mid-transfer, the entire operation is rolled back.

---

## 🛡️ Middleware

### `authMiddleware`
- Extracts token from cookie or `Authorization: Bearer <token>` header
- Checks if token is blacklisted
- Verifies JWT and attaches `req.user` for downstream controllers

### `authSystemUsermiddleware`
- Same as `authMiddleware` but additionally checks `SystemUser: true` on the user
- Used exclusively for the initial funds injection endpoint

---

## 🤖 System User

A System User is a special internal account used to inject initial funds (seed money) into user accounts.

To promote a user to System User, run:
```bash
node update_system_user.js
```
> ⚠️ The `SystemUser` field is `immutable` — it can only be set once.

---

## 📧 Email Notifications

NeoVault sends emails automatically:
- **On Registration** — Welcome email to the new user
- **On Transaction** — Debit notification after a successful transfer

Emails are sent via **Nodemailer** using Gmail SMTP (configured in `.env`).

---

## 🔒 Security Highlights

- Passwords are hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens expire in **3 days**
- Logged-out tokens are **blacklisted** in MongoDB with a TTL index
- Password field is `select: false` — never returned in queries by default
- `SystemUser` field is hidden and immutable

---

## 📌 Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail App Password |

---

## 👩‍💻 Author

**Gowthami** — [github.com/gowthami-08](https://github.com/gowthami-08)
