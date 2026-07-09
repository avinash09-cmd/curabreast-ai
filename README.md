# 🌸 CuraBreast AI

**AI-Powered Women's Breast Health Awareness & Risk Assessment Platform**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-rose)](LICENSE)

CuraBreast AI is a full-stack, production-ready web application that provides intelligent breast health risk assessments, personalised recommendations, appointment tracking, and hospital location for women — all secured with JWT authentication and encrypted data storage.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Risk Assessment | ML-weighted symptom scoring (0–100) across 9 health indicators |
| 📊 Health Analytics | Risk trend charts, monthly history, avg score tracking |
| 🏥 Hospital Locator | 10 major Indian hospitals with contacts & map directions |
| 📅 Appointments | Book, track & manage clinic appointments |
| 📄 Reports | Filterable history, expandable details, CSV export |
| 👤 User Profile | Edit details, change password, session management |
| 🛡️ Admin Panel | User management, assessment monitoring, data export |
| 🔐 Security | JWT auth, bcrypt hashing, rate limiting, XSS protection, Helmet |

---

## 🗂️ Project Structure

```
curabreast/
├── backend/
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection pool
│   │   └── schema.sql         # Full database schema + views
│   ├── controllers/
│   │   ├── authController.js  # Register, login, password reset
│   │   ├── assessmentController.js  # Risk scoring + history
│   │   ├── userController.js  # Profile, appointments
│   │   ├── reportController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js            # JWT verify + role guard
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── assessment.js
│   │   ├── reports.js
│   │   └── admin.js
│   ├── utils/
│   │   └── seed.js            # Demo data seeder
│   ├── server.js              # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   └── ui/
    │   │       ├── DashboardLayout.jsx
    │   │       └── AdminLayout.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ForgotPasswordPage.jsx  (+ ResetPasswordPage)
    │   │   ├── DashboardPage.jsx
    │   │   ├── AssessmentPage.jsx
    │   │   ├── ReportsPage.jsx
    │   │   ├── HospitalLocatorPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── AppointmentsPage.jsx
    │   │   ├── AdminDashboardPage.jsx
    │   │   ├── AdminUsersPage.jsx
    │   │   └── AdminAssessmentsPage.jsx
    │   ├── utils/
    │   │   ├── api.js          # Axios instance with interceptors
    │   │   └── helpers.js      # Formatting, risk colours
    │   ├── App.jsx             # Router + route guards
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **npm** v9 or higher

---

### 1. Clone / Extract the Project

```bash
# If using git:
git clone <your-repo-url> curabreast
cd curabreast

# Or just navigate to the extracted folder
cd curabreast
```

---

### 2. Set Up PostgreSQL Database

#### Option A — psql CLI
```bash
# Log in as postgres superuser
psql -U postgres

# Create database and user
CREATE DATABASE curabreast;
CREATE USER curabreast_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE curabreast TO curabreast_user;
\q

# Run schema
psql -U curabreast_user -d curabreast -f backend/config/schema.sql
```

#### Option B — pgAdmin
1. Open pgAdmin → create a new database named `curabreast`
2. Open the Query Tool
3. Paste and run the contents of `backend/config/schema.sql`

---

### 3. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=curabreast
DB_USER=curabreast_user
DB_PASSWORD=your_secure_password

JWT_SECRET=change_this_to_a_random_64_char_string_in_production
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

> **Important:** Generate a strong JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

### 4. Install & Seed Backend

```bash
# Still inside /backend
npm install

# Seed demo data (admin + 3 sample users)
npm run seed
```

Seed creates:
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@curabreast.ai` | `Admin@123` |
| User | `priya@example.com` | `User@1234` |
| User | `meera@example.com` | `User@1234` |
| User | `anita@example.com` | `User@1234` |

---

### 5. Install & Configure Frontend

```bash
cd ../frontend
cp .env.example .env
npm install
```

The `.env` defaults to `/api` which proxies through Vite to `localhost:5000`. No changes needed for local development.

---

### 6. Run the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App opens on http://localhost:5173
```

Open your browser at **http://localhost:5173** 🎉

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | — |
| POST | `/api/auth/login` | Login → JWT | — |
| POST | `/api/auth/forgot-password` | Request reset link | — |
| POST | `/api/auth/reset-password` | Reset with token | — |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get profile | ✅ |
| PUT | `/api/users/profile` | Update name/phone/age | ✅ |
| PUT | `/api/users/change-password` | Change password | ✅ |
| GET | `/api/users/appointments` | List appointments | ✅ |
| POST | `/api/users/appointments` | Book appointment | ✅ |

### Assessments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/assessment` | Submit assessment | ✅ |
| GET | `/api/assessment/history` | Assessment history | ✅ |
| GET | `/api/assessment/stats` | Dashboard stats | ✅ |

