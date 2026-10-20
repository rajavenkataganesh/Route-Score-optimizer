import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function Reports() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getHistory();
      setHistory(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all session history?')) {
      return;
    }
    try {
      await api.clearHistory();
      setHistory([]);
      setStatusMsg('Session history cleared successfully.');
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err) {
      alert('Failed to clear history: ' + err.message);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.operation_type === filterType;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileSpreadsheet color="#2563eb" size={32} />
            Execution Reports & Session History
          </h1>
          <p className="page-description">
            Audit trail of all DSA optimization and search operations during this session.
            Export full dataset as CSV or filter by operation family.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href={api.getCsvExportUrl()}
            download="optimizer_history_report.csv"
            className="btn btn-primary btn-sm"
          >
            <Download size={16} /> Download CSV Report
          </a>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleClearHistory}
            disabled={history.length === 0}
          >
            <Trash2 size={16} /> Clear History
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          <div>{statusMsg}</div>
        </div>
      )}

      {/* Filter Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Filter size={16} color="#64748b" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Filter by:</span>

        {['ALL', 'RESOURCE_OPTIMIZE', 'ROUTE_SEARCH', 'SCORE_SEARCH'].map((type) => (
          <button
            key={type}
            className={`preset-chip ${filterType === type ? 'active' : ''}`}
            style={{
              backgroundColor: filterType === type ? '#dbeafe' : undefined,
              borderColor: filterType === type ? '#3b82f6' : undefined,
              color: filterType === type ? '#1d4ed8' : undefined
            }}
            onClick={() => setFilterType(type)}
          >
            {type === 'ALL' && 'All Operations'}
            {type === 'RESOURCE_OPTIMIZE' && 'Resource Optimizer'}
            {type === 'ROUTE_SEARCH' && 'Route Searches'}
            {type === 'SCORE_SEARCH' && 'Score Searches'}
          </button>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Clock size={20} color="#2563eb" />
            Session Operations Log ({filteredHistory.length} of {history.length})
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={fetchHistory}>
            <Activity size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading execution records...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <AlertCircle size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#334155' }}>No operations found</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Run algorithms from the Resource Optimizer, Route Search, or Score Search to generate audit logs.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Timestamp</th>
                  <th>Algorithm</th>
                  <th>Input Specification</th>
                  <th>Outcome / Allocation</th>
                  <th>Iterations</th>
                  <th>Runtime (ms)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#64748b' }}>
                      #{item.id}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#64748b' }}>
                      {item.timestamp}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e3a8a' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.operation_type}</div>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: '#334155', maxWidth: '280px' }}>
                      {item.input_summary}
                    </td>
                    <td style={{ fontSize: '0.825rem', color: '#0f172a', fontWeight: 600 }}>
                      {item.result_summary}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {item.iterations}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#64748b' }}>
                      {item.execution_time_ms} ms
                    </td>
                    <td>
                      {item.status === 'SUCCESS' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#059669', fontWeight: 600, fontSize: '0.8rem' }}>
                          <CheckCircle2 size={14} /> Success
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#d97706', fontWeight: 600, fontSize: '0.8rem' }}>
                          <XCircle size={14} /> Not Found
                        </span>
                      )}
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
