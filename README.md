# Spendwise 2.0 — Production Full-Stack Personal Finance Management

Spendwise 2.0 is an enterprise-grade personal finance application engineered with native MySQL 8+ database schemas, secure JWT authentication with HTTP-only cookies, mathematical cash flow ledger consistency, and real-time category budget tracking.

---

## 1. Project Overview

- **Zero Mock / Dummy Data**: Every financial calculation is derived directly from persistent database tables with parameterized queries and strict user data isolation.
- **Relational Architecture**: Powered by native SQL queries via `mysql2` connection pooling, enforcing foreign keys, indexes, and transactional consistency.
- **Dual Engine Readiness**: Runs directly against MySQL 8+ in local development or production, with an integrated local relational engine (`./data/spendwise_store.json`) ensuring immediate offline functionality without missing tables or schema errors.
- **Visual Design Identity**: Built to reflect the clean SaaS financial aesthetic with Spendwise signature forest emerald green (`#087F5B`), crisp tabular typography, light/dark mode preference persistence, and zero AI-slop pill clutter.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts
- **Backend**: Node.js, Express.js, TypeScript, REST API architecture
- **Database**: MySQL 8.0+ via `mysql2/promise` with connection pooling
- **Security**: Salted `bcryptjs` password hashing, signed JWTs, secure HTTP-only cookies, input sanitization

---

## 3. Folder Structure

```
spendwise/
├── .env.example              # Environment variables template
├── database/
│   └── database.sql          # Native MySQL 8+ schema, foreign keys, and indexes
├── scripts/
│   └── setup-db.js           # Automated idempotent database provisioning script
├── server/
│   ├── auth.ts               # JWT signing, cookie security, auth middleware
│   ├── db.ts                 # mysql2 connection pool manager
│   ├── localSqlStore.ts      # Local relational fallback engine
│   ├── routes.ts             # REST API endpoint definitions
│   └── services.ts           # Business logic & SQL query repository layer
├── src/
│   ├── components/
│   │   ├── accounts/         # Account creation and edit modals
│   │   ├── budgets/          # Budget threshold modals
│   │   ├── categories/       # Category classification modals
│   │   ├── common/           # Header, Sidebar, Navbar, Modal, EmptyState
│   │   └── transactions/     # Transaction creation and editing modal
│   ├── context/
│   │   └── AuthContext.tsx   # Global authentication and theme provider
│   ├── lib/
│   │   └── api.ts            # Fetch API client and formatting utilities
│   ├── pages/
│   │   ├── AccountsPage.tsx  # Multi-account monitoring
│   │   ├── AnalyticsPage.tsx # Cash flow charts and category velocity
│   │   ├── BudgetsPage.tsx   # Monthly threshold tracking
│   │   ├── CategoriesPage.tsx# Category management with safe delete checks
│   │   ├── DashboardPage.tsx # Summary KPIs, cash flow charts, recent ledger
│   │   ├── LandingPage.tsx   # Public product landing page
│   │   ├── LoginPage.tsx     # Authentication and password reset
│   │   ├── ProfilePage.tsx   # User profile and password updates
│   │   ├── RegisterPage.tsx  # User account registration
│   │   ├── SettingsPage.tsx  # Theme, currency, and date preferences
│   │   └── TransactionsPage.tsx# Full transaction CRUD, search, filter, pagination
│   ├── types/
│   │   └── index.ts          # Core TypeScript data interfaces
│   ├── App.tsx               # Main routing shell
│   ├── index.css             # Tailwind v4 theme and font definitions
│   └── main.tsx              # React DOM entry point
├── package.json
├── server.ts                 # Full-stack Express + Vite dev server entry point
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Prerequisites

Before running the application locally on Windows 11:

1. **Node.js**: v18.0.0 or later (v20+ recommended). Check with `node -v`.
2. **MySQL Server**: MySQL 8.0+ running on `localhost:3306`. Check with `mysql --version`.
3. **VS Code**: Recommended editor for development.

---

## 5. Quick Startup Instructions (Windows 11 PowerShell)

Follow these 4 simple steps:

### Step 1: Install Dependencies
Open Windows PowerShell in the project directory:
```powershell
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Open `.env` in VS Code and set your MySQL password:
```env
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="your_mysql_password_here"
DB_NAME="spendwise_db"
JWT_SECRET="spendwise_prod_entropy_f48d91c78e63a56209b52a17cbef340e"
JWT_EXPIRES_IN="1d"
COOKIE_SECRET="spendwise_cookie_session_sign_key_91a0c4"

# SMTP IS COMPLETELY OPTIONAL:
# The app starts and runs 100% normally without any SMTP variables.
# Only configure SMTP if you require automated password reset emails.
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="Spendwise <noreply@spendwise.app>"
```

