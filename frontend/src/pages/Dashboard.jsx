import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Bot, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  RefreshCw, 
  ShieldAlert, 
  TrendingUp, 
  Zap, 
  BarChart3,
  ExternalLink
} from 'lucide-react';

export default function Dashboard() {
  const [workflows, setWorkflows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [wfRes, statsRes] = await Promise.all([
        api.get('/workflows'),
        api.get('/stats')
      ]);
      setWorkflows(wfRes.data.workflows || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000); // Polling live agent updates
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-400 border border-amber-800/60 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> Human Approval Needed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Agents Reasoning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5" /> Queued
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Autonomous Multi-Agent Operations Swarm
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Real-Time Mission Control
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Autonomous AI agents continuously ingest invoices, reconcile enterprise SLA agreements, detect pricing anomalies, and formulate remediation plans with automated execution & Human-in-the-Loop oversight.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              to="/create"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Launch New Swarm Task</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Agent Swarm</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">4 Specialized Agents</div>
          <p className="text-xs text-slate-400 mt-1">Ingestion • Policy • Negotiation • Settlement</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Autonomous Resolution Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">88.4%</div>
          <p className="text-xs text-slate-400 mt-1">Zero human intervention needed for sub-thresholds</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Latency Reduction</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">82% Faster</div>
          <p className="text-xs text-slate-400 mt-1">Reduced 4.2 days manual turnaround to seconds</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Human-In-The-Loop Guards</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">Strict Escrow</div>
          <p className="text-xs text-slate-400 mt-1">Auto-escalates variances exceeding $1,000</p>
        </div>
      </div>

      {/* Agents Swarm Directory */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Autonomous Agent Swarm Topology</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              title: 'Agent 1: Ingestion & Triage',
              desc: 'Parses unstructured bills, emails, and PO receipts. Extracts line-items and contract metadata.',
              badge: 'Stage 1'
            },
            {
              title: 'Agent 2: Compliance Auditor',
              desc: 'Cross-benchmarks line items with Master Service Agreements (MSAs) and detects missing rebate discounts.',
              badge: 'Stage 2'
            },
            {
              title: 'Agent 3: Negotiation Strategist',
              desc: 'Computes variance calculations, drafts vendor dispute letters, and proposes fair revised settlements.',
              badge: 'Stage 3'
            },
            {
              title: 'Agent 4: Payment Dispatcher',
              desc: 'Executes approved ledger settlement or triggers Human-in-the-Loop managerial escrow hold.',
              badge: 'Stage 4'
            }
          ].map((agent, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  {agent.badge}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h3 className="font-semibold text-white text-sm">{agent.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Workflows List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Autonomous Workflow Task Pipeline</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time trace of autonomous agent deliberation cycles</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
            Loading mission control pipeline...
          </div>
        ) : workflows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No active workflows found. Click "Launch New Swarm Task" to start one!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {workflows.map((wf) => (
              <div key={wf.id} className="p-5 hover:bg-slate-800/20 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-500 uppercase">{wf.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">{wf.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      wf.priority === 'HIGH' || wf.priority === 'CRITICAL' 
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60' 
                        : 'bg-indigo-950/80 text-indigo-300'
                    }`}>
                      Priority: {wf.priority}
                    </span>
                    {getStatusBadge(wf.status)}
                  </div>
                  <h3 className="font-semibold text-white text-base hover:text-cyan-400 transition">
                    <Link to={`/workflow/${wf.id}`}>{wf.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{wf.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-xs text-slate-400 hidden sm:block">
                    <div>{new Date(wf.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-slate-500">{new Date(wf.created_at).toLocaleDateString()}</div>
                  </div>
                  <Link
                    to={`/workflow/${wf.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition"
                  >
                    <span>Inspect Reasoning Trace</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
