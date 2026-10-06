const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
let isInMemoryFallback = false;

// Fallback in-memory storage if DATABASE_URL (Supabase PostgreSQL) is not set yet
const inMemoryDb = {
  users: [],
  workflows: [],
  logs: []
};

// Seed demo users and initial sample workflows in in-memory store
const bcrypt = require('bcryptjs');
const demoPasswordHash = bcrypt.hashSync('demo123', 10);

inMemoryDb.users.push({
  id: 'usr_demo_01',
  name: 'Operations Lead',
  email: 'ops@company.com',
  password_hash: demoPasswordHash,
  role: 'admin',
  created_at: new Date().toISOString()
});

inMemoryDb.workflows.push({
  id: 'wf_demo_01',
  userId: 'usr_demo_01',
  title: 'Cloud Infrastructure Invoice & SLA Discrepancy',
  category: 'Procurement & Finance',
  description: 'AWS billing invoice arrived showing $14,250 with unexpected 35% surge in multi-region data egress fees exceeding contractual discounts.',
  priority: 'HIGH',
  status: 'PENDING_APPROVAL',
  stages: [
    {
      agent: 'Triage & Ingestion Agent',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      thought: 'Extracted invoice metadata, matched with PO-2026-991, identified vendor AWS Enterprise Support tier.',
      output: { poNumber: 'PO-2026-991', vendor: 'Amazon Web Services', invoiceAmount: 14250, baselineAmount: 10500 }
    },
    {
      agent: 'Policy & Compliance Auditor',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      thought: 'Audited against Master Service Agreement #MSA-AWS-44. Egress tier discount of 15% was omitted by billing engine.',
      output: { compliancePassed: false, violationDetected: 'Omitted 15% MSA volume egress rebate ($2,137.50 difference)' }
    },
    {
      agent: 'Price & Anomaly Negotiator',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      thought: 'Calculated credit memo request. Generated auto-negotiation draft to AWS Account Executive citing MSA Section 4.2.',
      output: { recommendedPayment: 12112.50, creditMemoRequested: 2137.50, negotiationDraftReady: true }
    },
    {
      agent: 'Payment & Settlement Dispatcher',
      status: 'AWAITING_HUMAN',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      thought: 'Discrepancy exceeds autonomous threshold ($1,000). Holding disbursement for CFO / Ops Manager approval.',
      output: { actionRequired: 'Review draft and authorize adjusted settlement of $12,112.50' }
    }
  ],
  created_at: new Date(Date.now() - 3600000).toISOString(),
  updated_at: new Date(Date.now() - 1800000).toISOString()
});

async function initDb() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString && connectionString.trim() !== '') {
    try {
      pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
      });

      // Test connection
      await pool.query('SELECT NOW()');
      console.log('✅ Connected successfully to Supabase PostgreSQL database.');

      // Initialize Tables
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(120) NOT NULL,
          email VARCHAR(180) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'operator',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS workflows (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          priority VARCHAR(20) DEFAULT 'MEDIUM',
          status VARCHAR(40) DEFAULT 'RECEIVED',
          stages JSONB NOT NULL DEFAULT '[]',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id VARCHAR(64) PRIMARY KEY,
          workflow_id VARCHAR(64),
          agent_name VARCHAR(100) NOT NULL,
          action VARCHAR(100) NOT NULL,
          payload JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Seed admin if not present
      const res = await pool.query('SELECT id FROM users WHERE email = $1', ['ops@company.com']);
      if (res.rowCount === 0) {
        await pool.query(
          'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
          ['usr_demo_01', 'Operations Lead', 'ops@company.com', demoPasswordHash, 'admin']
        );
      }

      isInMemoryFallback = false;
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to Supabase PostgreSQL (' + err.message + '). Switching seamlessly to In-Memory store with live state retention.');
      isInMemoryFallback = true;
    }
  } else {
    console.log('ℹ️ No DATABASE_URL provided in .env. Running with fast in-memory PostgreSQL emulation mode (demo ready!).');
    isInMemoryFallback = true;
  }
}

module.exports = {
  initDb,
  getPool: () => pool,
  isFallback: () => isInMemoryFallback,
  inMemoryDb
};
