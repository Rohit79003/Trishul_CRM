# 🔱 Trishul CRM — Next-Gen AI-Integrated Enterprise CRM Platform

> A full-stack, role-based Enterprise CRM built with **Next.js 14**, **Node.js/Express**, **MongoDB Atlas**, and an integrated **AI Assistant Co-Pilot**.

---

## 🌟 Key Features

- 🛡️ **Role-Based Access Control (RBAC)**: Secure multi-tier permissions for **Admin**, **Supervisor**, and **Agent** roles.
- 🤖 **Trishul AI Co-Pilot**: Smart AI-powered assistant for generating activity summaries, customized follow-up emails, and tracking top team performers.
- 🎯 **Lead Opportunity Pipeline**: Full lifecycle tracking (`new`, `contacted`, `interested`, `won`, `lost`) with automatic string/ID assignee resolution.
- 🤝 **Customer Directory**: Comprehensive customer database with value tracking, notes, and status management.
- 📋 **Task Management**: Priority-based task assignment with categories, due date tracking, and automated completion status.
- 📊 **Real-time Analytics**: Interactive metrics, charts, and report exports powered by Recharts & jsPDF.
- ⚙️ **Company & User Settings**: Global workspace configuration, dark/light theme switching, and password management.

---

## 🛠️ Tech Stack

### **Frontend (`/client`)**
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS & Framer Motion
- **Icons & UI**: Lucide React, Recharts, Lottie React
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT stored in secure Cookies & Auth Context

### **Backend (`/server`)**
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas via Mongoose ORM
- **Security**: JWT Authentication, bcryptjs password hashing, CORS whitelist
- **Logging**: Morgan HTTP logger

---

## 📁 Repository Structure

```
Trishul-CRM/
├── client/                     # Next.js 14 Frontend Application
│   ├── app/                    # Next.js App Router (Dashboard, Leads, Customers, Tasks, Settings)
│   ├── components/             # Dynamic UI Components, Navigation & AI Assistant Modal
│   ├── context/                # AuthContext & global state
│   ├── lib/                    # Axios API configuration
│   └── middleware.ts           # Frontend route protection middleware
├── server/                     # Express.js REST API Server
│   ├── config/                 # MongoDB connection & DNS resolver configuration
│   ├── controllers/            # Controller logic (Auth, Customer, Lead, Task, Employee, Assistant)
│   ├── middleware/             # Auth & Role-based middleware
│   ├── models/                 # Mongoose Data Models (User, Customer, Lead, Task, Setting)
│   ├── routes/                 # Express API routes
│   ├── seed.js                 # Database seeder script
│   └── server.js               # Express entry point
├── .gitignore                  # Global Git ignore rules
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB Atlas** cluster connection URI (or local MongoDB server)

---

### 2. Environment Setup

#### **Backend Environment Setup**
Create `.env` inside the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.oveiraf.mongodb.net/Trishul_CRM_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key
CLIENT_ORIGIN=http://localhost:3000
```

#### **Frontend Environment Setup**
Create `.env.local` inside the `client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### 3. Installation & Database Seeding

1. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Seed Initial Database Records**:
   ```bash
   npm run seed
   ```
   *This seeds default Admin, Supervisor, and Agent accounts.*

3. **Install Frontend Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

---

### 4. Running Locally

Start the Backend Server (Terminal 1):
```bash
cd server
npm run dev
```
*(Server will start on `http://localhost:5000`)*

Start the Frontend Client (Terminal 2):
```bash
cd client
npm run dev
```
*(Client will run on `http://localhost:3000`)*

---

## 🔑 Default Seed Credentials

After running `npm run seed`, you can log in with the following default accounts (password for all accounts is `password123`):

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@trishul.com` | `password123` | Full System Access & AI Assistant |
| **Supervisor** | `supervisor@trishul.com` | `password123` | Team Management & Assigned Boundaries |
| **Agent** | `agent@trishul.com` | `password123` | Personal Record Boundaries |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate & get JWT token | Public |
| `POST` | `/api/auth/register` | Register new user | Public / Admin |
| `GET` | `/api/auth/me` | Get current logged-in profile | Private |
| `GET` / `POST` | `/api/customers` | List or create customers | Private |
| `PUT` / `DELETE`| `/api/customers/:id` | Update or remove customer | Private |
| `GET` / `POST` | `/api/leads` | List or create lead opportunities | Private |
| `PUT` / `DELETE`| `/api/leads/:id` | Update or delete lead opportunity | Private |
| `GET` / `POST` | `/api/tasks` | List or create tasks | Private |
| `PUT` / `DELETE`| `/api/tasks/:id` | Update or delete task | Private |
| `GET` / `POST` | `/api/users` | Manage employee accounts | Admin Only |
| `POST` | `/api/assistant` | Query Trishul AI Co-Pilot | Admin Only |
| `GET` / `PUT` | `/api/settings` | Company settings & theme | Private |

---

## ☁️ Deployment Instructions

### **Backend Deployment (Render)**
1. Connect your repository to [Render.com](https://render.com/).
2. Set Root Directory to `server`.
3. Set Build Command: `npm install`, Start Command: `node server.js`.
4. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_ORIGIN`).

### **Frontend Deployment (Vercel)**
1. Connect repository to [Vercel.com](https://vercel.com/).
2. Set Root Directory to `client`.
3. Add Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`.
4. Deploy!

---

## 📄 License

This project is licensed under the **MIT License**.