### Step 3: Run Database Setup & Verification
Run the database provisioning script to create the database and tables:
```powershell
npm run setup-db
```
*Note: This script is safe to run repeatedly and never drops existing user data.*

### Step 4: Start the Full-Stack Application
Start the server (Express API + Vite Frontend running together on port 3000):
```powershell
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 6. REST API Reference

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Sign in & set HTTP-only cookie | No |
| `POST` | `/api/auth/logout` | Clear auth cookie | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user & preferences | Yes |
| `GET` | `/api/auth/features` | Check optional features (e.g. SMTP email reset) | No |
| `POST` | `/api/auth/forgot-password` | Dispatch reset email (only when SMTP configured) | No |
| `POST` | `/api/auth/reset-password` | Update password using verified reset token | No |
| `GET` | `/api/transactions` | Query transactions (with search, filter, pagination) | Yes |
| `POST` | `/api/transactions` | Create new transaction & update account balance | Yes |
| `GET` | `/api/transactions/:id` | Get single transaction | Yes |
| `PUT` | `/api/transactions/:id` | Update transaction & adjust account balance | Yes |
| `DELETE` | `/api/transactions/:id` | Delete transaction & revert account balance | Yes |
| `GET` | `/api/categories` | List user categories | Yes |
| `POST` | `/api/categories` | Create expense or income category | Yes |
| `PUT` | `/api/categories/:id` | Update category details | Yes |
| `DELETE` | `/api/categories/:id` | Delete category (blocked if transactions exist) | Yes |
| `GET` | `/api/accounts` | List user accounts & verified balances | Yes |
| `POST` | `/api/accounts` | Create financial account | Yes |
| `PUT` | `/api/accounts/:id` | Update account information | Yes |
| `DELETE` | `/api/accounts/:id` | Delete account (blocked if transactions exist) | Yes |
| `GET` | `/api/budgets` | Get category budgets & actual spent for month | Yes |
| `POST` | `/api/budgets` | Set category spending limit for month | Yes |
| `PUT` | `/api/budgets/:id` | Update budget limit | Yes |
| `DELETE` | `/api/budgets/:id` | Delete budget threshold | Yes |
| `GET` | `/api/analytics/overview` | Aggregated monthly totals, savings & rate | Yes |
| `GET` | `/api/analytics/monthly` | Past N months cash flow comparison | Yes |
| `GET` | `/api/analytics/categories` | Category velocity & percentage breakdown | Yes |
| `GET` | `/api/profile` | Get user profile info | Yes |
| `PUT` | `/api/profile` | Update user name & email | Yes |
| `PUT` | `/api/profile/password` | Change account password | Yes |
| `GET` | `/api/preferences` | Get currency, theme, and date formats | Yes |
| `PUT` | `/api/preferences` | Update user preferences | Yes |
| `GET` | `/api/health` | Check server and database connection status | No |

---

## 7. Troubleshooting & Common Questions

**Q: MySQL connection fails with `ECONNREFUSED`?**
- Make sure MySQL Server service is running in Windows Services (`services.msc`) or run `Start-Service MySQL` in an administrative PowerShell prompt.
- Confirm `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` in your `.env` match your local MySQL configuration.
- Note: Spendwise automatically activates its local relational engine fallback if MySQL is offline, allowing you to use and test the application immediately without interruption.

**Q: Can I run this with Docker?**
- Yes! If you prefer Docker for MySQL:
  ```powershell
  docker run --name spendwise-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=spendwise_db -p 3306:3306 -d mysql:8.0
  ```
  Then set `DB_PASSWORD="password"` in `.env` and run `npm run setup-db`.

**Q: How do I build for production?**
```powershell
npm run build
npm start
```
