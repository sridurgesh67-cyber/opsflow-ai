import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Bot, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  DollarSign, 
  FileCheck, 
  Cpu, 
  Activity,
  Send,
  XCircle,
  Clock
} from 'lucide-react';

export default function WorkflowDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWorkflow = async () => {
    try {
      const res = await api.get(`/workflows/${id}`);
      setWorkflow(res.data.workflow);
    } catch (err) {
      console.error('Failed to load workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
    // Poll while processing
    const interval = setInterval(() => {
      if (workflow?.status === 'PROCESSING') {
        fetchWorkflow();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [id, workflow?.status]);

  const handleApproval = async (action) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/workflows/${id}/approve`, {
        action,
        notes: approvalNotes
      });
      setWorkflow(res.data.workflow);
    } catch (err) {
      console.error('Action error:', err);
      alert('Error updating approval status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
        Loading autonomous agent reasoning telemetry...
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <p>Workflow not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-cyan-400 text-sm hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Mission Control
      </button>

      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-slate-500 uppercase">{workflow.id}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                {workflow.category}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                workflow.priority === 'HIGH' || workflow.priority === 'CRITICAL'
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                  : 'bg-indigo-950/80 text-indigo-300'
              }`}>
                Priority: {workflow.priority}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{workflow.title}</h1>
          </div>

          <div>
            {workflow.status === 'RESOLVED' && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                <CheckCircle2 className="w-4 h-4" /> Settled & Executed
              </span>
            )}
            {workflow.status === 'PENDING_APPROVAL' && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80 animate-pulse">
                <AlertTriangle className="w-4 h-4" /> Human Escrow Hold
              </span>
            )}
            {workflow.status === 'PROCESSING' && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
                <RefreshCw className="w-4 h-4 animate-spin" /> Swarm Executing Step-by-Step
              </span>
            )}
            {workflow.status === 'REJECTED' && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/80">
                <XCircle className="w-4 h-4" /> Rejected by Supervisor
              </span>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 text-xs text-slate-300 leading-relaxed font-mono">
          <span className="text-slate-500 uppercase block mb-1 font-sans text-[11px] font-semibold">Incident / Invoice Context:</span>
          {workflow.description}
        </div>
      </div>

      {/* Human-in-the-Loop Action Panel if pending */}
      {workflow.status === 'PENDING_APPROVAL' && (
        <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/30 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Human-in-the-Loop Supervisory Escrow Hold</h2>
              <p className="text-xs text-slate-300">
                The autonomous agent swarm has completed the policy audit and negotiated credit terms. Due to high financial impact, your explicit managerial authorization is required to disburse adjusted settlement.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Supervisor Notes / Comments
            </label>
            <input
              type="text"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="e.g., Verified against AWS Enterprise Support MSA. Authorizing adjusted $12,112.50 payment."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleApproval('APPROVED')}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize & Execute Settlement ($12,112.50)</span>
            </button>

            <button
              onClick={() => handleApproval('REJECTED')}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject / Halt Disbursement</span>
            </button>
          </div>
        </div>
      )}

      {/* Autonomous Multi-Agent Reasoning Trace */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Autonomous Multi-Agent Deliberation Trace</span>
          </h2>
          <span className="text-xs text-slate-400">
            {workflow.stages?.length || 0} Stages Executed
          </span>
        </div>

        <div className="space-y-4">
          {(workflow.stages || []).map((stage, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{stage.agent}</h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(stage.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    stage.status === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : stage.status === 'AWAITING_HUMAN'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                  }`}>
                    {stage.status}
                  </span>
                </div>
              </div>

              {/* Thought & Analytical Reasoning */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Agent Analytical Reasoning:
                </span>
                <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {stage.thought}
                </p>
              </div>

              {/* Metrics Grid */}
              {stage.metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Confidence Score</span>
                    <span className="text-sm font-bold text-cyan-400">
                      {Math.round((stage.metrics.confidenceScore || 0.95) * 100)}%
                    </span>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Risk Level</span>
                    <span className={`text-sm font-bold ${
                      stage.metrics.riskLevel === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {stage.metrics.riskLevel || 'LOW'}
                    </span>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Financial Delta</span>
                    <span className="text-sm font-bold text-amber-400">
                      ${stage.metrics.financialImpactUSD?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              )}

              {/* Structured Output Data */}
              {stage.output && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Structured Artifact Output:
                  </span>
                  <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-xl text-slate-300 overflow-x-auto border border-slate-800">
                    {JSON.stringify(stage.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
