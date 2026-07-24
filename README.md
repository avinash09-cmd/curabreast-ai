<div align="center">

# 🌸 CuraBreast AI

### AI-Powered Women's Breast Health Awareness & Risk Assessment Platform

A full-stack, production-ready web application that provides intelligent breast health risk assessments, personalised recommendations, appointment tracking, and hospital location for women — all secured with JWT authentication and encrypted data storage.

<!-- Add after deployment -->
<!-- Live Demo: https://your-demo.vercel.app -->

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)]()
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens)]()

</div>

---

# 📌 Overview

CuraBreast AI is a production-ready full-stack application that helps women assess breast health risk through an intelligent, weighted symptom-scoring engine, while also providing health analytics, hospital lookup, and appointment tracking in one secure platform.

The application was designed following modern full-stack development practices including modular architecture, RESTful APIs, JWT authentication, reusable React components, and responsive UI design.

---

# ✨ Features

## 🤖 AI Risk Assessment

- ML-weighted symptom scoring (0–100)
- 9 clinical, genetic, age, and lifestyle indicators
- Instant risk-level classification (Low / Moderate / High)
- Personalised recommendations

---

## 📊 Health Analytics

- Risk trend charts
- Monthly assessment history
- Average score tracking
- Dashboard statistics overview

---

## 🏥 Hospital Locator

- 10 major Indian hospitals listed
- Contact details included
- One-tap map directions

---

## 📅 Appointments

- Book clinic appointments
- Track appointment status
- Manage & update bookings

---

## 📄 Reports

- Filterable assessment history
- Expandable report details
- CSV export support

---

## 👤 User Profile

- Edit personal details
- Change password securely
- Session management

---

## 🛡️ Admin Panel

- User management
- Assessment monitoring
- Platform-wide data export

---

## 🔐 Security

- JWT Authentication
- bcrypt Password Hashing
- Rate Limiting
- XSS Protection
- Helmet.js HTTP Headers

---

# 🛠 Tech Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Heroicons

---

## Backend

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcryptjs
- express-validator
- xss-clean

---

## Tools

- Git
- GitHub
- PM2 / Nginx (deployment)

---

# 📂 Project Structure

```
curabreast/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── utils/
    ├── public/
    └── vite.config.js
```

---

# 🔐 Authentication Flow

```
User

↓

Register/Login

↓

JWT Generated

↓

Stored Securely

↓

Authenticated Requests

↓

Protected Backend APIs

↓

PostgreSQL
```

---

# 🧠 Risk Scoring Algorithm

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
  + Age 50–59               → +15 pts
  + Age 40–49               → +10 pts
  + Age 30–39               → +5 pts

Lifestyle:
  + Smoking history         → +10 pts
  + Heavy alcohol            → +10 pts
  + Moderate alcohol         → +5 pts
  + Sedentary lifestyle      → +10 pts
  − Active lifestyle          → -5 pts (protective)

Risk Levels:
  0–29   → 🟢 LOW RISK
  30–59  → 🟡 MODERATE RISK
  60–100 → 🔴 HIGH RISK
```

---

# 📊 Dashboard Preview

### Dashboard

> Displays risk trend charts, monthly assessment history, and average score tracking.

---

### Assessment

> Guided symptom intake feeding the weighted AI risk-scoring engine.

---

### Reports

> Filterable history with expandable detail views and CSV export.

---

### Hospital Locator

> Browse major Indian hospitals with contacts and map directions.

---

### Admin Panel

> Manage users, monitor assessments, and export platform-wide data.

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone <your-repo-url> curabreast

cd curabreast
```

---

## Database Setup (PostgreSQL)

```bash
psql -U postgres

CREATE DATABASE curabreast;
CREATE USER curabreast_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE curabreast TO curabreast_user;
\q

psql -U curabreast_user -d curabreast -f backend/config/schema.sql
```

---

## Backend Setup

```bash
cd backend

npm install

npm run seed

npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## Environment Variables

Create a `.env` file inside the **backend** folder:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=curabreast
DB_USER=curabreast_user
DB_PASSWORD=your_secure_password

JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

Create a `.env` file inside the **frontend** folder:

```env
VITE_API_BASE_URL=/api
```

> Copy `.env.example` from each directory as a starting template. Generate a strong JWT secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@curabreast.ai` | `Admin@123` |
| User | `priya@example.com` | `User@1234` |
| User | `meera@example.com` | `User@1234` |
| User | `anita@example.com` | `User@1234` |

