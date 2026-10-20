import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Search, 
  RotateCw, 
  Layers, 
  Zap, 
  ArrowRight, 
  Clock, 
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ setActiveTab, onSelectHistoryItem }) {
  const [stats, setStats] = useState({
    total_operations: 0,
    score_searches: 0,
    route_searches: 0,
    resource_optimizations: 0,
    avg_iterations: 0
  });
  const [history, setHistory] = useState([]);

  async function fetchDashboardData() {
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.getStats().catch(() => null),
        api.getHistory().catch(() => ({ items: [] }))
      ]);

      if (statsRes) setStats(statsRes);
      if (historyRes) setHistory(historyRes.items || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart3 color="#2563eb" size={32} />
            Route & Score Optimization Hub
          </h1>
          <p className="page-description">
            High-efficiency logarithmic algorithms implemented in Python FastAPI.
            Explore standard Binary Search, Rotated Sorted Array resolution, and Binary Search on Answer for contiguous workload allocation.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
          <Activity size={15} /> Refresh Data
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <Activity size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.total_operations}</div>
            <div className="stat-label">Total Executions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-cyan">
            <Layers size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.resource_optimizations}</div>
            <div className="stat-label">Optimizations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <RotateCw size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.route_searches}</div>
            <div className="stat-label">Rotated Searches</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">
            <TrendingUp size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.avg_iterations.toFixed(1)}</div>
            <div className="stat-label">Avg Iterations</div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Cards */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Zap size={20} color="#2563eb" />
            Core Algorithm Toolkits
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Select a module to execute</span>
        </div>

        <div className="grid-3">
          {/* Resource Optimizer Card */}
          <div 
            className="card" 
            style={{ 
              background: 'linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%)', 
              borderColor: '#bfdbfe',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('optimizer')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '8px', background: '#dbeafe', color: '#1d4ed8' }}>
                <Layers size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e3a8a' }}>Resource Optimizer</h3>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Binary Search on Answer</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', minHeight: '42px' }}>
              Calculate the minimum possible maximum workload across available workers with contiguous task allocations.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="complexity-tag">O(n · log(sum-max))</span>
              <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Launch <ArrowRight size={15} />
              </span>
            </div>
          </div>

          {/* Route Search Card */}
          <div 
            className="card" 
            style={{ 
              background: 'linear-gradient(180deg, #ffffff 0%, #fefce8 100%)', 
              borderColor: '#fef08a',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('routes')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '8px', background: '#fef3c7', color: '#b45309' }}>
                <RotateCw size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#854d0e' }}>Route Search</h3>
                <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Rotated Sorted Array</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', minHeight: '42px' }}>
              Locate route scores and flight checkpoints stored in rotated arrays with pivot detection in logarithmic time.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="complexity-tag" style={{ background: '#fef3c7', color: '#92400e' }}>O(log n)</span>
              <span style={{ color: '#d97706', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Launch <ArrowRight size={15} />
              </span>
            </div>
          </div>

          {/* Score Search Card */}
          <div 
            className="card" 
            style={{ 
              background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)', 
              borderColor: '#bbf7d0',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('scores')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '8px', background: '#dcfce7', color: '#15803d' }}>
                <Search size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#14532d' }}>Score Search</h3>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Standard Binary Search</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', minHeight: '42px' }}>
              Find exact rank or score position in sorted datasets, recording all low, mid, and high boundary adjustments.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="complexity-tag" style={{ background: '#dcfce7', color: '#166534' }}>O(log n)</span>
              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Launch <ArrowRight size={15} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Clock size={20} color="#2563eb" />
            Recent Session Operations
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('reports')}>
            View Full Report
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            <HelpCircle size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#334155' }}>No operations recorded yet</div>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Execute a Resource Optimization, Route Search, or Score Search to track runtime metrics here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operation</th>
                  <th>Inputs</th>
                  <th>Outcome</th>
                  <th>Iterations</th>
                  <th>Latency</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#64748b' }}>
                      {item.timestamp}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{item.title}</span>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: '#475569' }}>
                      {item.input_summary}
                    </td>
                    <td>
                      {item.status === 'SUCCESS' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 600, fontSize: '0.825rem' }}>
                          <CheckCircle2 size={14} /> {item.result_summary}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#d97706', fontWeight: 600, fontSize: '0.825rem' }}>
                          <XCircle size={14} /> {item.result_summary}
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {item.iterations}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#64748b' }}>
                      {item.execution_time_ms} ms
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline-blue btn-sm"
                        onClick={() => {
                          if (onSelectHistoryItem) onSelectHistoryItem(item);
                          setActiveTab('visualizer');
                        }}
                      >
                        Visualizer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
