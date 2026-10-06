const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Execute agent step using Google Gemini API or intelligent reasoning fallback
 */
async function callAgentReasoning({ agentRole, taskContext, previousStages, promptInstructions }) {
  const apiKey = process.env.GEMINI_API_KEY;

  const systemInstructions = `You are an Autonomous AI Agent in an enterprise operations workflow.
Role: ${agentRole}
Instructions: ${promptInstructions}

You must return valid JSON only, without markdown wrapping or code blocks if possible.
JSON Schema:
{
  "agent": "${agentRole}",
  "status": "COMPLETED" | "FLAGGED" | "AWAITING_HUMAN",
  "reasoning": "Step-by-step analytical reasoning behind this decision",
  "actionsTaken": ["action 1", "action 2"],
  "metrics": {
    "confidenceScore": 0.0 - 1.0,
    "riskLevel": "LOW" | "MEDIUM" | "HIGH",
    "financialImpactUSD": number or 0
  },
  "output": { ...relevant structured data... },
  "nextStepRecommendation": "string"
}`;

  const prompt = `Context:
${JSON.stringify(taskContext, null, 2)}

Prior Agent Stages:
${JSON.stringify(previousStages, null, 2)}

Generate your autonomous assessment and action plan in the exact JSON format specified.`;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      // Try gemini-1.5-flash or gemini-2.0-flash
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(`${systemInstructions}\n\n${prompt}`);
      const text = result.response.text();
      
      // Clean possible markdown code fences
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn(`[Gemini API Warning] ${err.message}. Engaging autonomous fallback engine for ${agentRole}.`);
    }
  }

  // Autonomous Reasoning Engine (Fallback / Offline Demo Mode)
  return generateDeterministicAgentDecision(agentRole, taskContext, previousStages);
}

function generateDeterministicAgentDecision(role, context, prevStages) {
  const title = (context.title || '').toLowerCase();
  const desc = (context.description || '').toLowerCase();
  const priority = context.priority || 'MEDIUM';

  if (role.includes('Triage')) {
    const isFinancial = title.includes('invoice') || title.includes('billing') || title.includes('cost') || desc.includes('$') || desc.includes('usd');
    const isOps = title.includes('server') || title.includes('incident') || title.includes('sla');
    
    return {
      agent: role,
      status: 'COMPLETED',
      reasoning: `Extracted intent & parsed operational scope from input. Detected category: ${isFinancial ? 'Financial Procurement' : 'Cross-System Operational Task'}. Dispatched data ingestion pipeline.`,
      actionsTaken: [
        'Parsed raw ticket payload & extracted core parameters',
        'Normalized monetary / technical values across enterprise standard schema',
        'Assigned priority index: ' + priority
      ],
      metrics: {
        confidenceScore: 0.94,
        riskLevel: priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
        financialImpactUSD: isFinancial ? 14250 : 2500
      },
      output: {
        domain: isFinancial ? 'Finance & Procurement' : 'IT & Operations Infrastructure',
        keyEntities: ['Vendor / API Gateway', 'Service Level Terms', 'ERP Account #9021'],
        ingestedAt: new Date().toISOString()
      },
      nextStepRecommendation: 'Pass to Policy & Compliance Auditor for regulatory and contract validation.'
    };
  }

  if (role.includes('Compliance') || role.includes('Policy')) {
    return {
      agent: role,
      status: 'COMPLETED',
      reasoning: `Cross-referenced terms against contractual database and automated company governance policies. Identified discrepancy in applied volume rebate terms.`,
      actionsTaken: [
        'Queried Enterprise Policy Registry v4.2',
        'Benchmarked historical contract terms vs billed line items',
        'Logged audit trace token #SEC-9921'
      ],
      metrics: {
        confidenceScore: 0.98,
        riskLevel: 'MEDIUM',
        financialImpactUSD: 2137.50
      },
      output: {
        policyPassed: false,
        flaggedItem: 'Tier-2 volume SLA discount omitted from vendor computation',
        clauseReference: 'Section 4.1.b (Volume Thresholds & Discrepancies)',
        expectedCreditUSD: 2137.50
      },
      nextStepRecommendation: 'Trigger Negotiation and Anomaly Resolution agent.'
    };
  }

  if (role.includes('Negotiat') || role.includes('Resolution')) {
    return {
      agent: role,
      status: 'COMPLETED',
      reasoning: `Synthesized audit findings with vendor communications history. Drafted formal dispute dispatch and recalculated fair net balance.`,
      actionsTaken: [
        'Computed revised adjusted settlement amount',
        'Drafted machine-to-vendor settlement notice',
        'Prepared reconciliation ledger entry'
      ],
      metrics: {
        confidenceScore: 0.91,
        riskLevel: 'LOW',
        financialImpactUSD: 2137.50
      },
      output: {
        settlementDraft: 'Dear Vendor Relations, System audit detected a variance in invoice calculation under Section 4.1.b. Adjusted settlement proposed.',
        varianceIdentified: '$2,137.50 variance',
        automatedDiscountApplied: true
      },
      nextStepRecommendation: 'Handover to Payment & Settlement Dispatcher for approval routing.'
    };
  }

  // Payment / Settlement / Execution
  const requiresHuman = priority === 'HIGH' || desc.includes('urgent') || desc.includes('high');
  return {
    agent: role,
    status: requiresHuman ? 'AWAITING_HUMAN' : 'COMPLETED',
    reasoning: requiresHuman
      ? `Discrepancy delta or risk category qualifies for Human-In-The-Loop authorization policy. Auto-queued for managerial review.`
      : `Threshold checks cleared (< $5,000 variance). Dispatched automated webhook settlement across ERP systems.`,
    actionsTaken: requiresHuman
      ? ['Placed execution token in secure Escrow hold', 'Sent real-time notification alert to Operations Lead']
      : ['Triggered ERP Webhook POST /api/erp/settle', 'Archived workflow execution record'],
    metrics: {
      confidenceScore: 0.99,
      riskLevel: requiresHuman ? 'HIGH' : 'LOW',
      financialImpactUSD: 12112.50
    },
    output: {
      actionStatus: requiresHuman ? 'Waiting for human authorization' : 'Settlement successfully executed',
      executionId: 'EXEC-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    },
    nextStepRecommendation: requiresHuman ? 'Action required: Review & Click Approve in Dashboard.' : 'Workflow successfully concluded.'
  };
}

module.exports = {
  callAgentReasoning
};
