# OpsFlow AI: Autonomous Multi-Agent Operations & Procurement Swarm

> **Theme**: Agentic AI & Intelligent Systems  
> **Challenge**: Autonomous Decision-Making, Workflow Orchestration & Human-in-the-Loop Governance across Fragmented Enterprise Systems.

---

## 📌 1. Problem Statement
Modern enterprises lose millions of dollars and thousands of operational hours due to **fragmented decision-making, manual invoice reconciliation, SLA audit overhead, and uncoordinated cross-system resolutions**. 

Common failure points include:
1. **Billing & Contract Discrepancies**: Cloud and SaaS vendors frequently generate overages (e.g., omitted volume rebates, tier discounts, idle instances) that human procurement teams take weeks or months to catch.
2. **Fragmented Tooling**: Data is split across invoicing gateways (Stripe), cloud consoles (AWS/Datadog), contract repositories, and ERP ledgers.
3. **Slow Resolution**: Reaching out to account representatives, calculating contract credits, and processing adjustments creates delays of 3–14 business days per incident.

---

## 💡 2. Solution Description & Agentic Architecture
**OpsFlow AI** is an autonomous multi-agent operating system designed to ingest, reason about, audit, negotiate, and settle complex business operations with **zero-to-minimal human intervention**.

### Multi-Agent Swarm Topology
```
           +-----------------------------------------------+
           |    Incoming Task / Unstructured Invoice       |
           +-----------------------------------------------+
                                  |
                                  v
           +-----------------------------------------------+
           |       Agent 1: Ingestion & Triage Agent       |
           |   (Context extraction, intent & risk score)   |
           +-----------------------------------------------+
                                  |
                                  v
           +-----------------------------------------------+
           |    Agent 2: Policy & Compliance Auditor       |
           |   (SLA verification & rebate audit checks)    |
           +-----------------------------------------------+
                                  |
                                  v
           +-----------------------------------------------+
           |     Agent 3: Negotiation Strategist           |
           |  (Discrepancy math, dispute counter-draft)    |
           +-----------------------------------------------+
                                  |
                                  v
           +-----------------------------------------------+
           |   Agent 4: Payment & Settlement Dispatcher    |
           +-----------------------------------------------+
                   /                               \
                  /                                 \
  (Variance < $1,000)                        (Variance >= $1,000 or HIGH)
        v                                           v
[Auto Webhook Settlement]                   [Human-in-the-Loop Escrow Hold]
                                                    |
                                            (Manager Approval)
                                                    v
                                        [Ledger Execution & Close]
```

### Key Capabilities
- **Autonomous Multi-Step Reasoning**: Agents reason collaboratively through explicit step-by-step thinking traces.
- **Enterprise Guardrails & Human-in-the-Loop (HITL)**: High-impact actions are held in secure escrow for managerial authorization.
- **Dual LLM & Deterministic Fallback Mode**: Integrates directly with **Google Gemini 1.5 / 2.0 Flash API** through backend environment variables, with high-fidelity local deterministic reasoning emulation for immediate zero-config testing.
- **Database Flexibility**: Native **Supabase PostgreSQL** pool connection with seamless in-memory PostgreSQL emulation mode.

---

## 🛠️ 3. Tech Stack

### Frontend
- **Framework**: React.js 18 + Vite
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS (v4)
- **HTTP Client**: Axios with JWT Bearer Interceptors
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js
- **Authentication**: JSON Web Token (JWT) + `bcryptjs` password hashing
- **Validation**: Zod schema validation
- **Database**: Supabase PostgreSQL (`pg` connection pool) with in-memory persistence fallback
- **AI Engine**: Google Gemini API (`@google/generative-ai`)

---

## 🚀 4. Setup & Local Execution

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### A. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_opsflow_jwt_key_2026_agentic
# (Optional) Supabase PostgreSQL connection string:
DATABASE_URL=
# (Optional) Google Gemini API Key:
GEMINI_API_KEY=
```
> *Note: If `DATABASE_URL` or `GEMINI_API_KEY` are not set, the system will automatically run in local zero-setup emulation mode.*

Start the backend:
```bash
npm start
```
*Backend runs on `http://localhost:5000`.*

### B. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Demo Credentials
- **Email**: `ops@company.com`
- **Password**: `demo123`

---

## 🌐 5. Deployment Guide

### Frontend on Vercel
1. Push code to your GitHub repository.
2. In Vercel, import the repository and set Root Directory to `frontend`.
3. Set build command: `npm run build` and output directory: `dist`.
4. Configure environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`.

### Backend on Render / Railway
1. In Render, select **New Web Service** and root directory `backend`.
2. Set Build Command: `npm install` and Start Command: `npm start`.
3. Add Environment Variables:
   - `PORT=5000`
   - `JWT_SECRET=your_jwt_secret`
   - `DATABASE_URL=postgresql://postgres:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
   - `GEMINI_API_KEY=your_gemini_api_key`

---

## 🎥 6. Demo Video Walkthrough Outline (3-5 Minutes)
1. **Introduction (0:00 - 0:45)**: Real-world pain point of vendor invoice discrepancies and fragmented approvals.
2. **Platform & Authentication (0:45 - 1:30)**: Role-based JWT security, real-time telemetry dashboard.
3. **Agent Swarm In Action (1:30 - 3:00)**: Ingesting an AWS billing surge, observing the 4 agents deliberating step-by-step.
4. **Human-in-the-Loop Approval & Settlement (3:00 - 3:45)**: Reviewing the dispute counter-draft and executing the settlement.
5. **Conclusion & Tech Stack Review (3:45 - 4:15)**: Summary of Gemini API, Supabase, React, and Express.
