require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const { router: authRouter } = require('./routes/auth');
const { router: workflowsRouter } = require('./routes/workflows');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'OpsFlow AI Agentic Engine',
    timestamp: new Date().toISOString(),
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5)
  });
});

// System Overview & Stats
app.get('/api/stats', (req, res) => {
  res.json({
    activeAgents: [
      { name: 'Triage & Ingestion Agent', role: 'Context extraction & intent parsing', status: 'Online' },
      { name: 'Policy & Compliance Auditor', role: 'SLA verification & policy guardrails', status: 'Online' },
      { name: 'Price & Anomaly Negotiator', role: 'Rebate calculation & counter-dispute drafting', status: 'Online' },
      { name: 'Payment & Settlement Dispatcher', role: 'Execution & escrow routing', status: 'Online' }
    ],
    efficiencyGains: '82% faster task resolution',
    autonomousResolutionRate: '88.4%',
    humanInTheLoopEscalationRate: '11.6%'
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/workflows', workflowsRouter);

// Start server after DB initialization
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 OpsFlow Agentic Backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Fatal initialization error:', err);
});
