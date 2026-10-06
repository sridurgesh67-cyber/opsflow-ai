import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Bot, Sparkles, Send, FileText, ArrowLeft, Layers } from 'lucide-react';

const PRESETS = [
  {
    title: 'Vendor Billing Variance - AWS Cloud Egress & Reserved Tier',
    category: 'Procurement & Finance',
    priority: 'HIGH',
    description: 'Vendor Amazon Web Services issued invoice #AWS-9921 for $14,250. Our contractual Master Services Agreement (MSA) specifies a 15% egress tier rebate for enterprise volumes over 50TB, which was erroneously omitted. Please investigate discrepancy, draft dispute response, and negotiate credit memo.'
  },
  {
    title: 'SaaS Software License Auto-Renewal Multi-Seat Overage',
    category: 'Procurement & IT Asset Ops',
    priority: 'MEDIUM',
    description: 'Datadog submitted quarterly renewal charge for 120 host units at $3,600. Contract terms stipulate inactive agent de-provisioning credits for decommissioned staging clusters (18 hosts unused for 45+ days).'
  },
  {
    title: 'Emergency API Gateway SLA Breach & Credit Penalties',
    category: 'Cross-System SLA & DevOps',
    priority: 'CRITICAL',
    description: 'Third-party Payment Gateway provider Stripe experienced 142 minutes of unplanned downtime exceeding the guaranteed 99.95% uptime SLA in Section 6.2. Autonomous credit refund of $4,800 is required according to penalty clauses.'
  }
];

export default function CreateWorkflow() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Procurement & Finance');
  const [priority, setPriority] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setPriority(preset.priority);
    setDescription(preset.description);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/workflows', {
        title,
        category,
        priority,
        description
      });
      navigate(`/workflow/${res.data.workflow.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to trigger agent swarm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Mission Control
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Deploy Autonomous Agent Swarm</h1>
            <p className="text-sm text-slate-400">
              Submit an enterprise operational problem. The multi-agent swarm will ingest, audit, negotiate, and execute remediation.
            </p>
          </div>
        </div>

        {/* Quick Scenario Preset Selector */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Real-World Industry Presets (1-Click Fill)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-left p-3.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition text-xs space-y-1.5 group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-cyan-400 transition line-clamp-1">{p.title}</div>
                <div className="text-slate-400 text-[11px] line-clamp-2">{p.description}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">{p.priority}</span>
                  <span className="text-[10px] text-cyan-400">Load preset &rarr;</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Task or Invoice Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Snowflake Data Warehouse Unexpected Compute Burst & Overage"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Operational Domain / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm"
              >
                <option value="Procurement & Finance">Procurement & Finance</option>
                <option value="Cloud & Infrastructure Invoicing">Cloud & Infrastructure Invoicing</option>
                <option value="Cross-System SLA & DevOps">Cross-System SLA & DevOps</option>
                <option value="Vendor Contract Governance">Vendor Contract Governance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority & Escalation Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm"
              >
                <option value="LOW">LOW (Sub-$500 variance, full auto)</option>
                <option value="MEDIUM">MEDIUM (Standard reconciliation)</option>
                <option value="HIGH">HIGH (Requires Human-in-the-Loop review)</option>
                <option value="CRITICAL">CRITICAL (Immediate Escrow pause)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Problem Description & Multi-System Details
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Detail the invoice line items, unexpected variance, terms breached, and systems involved..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Initialize Autonomous Reasoning Swarm</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
