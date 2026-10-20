import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RotateCcw, 
  PlaySquare, 
  TrendingUp, 
  Award,
  ArrowUpDown
} from 'lucide-react';
import ComplexityBadge from './ComplexityBadge';
import { api } from '../services/api';

const PRESETS = [
  { label: 'Student Exam Percentiles', scores: '15, 28, 35, 42, 56, 68, 77, 85, 94, 99', target: '77' },
  { label: 'Leaderboard Points', scores: '100, 250, 400, 650, 900, 1200, 1500', target: '400' },
  { label: 'Latency Thresholds (ms)', scores: '12, 24, 36, 48, 60, 72, 84, 96', target: '12' },
  { label: 'Highest Score Match', scores: '10, 20, 30, 40, 50, 60, 70, 80', target: '80' },
  { label: 'Score Absent in Range', scores: '10, 20, 30, 40, 50', target: '25' }
];

export default function ScoreSearch({ onSendToVisualizer }) {
  const [scoresInput, setScoresInput] = useState('15, 28, 35, 42, 56, 68, 77, 85, 94, 99');
  const [targetInput, setTargetInput] = useState('77');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handlePreset = (preset) => {
    setScoresInput(preset.scores);
    setTargetInput(preset.target);
    setError(null);
  };

  const handleAutoSort = () => {
    const parsed = scoresInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(Number)
      .filter(n => !isNaN(n));

    parsed.sort((a, b) => a - b);
    setScoresInput(parsed.join(', '));
    setError(null);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    const parsedScores = scoresInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(Number);

    if (parsedScores.length === 0) {
      setError('Please provide at least one score in the array.');
      return;
    }

    if (parsedScores.some(isNaN)) {
      setError('Invalid format: scores must be comma-separated numbers.');
      return;
    }

    // Check if sorted
    for (let i = 0; i < parsedScores.length - 1; i++) {
      if (parsedScores[i] > parsedScores[i + 1]) {
        setError(`Array is not sorted: ${parsedScores[i]} > ${parsedScores[i+1]} at index ${i}. Use the "Auto-Sort Array" button to sort.`);
        return;
      }
    }

    const target = Number(targetInput.trim());
    if (isNaN(target)) {
      setError('Please provide a valid numeric target score.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.searchScore(parsedScores, target);
      setResult({ ...res, originalScores: parsedScores });
    } catch (err) {
      setError(err.message || 'Failed to execute binary search.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScoresInput('15, 28, 35, 42, 56, 68, 77, 85, 94, 99');
    setTargetInput('77');
    setError(null);
    setResult(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Search color="#2563eb" size={32} />
            Score Search (Standard Binary Search)
          </h1>
          <p className="page-description">
            Searches for a target score inside a sorted array in guaranteed O(log n) time.
            Visualizes every interval reduction and mid-point comparison.
          </p>
        </div>
        <ComplexityBadge 
          timeComplexity="O(log n)" 
          spaceComplexity="O(1)" 
          title="Classical Binary Search"
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Sorted Scores Array
                  <span className="form-label-hint">(ascending order)</span>
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={handleAutoSort}
                  title="Sort the entered numbers in ascending order"
                >
                  <ArrowUpDown size={12} /> Auto-Sort Array
                </button>
              </div>
              <input
                type="text"
                className="form-input mono"
                placeholder="e.g. 10, 20, 30, 40, 50"
                value={scoresInput}
                onChange={(e) => setScoresInput(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Target Score to Locate
                <span className="form-label-hint">(number)</span>
              </label>
              <input
                type="number"
                className="form-input mono"
                placeholder="e.g. 77"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={16} />
              {loading ? 'Searching...' : 'Run Binary Search'}
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
                  ? `Target Score ${result.target} Located at Index ${result.index}`
                  : `Target Score ${result.target} Not Present in Array`}
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.2rem' }}>
                {result.message}
              </div>
            </div>
            {result.steps && result.steps.length > 0 && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onSendToVisualizer({
                  type: 'SCORE_SEARCH',
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
                <Award size={24} />
              </div>
              <div>
                <div className="stat-value">{result.index !== -1 ? result.index : 'N/A'}</div>
                <div className="stat-label">Position Index</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-emerald">
                <Search size={24} />
              </div>
              <div>
                <div className="stat-value">{result.iterations}</div>
                <div className="stat-label">Binary Comparisons</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-amber">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="stat-value">
                  {Math.ceil(Math.log2(Math.max(1, result.total_elements)))}
                </div>
                <div className="stat-label">Max Theoretical Steps</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-cyan">
                <Award size={24} />
              </div>
              <div>
                <div className="stat-value">{result.total_elements}</div>
                <div className="stat-label">Total Elements</div>
              </div>
            </div>
          </div>

          {/* Array Visual Display */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">
                <Search size={20} color="#2563eb" />
                Sorted Array Layout
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Target match highlighted in emerald
              </span>
            </div>

            <div className="array-container">
              {result.originalScores.map((score, idx) => {
                const isMatch = idx === result.index;
                return (
                  <div key={idx} className="array-cell-wrapper">
                    {isMatch && <span className="pointer-badge" style={{ background: '#10b981', color: '#fff' }}>MATCH</span>}
                    <div className={`array-cell ${isMatch ? 'is-found' : ''}`}>
                      {score}
                    </div>
                    <span className="cell-index">[{idx}]</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps Table */}
          {result.steps && result.steps.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Search size={20} color="#2563eb" />
                  Binary Search Comparison Trace
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {result.steps.length} steps executed
                </span>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Step #</th>
                      <th>Low Pointer</th>
                      <th>Mid Pointer</th>
                      <th>Mid Value</th>
                      <th>High Pointer</th>
                      <th>Comparison & Adjustment</th>
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
                          {st.mid}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {st.mid_value}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{st.high}</td>
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