### Reports
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports` | All user reports | ✅ |
| GET | `/api/reports/:id` | Single report | ✅ |

### Admin (admin role only)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Platform stats | 🛡️ Admin |
| GET | `/api/admin/users` | List all users | 🛡️ Admin |
| DELETE | `/api/admin/users/:id` | Delete user | 🛡️ Admin |
| GET | `/api/admin/assessments` | All assessments | 🛡️ Admin |

---

## 🧠 Risk Scoring Algorithm

The assessment engine uses a weighted multi-factor scoring system:

```
Base Score = 0 (range: 0–100)

Clinical Symptoms:
  + Lump detected          → +25 pts
  + Nipple discharge       → +20 pts
  + Skin changes           → +15 pts
  + Breast pain            → +10 pts

Genetic/History:
  + Family history         → +20 pts

Age Risk:
  + Age 60+                → +20 pts
  + Age 50–59              → +15 pts
  + Age 40–49              → +10 pts
  + Age 30–39              → +5 pts

Lifestyle:
  + Smoking history        → +10 pts
  + Heavy alcohol          → +10 pts
  + Moderate alcohol       → +5 pts
  + Sedentary lifestyle    → +10 pts
  − Active lifestyle       → -5 pts (protective)

Risk Levels:
  0–29   → 🟢 LOW RISK
  30–59  → 🟡 MODERATE RISK
  60–100 → 🔴 HIGH RISK
```

---

## 🗃️ Database Schema

```sql
users         → id, fullname, email, phone, age, password_hash, role, is_active
assessments   → id, user_id, age, symptoms (JSONB), risk_score, risk_level, recommendation
reports       → id, user_id, assessment_id, report_data (JSONB)
appointments  → id, user_id, hospital_name, appointment_date, status
password_resets → id, user_id, token, expires_at, used
```

---

## 🔐 Security Implementation

| Measure | Implementation |
|---------|----------------|
| Password hashing | bcryptjs (12 salt rounds) |
| Authentication | JWT (HS256, 7-day expiry) |
| Rate limiting | 100 req/15min general; 10 req/15min for auth |
| XSS protection | xss-clean middleware |
| HTTP headers | Helmet.js |
| SQL injection | Parameterised queries (pg) |
| CORS | Restricted to `FRONTEND_URL` |
| Input validation | express-validator on all POST routes |

---

## 🚢 Production Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
JWT_SECRET=<64+ random hex characters>
FRONTEND_URL=https://yourdomain.com
DB_PASSWORD=<strong_password>
```

### Build Frontend
```bash
cd frontend
npm run build
# Outputs to frontend/dist/
```

### Serve with PM2 (Backend)
```bash
npm install -g pm2
cd backend
pm2 start server.js --name curabreast-api
pm2 save
pm2 startup
```

### Nginx Config (optional)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (static)
    root /var/www/curabreast/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🛠️ Troubleshooting

**Database connection fails:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify credentials
psql -U curabreast_user -d curabreast -h localhost
```

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Frontend can't reach API:**
- Check `vite.config.js` proxy target matches backend port
- Ensure backend `.env` has `FRONTEND_URL=http://localhost:5173`

**JWT errors after restart:**
- Ensure `JWT_SECRET` in `.env` has not changed
- Clear browser localStorage and log in again

---

## 📸 Pages Overview

| Page | Route | Access |
|------|-------|--------|
| Landing | `/` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Forgot Password | `/forgot-password` | Public |
| Dashboard | `/dashboard` | User |
| Assessment | `/assessment` | User |
| Reports | `/reports` | User |
| Appointments | `/appointments` | User |
| Hospital Locator | `/hospitals` | User |
| Profile | `/profile` | User |
| Admin Dashboard | `/admin` | Admin |
| Admin Users | `/admin/users` | Admin |
| Admin Assessments | `/admin/assessments` | Admin |

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 💖 Built With

- [React](https://reactjs.org) + [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Express.js](https://expressjs.com)
- [PostgreSQL](https://postgresql.org)
- [Recharts](https://recharts.org)
- [Heroicons](https://heroicons.com)

---

*Early detection saves lives. Built with ❤️ for women's health.*
