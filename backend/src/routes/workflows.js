const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const { getPool, isFallback, inMemoryDb } = require('../db');
const { authenticateToken } = require('./auth');
const { callAgentReasoning } = require('../agentEngine');

const router = express.Router();

const createWorkflowSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().default('Procurement & Invoicing'),
  description: z.string().min(10, 'Description must detail the operational problem'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM')
});

// GET /api/workflows - List workflows
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const usingFallback = isFallback() || !pool;

    if (usingFallback) {
      const items = inMemoryDb.workflows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return res.json({ workflows: items });
    } else {
      const dbRes = await pool.query(
        'SELECT id, user_id as "userId", title, category, description, priority, status, stages, created_at, updated_at FROM workflows ORDER BY created_at DESC'
      );
      return res.json({ workflows: dbRes.rows });
    }
  } catch (err) {
    console.error('Fetch workflows error:', err);
    res.status(500).json({ error: 'Failed to retrieve workflows' });
  }
});

// GET /api/workflows/:id - Get workflow by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const usingFallback = isFallback() || !pool;

    let workflow = null;
    if (usingFallback) {
      workflow = inMemoryDb.workflows.find(w => w.id === id);
    } else {
      const dbRes = await pool.query(
        'SELECT id, user_id as "userId", title, category, description, priority, status, stages, created_at, updated_at FROM workflows WHERE id = $1',
        [id]
      );
      if (dbRes.rows.length > 0) workflow = dbRes.rows[0];
    }

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ workflow });
  } catch (err) {
    console.error('Fetch workflow error:', err);
    res.status(500).json({ error: 'Failed to retrieve workflow' });
  }
});

// POST /api/workflows - Submit task and trigger autonomous agent swarm
router.post('/', authenticateToken, async (req, res) => {
  try {
    const validated = createWorkflowSchema.parse(req.body);
    const pool = getPool();
    const usingFallback = isFallback() || !pool;

    const id = 'wf_' + uuidv4().substring(0, 8);
    const newWorkflow = {
      id,
      userId: req.user.id,
      title: validated.title,
      category: validated.category,
      description: validated.description,
      priority: validated.priority,
      status: 'PROCESSING',
      stages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (usingFallback) {
      inMemoryDb.workflows.unshift(newWorkflow);
    } else {
      await pool.query(
        'INSERT INTO workflows (id, user_id, title, category, description, priority, status, stages, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [newWorkflow.id, newWorkflow.userId, newWorkflow.title, newWorkflow.category, newWorkflow.description, newWorkflow.priority, newWorkflow.status, JSON.stringify(newWorkflow.stages), newWorkflow.created_at, newWorkflow.updated_at]
      );
    }

    // Run Multi-Agent Execution Pipeline Asynchronously
    executeAgentSwarm(newWorkflow.id, validated).catch(err => {
      console.error(`Error in autonomous agent execution for workflow ${newWorkflow.id}:`, err);
    });

    res.status(201).json({
      message: 'Autonomous Multi-Agent Task spawned successfully',
      workflow: newWorkflow
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Create workflow error:', err);
    res.status(500).json({ error: 'Failed to initiate workflow' });
  }
});

// POST /api/workflows/:id/approve - Human-in-the-Loop decision override/approval
router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'APPROVED' or 'REJECTED'
    const pool = getPool();
    const usingFallback = isFallback() || !pool;

    let workflow = null;
    if (usingFallback) {
      workflow = inMemoryDb.workflows.find(w => w.id === id);
    } else {
      const dbRes = await pool.query('SELECT * FROM workflows WHERE id = $1', [id]);
      if (dbRes.rows.length > 0) workflow = dbRes.rows[0];
    }

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const approvalStage = {
      agent: 'Human Operations Lead (Supervisor)',
      status: action === 'APPROVED' ? 'COMPLETED' : 'REJECTED',
      timestamp: new Date().toISOString(),
      thought: `Human manager verified agent plan. Action: ${action}. Supervisor note: "${notes || 'Approved for final execution'}"`,
      output: {
        authorizedBy: req.user.name,
        supervisorEmail: req.user.email,
        decision: action || 'APPROVED',
        settlementConfirmed: action === 'APPROVED'
      }
    };

    const finalStatus = action === 'APPROVED' ? 'RESOLVED' : 'REJECTED';
    const updatedStages = [...(workflow.stages || []), approvalStage];

    if (usingFallback) {
      workflow.stages = updatedStages;
      workflow.status = finalStatus;
      workflow.updated_at = new Date().toISOString();
    } else {
      await pool.query(
        'UPDATE workflows SET stages = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [JSON.stringify(updatedStages), finalStatus, id]
      );
      workflow.stages = updatedStages;
      workflow.status = finalStatus;
    }

    res.json({
      message: `Workflow ${action === 'APPROVED' ? 'authorized & executed' : 'rejected'} successfully`,
      workflow
    });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Failed to record approval decision' });
  }
});

/**
 * Autonomous Multi-Agent Execution Swarm Pipeline
 */
async function executeAgentSwarm(workflowId, context) {
  const agents = [
    {
      role: 'Triage & Ingestion Agent',
      instructions: 'Parse problem, extract structured metadata, identify vendor/department, and determine routing taxonomy.'
    },
    {
      role: 'Policy & Compliance Auditor Agent',
      instructions: 'Cross-check against contractual agreements, SLAs, and financial variance thresholds. Flag policy breaches or calculation errors.'
    },
    {
      role: 'Price & Anomaly Negotiator Agent',
      instructions: 'Formulate remediation plan, calculate fair reimbursement/credits, and draft communication to external counterparty.'
    },
    {
      role: 'Payment & Settlement Dispatcher',
      instructions: 'Assess final risk score. If variance > $1000 or priority is HIGH, pause for Human-in-the-Loop approval. Otherwise, execute auto-settlement.'
    }
  ];

  const currentStages = [];

  for (const agent of agents) {
    // Artificial small delay for realistic agent reasoning demonstration in UI
    await new Promise(r => setTimeout(r, 1200));

    const stepResult = await callAgentReasoning({
      agentRole: agent.role,
      taskContext: context,
      previousStages: currentStages,
      promptInstructions: agent.instructions
    });

    const stageEntry = {
      agent: agent.role,
      status: stepResult.status,
      timestamp: new Date().toISOString(),
      thought: stepResult.reasoning,
      metrics: stepResult.metrics,
      actionsTaken: stepResult.actionsTaken,
      output: stepResult.output,
      nextStepRecommendation: stepResult.nextStepRecommendation
    };

    currentStages.push(stageEntry);

    // Save intermediate progress
    await updateWorkflowProgress(workflowId, currentStages, stepResult.status === 'AWAITING_HUMAN' ? 'PENDING_APPROVAL' : 'PROCESSING');

    // If human approval is required, pause agent chain here
    if (stepResult.status === 'AWAITING_HUMAN') {
      return;
    }
  }

  // All automated steps cleared
  await updateWorkflowProgress(workflowId, currentStages, 'RESOLVED');
}

async function updateWorkflowProgress(id, stages, status) {
  const pool = getPool();
  const usingFallback = isFallback() || !pool;

  if (usingFallback) {
    const wf = inMemoryDb.workflows.find(w => w.id === id);
    if (wf) {
      wf.stages = [...stages];
      wf.status = status;
      wf.updated_at = new Date().toISOString();
    }
  } else {
    try {
      await pool.query(
        'UPDATE workflows SET stages = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [JSON.stringify(stages), status, id]
      );
    } catch (e) {
      console.error('Failed to update stage in Postgres:', e.message);
    }
  }
}

module.exports = {
  router
};
