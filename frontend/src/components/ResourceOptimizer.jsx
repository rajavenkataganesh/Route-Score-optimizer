import React, { useState } from 'react';
import { 
  Layers, 
  Users, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  PlaySquare, 
  TrendingDown, 
  Scale, 
  Server
} from 'lucide-react';
import ComplexityBadge from './ComplexityBadge';
import { api } from '../services/api';

const PRESETS = [
  { label: 'Standard 4-Task Balance', tasks: '10, 20, 30, 40', workers: 2 },
  { label: "Painter's Partition (9 Tasks)", tasks: '1, 2, 3, 4, 5, 6, 7, 8, 9', workers: 3 },
  { label: 'Cloud Server Batch Jobs', tasks: '15, 25, 40, 10, 35, 50, 20, 30', workers: 4 },
  { label: 'High Capacity Workers', tasks: '100, 200, 300', workers: 5 },
  { label: 'Single Worker Extreme', tasks: '12, 18, 24, 30', workers: 1 }
];

export default function ResourceOptimizer({ onSendToVisualizer }) {
  const [tasksInput, setTasksInput] = useState('10, 20, 30, 40');
  const [workersInput, setWorkersInput] = useState('2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handlePreset = (preset) => {
    setTasksInput(preset.tasks);
    setWorkersInput(preset.workers.toString());
    setError(null);
  };

  const handleOptimize = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    // Validate inputs
    const parsedTasks = tasksInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(Number);

    if (parsedTasks.length === 0) {
      setError('Please provide at least one task workload.');
      return;
    }

    if (parsedTasks.some(isNaN)) {
      setError('Invalid task workloads format. Please enter a comma-separated list of positive numbers.');
      return;
    }

    if (parsedTasks.some(t => t < 0)) {
      setError('Task workloads cannot be negative.');
      return;
    }

    const workers = parseInt(workersInput, 10);
    if (isNaN(workers) || workers <= 0) {
      setError('Worker count must be a positive integer greater than zero.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.optimizeResources(parsedTasks, workers);
      setResult({ ...res, originalTasks: parsedTasks });
    } catch (err) {
      setError(err.message || 'Failed to optimize resource allocation.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTasksInput('10, 20, 30, 40');
    setWorkersInput('2');
    setError(null);
    setResult(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Layers color="#2563eb" size={32} />
            Resource Allocation Optimizer
          </h1>
          <p className="page-description">
            Determines the minimum feasible maximum workload allocated to any worker using Binary Search on the Answer.
            Assumes tasks must remain strictly in order and workers receive contiguous subsets of tasks.
          </p>
        </div>
        <ComplexityBadge 
          timeComplexity="O(n · log(sum - max))" 
          spaceComplexity="O(k)" 
          title="Painter's Partition / Feasibility Binary Search"
        />
      </div>

      {/* Preset Chips */}
      <div className="presets-container">
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Quick Scenarios:</span>
        {PRESETS.map((p, idx) => (
          <button key={idx} className="preset-chip" onClick={() => handlePreset(p)}>
            {p.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* Input Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleOptimize}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                Task Workload Units
                <span className="form-label-hint">(comma-separated numbers)</span>
              </label>
              <input
                type="text"
                className="form-input mono"
                placeholder="e.g. 10, 20, 30, 40"
                value={tasksInput}
                onChange={(e) => setTasksInput(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Available Resources / Workers
                <span className="form-label-hint">(integer &gt; 0)</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                className="form-input"
                placeholder="e.g. 2"
                value={workersInput}
                onChange={(e) => setWorkersInput(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Zap size={16} />
              {loading ? 'Optimizing...' : 'Run Workload Optimizer'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {result && (
        <div>
          {/* Summary Banner */}
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <CheckCircle2 size={24} color="#059669" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                Optimal Workload Limit: {result.optimal_max_workload} units
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.2rem' }}>
                {result.message}
              </div>
            </div>
            {result.steps && result.steps.length > 0 && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onSendToVisualizer({
                  type: 'RESOURCE_OPTIMIZE',
                  data: result
                })}
              >
                <PlaySquare size={16} /> Visualize Search
              </button>
            )}
          </div>

          {/* Metric Stats Grid */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-blue">
                <TrendingDown size={24} />
              </div>
              <div>
                <div className="stat-value">{result.optimal_max_workload}</div>
                <div className="stat-label">Min Max Workload</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-cyan">
                <Scale size={24} />
              </div>
              <div>
                <div className="stat-value">{result.total_workload}</div>
                <div className="stat-label">Total Workload</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-amber">
                <Users size={24} />
              </div>
              <div>
                <div className="stat-value">{result.metrics?.active_workers || result.workers_available}</div>
                <div className="stat-label">Active / Total Workers</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-emerald">
                <Zap size={24} />
              </div>
              <div>
                <div className="stat-value">{result.iterations}</div>
                <div className="stat-label">Search Iterations</div>
              </div>
            </div>
          </div>

          {/* Worker Allocations List */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">
                <Server size={20} color="#2563eb" />
                Resource Workload Allocation Mapping
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Theoretical Bound: [{result.theoretical_lower_bound} .. {result.theoretical_upper_bound}]
              </span>
            </div>

            <div className="grid-2">
              {result.allocations.map((alloc) => {
                const percent = result.optimal_max_workload > 0 
                  ? Math.min(100, Math.round((alloc.total_load / result.optimal_max_workload) * 100))
                  : 0;
                
                return (
                  <div key={alloc.worker_id} className="worker-card">
                    <div className="worker-header">
                      <div className="worker-title">
                        <Users size={18} color="#2563eb" />
                        Worker {alloc.worker_id}
                      </div>
                      <span className="worker-load-badge">
                        Load: {alloc.total_load} / {result.optimal_max_workload} ({percent}%)
                      </span>
                    </div>

                    <div className="worker-progress-track">
                      <div 
                        className="worker-progress-bar"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>
                      Assigned Tasks ({alloc.tasks.length}):
                    </div>

                    <div className="worker-tasks-list">
                      {alloc.tasks.length > 0 ? (
                        alloc.tasks.map((task, tIdx) => (
                          <span key={tIdx} className="task-tag">
                            Task #{alloc.task_indices[tIdx]} = {task}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Idle (No tasks required to achieve optimal balance)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Binary Search Range Iteration Trace Table */}
          {result.steps && result.steps.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Layers size={20} color="#2563eb" />
                  Binary Search on Answer Iterations Trace
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {result.steps.length} checks performed
                </span>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Iter #</th>
                      <th>Lower Bound (Low)</th>
                      <th>Upper Bound (High)</th>
                      <th>Tested Mid Capacity</th>
                      <th>Feasibility Status</th>
                      <th>Workers Needed</th>
                      <th>Pruning Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.steps.map((st) => (
                      <tr key={st.step_number}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          #{st.step_number}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{st.low}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{st.high}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2563eb' }}>
                          {st.mid}
                        </td>
                        <td>
                          {st.feasible ? (
                            <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.825rem' }}>
                              ✔ Feasible (≤ {st.workers_available} workers)
                            </span>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.825rem' }}>
                              ✖ Infeasible (&gt; {st.workers_available} workers)
                            </span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {st.workers_needed === Infinity ? 'Exceeds Single Task' : st.workers_needed}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#334155' }}>
                          {st.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