---

# 📡 API Reference

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | — |
| POST | `/api/auth/login` | Login → JWT | — |
| POST | `/api/auth/forgot-password` | Request reset link | — |
| POST | `/api/auth/reset-password` | Reset with token | — |

---

## Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get profile | ✅ |
| PUT | `/api/users/profile` | Update name/phone/age | ✅ |
| PUT | `/api/users/change-password` | Change password | ✅ |
| GET | `/api/users/appointments` | List appointments | ✅ |
| POST | `/api/users/appointments` | Book appointment | ✅ |

---

## Assessments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/assessment` | Submit assessment | ✅ |
| GET | `/api/assessment/history` | Assessment history | ✅ |
| GET | `/api/assessment/stats` | Dashboard stats | ✅ |

---

## Reports

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports` | All user reports | ✅ |
| GET | `/api/reports/:id` | Single report | ✅ |

---

## Admin (admin role only)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Platform stats | 🛡️ Admin |
| GET | `/api/admin/users` | List all users | 🛡️ Admin |
| DELETE | `/api/admin/users/:id` | Delete user | 🛡️ Admin |
| GET | `/api/admin/assessments` | All assessments | 🛡️ Admin |

---

# 🗃️ Database Schema

```sql
users         → id, fullname, email, phone, age, password_hash, role, is_active
assessments   → id, user_id, age, symptoms (JSONB), risk_score, risk_level, recommendation
reports       → id, user_id, assessment_id, report_data (JSONB)
appointments  → id, user_id, hospital_name, appointment_date, status
password_resets → id, user_id, token, expires_at, used
```

---

# 🔐 Security Implementation

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

# 📸 Pages Overview

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

# 🚢 Production Deployment

## Environment Variables (Production)

```env
NODE_ENV=production
JWT_SECRET=<64+ random hex characters>
FRONTEND_URL=https://yourdomain.com
DB_PASSWORD=<strong_password>
```

## Build Frontend

```bash
cd frontend
npm run build
# Outputs to frontend/dist/
```

## Serve with PM2 (Backend)

```bash
npm install -g pm2
cd backend
pm2 start server.js --name curabreast-api
pm2 save
pm2 startup
```

## Nginx Config (optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/curabreast/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

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

# 🛠️ Troubleshooting

**Database connection fails:**
```bash
sudo systemctl status postgresql
psql -U curabreast_user -d curabreast -h localhost
```

**Port already in use:**
```bash
lsof -ti:5000 | xargs kill -9
```

**Frontend can't reach API:**
- Check `vite.config.js` proxy target matches backend port
- Ensure backend `.env` has `FRONTEND_URL=http://localhost:5173`

**JWT errors after restart:**
- Ensure `JWT_SECRET` in `.env` has not changed
- Clear browser localStorage and log in again

---

# 🌟 Highlights

- Production-ready Full-Stack Architecture
- AI-Weighted Risk Scoring Engine
- RESTful API Design
- JWT Authentication
- Admin Panel & Analytics
- Hospital Locator with Map Directions
- CSV Report Export
- Modular Folder Structure
- Encrypted Data Storage

---

# 📈 Future Improvements (v2)

- SMS/Email Appointment Reminders
- Multi-language Support
- Telemedicine Integration
- Wearable Device Data Sync
- Advanced ML Risk Model
- PDF Report Generation
- Mobile App (React Native)
- Doctor/Clinician Dashboard

---

# 🤝 Contributing

Contributions, feature suggestions, and improvements are always welcome.

Feel free to fork the repository and open a Pull Request.

---

# 👨‍💻 Author

## Avinash Kumar Singh

B.Tech in Computer Science Engineering (Cyber Security and Digital Forensics)

VIT Bhopal University

### Connect with me

- GitHub: https://github.com/avinash09-cmd
- LinkedIn: https://www.linkedin.com/in/avinash-kumar-singh-809a61289/

---

<div align="center">

### ⭐ If you found this project helpful, consider giving it a star!

*Early detection saves lives.* Made with ❤️ for women's health.

</div>
