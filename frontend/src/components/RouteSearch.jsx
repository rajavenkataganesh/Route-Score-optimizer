import React, { useState } from 'react';
import { 
  RotateCw, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  PlaySquare, 
  Milestone, 
  Compass
} from 'lucide-react';
import ComplexityBadge from './ComplexityBadge';
import { api } from '../services/api';

const PRESETS = [
  { label: 'Airport Flight Waypoints', routes: '40, 50, 60, 70, 10, 20, 30', target: '20' },
  { label: 'High Altitude Waypoint', routes: '40, 50, 60, 70, 10, 20, 30', target: '60' },
  { label: 'Unrotated Standard Waypoint', routes: '15, 25, 35, 45, 55, 65', target: '45' },
  { label: 'Large Rotation Offset', routes: '6, 7, 8, 9, 1, 2, 3, 4, 5', target: '1' },
  { label: 'Non-Existent Waypoint', routes: '50, 60, 70, 10, 20, 30', target: '99' }
];

export default function RouteSearch({ onSendToVisualizer }) {
  const [routesInput, setRoutesInput] = useState('40, 50, 60, 70, 10, 20, 30');
  const [targetInput, setTargetInput] = useState('20');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handlePreset = (preset) => {
    setRoutesInput(preset.routes);
    setTargetInput(preset.target);
    setError(null);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    const parsedRoutes = routesInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(Number);

    if (parsedRoutes.length === 0) {
      setError('Please provide a non-empty list of route IDs or scores.');
      return;
    }

    if (parsedRoutes.some(isNaN)) {
      setError('Invalid format: routes must be comma-separated numbers.');
      return;
    }

    const target = Number(targetInput.trim());
    if (isNaN(target)) {
      setError('Please provide a valid numeric target value.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.searchRoute(parsedRoutes, target);
      setResult({ ...res, originalRoutes: parsedRoutes });
    } catch (err) {
      setError(err.message || 'Failed to search rotated array.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRoutesInput('40, 50, 60, 70, 10, 20, 30');
    setTargetInput('20');
    setError(null);
    setResult(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <RotateCw color="#2563eb" size={32} />
            Route Search in Rotated Array
          </h1>
          <p className="page-description">
            Executes modified Binary Search on route scores or identifiers stored in circular / rotated sorted arrays.
            Identifies the sorted subarray at each step to preserve logarithmic execution time.
          </p>
        </div>
        <ComplexityBadge 
          timeComplexity="O(log n)" 
          spaceComplexity="O(1)" 
          title="Rotated Array Binary Search"
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
        <form onSubmit={handleSearch}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                Rotated Sorted Route IDs / Scores
                <span className="form-label-hint">(comma-separated numbers)</span>
              </label>
              <input
                type="text"
                className="form-input mono"
                placeholder="e.g. 40, 50, 60, 70, 10, 20, 30"
                value={routesInput}
                onChange={(e) => setRoutesInput(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Target Route ID / Score
                <span className="form-label-hint">(numeric value to find)</span>
              </label>
              <input
                type="number"
                className="form-input mono"
                placeholder="e.g. 20"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={16} />
              {loading ? 'Searching...' : 'Search Rotated Array'}
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
          {/* Result Alert */}
          <div className={`alert ${result.found ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
            {result.found ? (
              <CheckCircle2 size={24} color="#059669" />
            ) : (
              <XCircle size={24} color="#dc2626" />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                {result.found 
                  ? `Target Route ${result.target} Located at Index ${result.index}`
                  : `Target Route ${result.target} Not Found in Array`}
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.2rem' }}>
                {result.message}
              </div>
            </div>
            {result.steps && result.steps.length > 0 && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onSendToVisualizer({
                  type: 'ROUTE_SEARCH',
                  data: result
                })}
              >
                <PlaySquare size={16} /> Open in Visualizer
              </button>
            )}
          </div>

          {/* Metrics Cards */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-blue">
                <Milestone size={24} />
              </div>
              <div>
                <div className="stat-value">{result.index !== -1 ? result.index : 'N/A'}</div>
                <div className="stat-label">Matching Index</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-cyan">
                <Compass size={24} />
              </div>
              <div>
                <div className="stat-value">
                  {result.pivot_index !== null ? `Idx ${result.pivot_index}` : 'None'}
                </div>
                <div className="stat-label">Rotation Pivot</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-amber">
                <RotateCw size={24} />
              </div>
              <div>
                <div className="stat-value">{result.iterations}</div>
                <div className="stat-label">Binary Comparisons</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-emerald">
                <Search size={24} />
              </div>
              <div>
                <div className="stat-value">{result.total_elements}</div>
                <div className="stat-label">Array Size</div>
              </div>
            </div>
          </div>

          {/* Rotated Array Visual Layout */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">
                <RotateCw size={20} color="#2563eb" />
                Rotated Array Topology
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Pivot index is highlighted in cyan; match in emerald
              </span>
            </div>

            <div className="array-container">
              {result.originalRoutes.map((val, idx) => {
                const isPivot = idx === result.pivot_index;
                const isMatch = idx === result.index;

                return (
                  <div key={idx} className="array-cell-wrapper">
                    {isMatch && <span className="pointer-badge" style={{ background: '#10b981', color: '#fff' }}>MATCH</span>}
                    {isPivot && !isMatch && <span className="pointer-badge pointer-pivot">PIVOT</span>}
                    
                    <div className={`array-cell ${isMatch ? 'is-found' : ''}`} style={{
                      borderColor: isPivot && !isMatch ? '#0891b2' : undefined,
                      backgroundColor: isPivot && !isMatch ? '#ecfeff' : undefined
                    }}>
                      {val}
                    </div>

                    <span className="cell-index">[{idx}]</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trace Table */}
          {result.steps && result.steps.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Compass size={20} color="#2563eb" />
                  Rotated Array Search Decision Trace
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {result.steps.length} steps recorded
                </span>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Step #</th>
                      <th>Low (Idx)</th>
                      <th>Mid (Idx & Val)</th>
                      <th>High (Idx)</th>
                      <th>Sorted Subarray</th>
                      <th>Decision & Logic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.steps.map((st) => (
                      <tr key={st.step_number}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          #{st.step_number}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{st.low}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2563eb' }}>
                          [{st.mid}] = {st.mid_value}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{st.high}</td>
                        <td>
                          <span className="complexity-tag" style={{ textTransform: 'uppercase' }}>
                            {st.sorted_half}
                          </span>
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
