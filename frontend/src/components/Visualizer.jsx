import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PlaySquare, 
  Search, 
  RotateCw, 
  Layers, 
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import StepControls from './StepControls';
import ComplexityBadge from './ComplexityBadge';
import { api } from '../services/api';

export default function Visualizer({ initialData }) {
  const [activeMode, setActiveMode] = useState(initialData?.type || 'SCORE_SEARCH');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1200);

  // Loaded payload data
  const [visualData, setVisualData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);

  const loadDemo = useCallback(async (mode) => {
    setError(null);
    setLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    try {
      if (mode === 'SCORE_SEARCH') {
        const res = await api.searchScore([10, 20, 30, 40, 50, 60, 70, 80], 60);
        setVisualData({ ...res, originalScores: [10, 20, 30, 40, 50, 60, 70, 80] });
      } else if (mode === 'ROUTE_SEARCH') {
        const res = await api.searchRoute([40, 50, 60, 70, 10, 20, 30], 20);
        setVisualData({ ...res, originalRoutes: [40, 50, 60, 70, 10, 20, 30] });
      } else if (mode === 'RESOURCE_OPTIMIZE') {
        const res = await api.optimizeResources([10, 20, 30, 40], 2);
        setVisualData({ ...res, originalTasks: [10, 20, 30, 40] });
      }
    } catch (err) {
      setError(err.message || 'Failed to load visualizer data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // If initialData is passed from outside, initialize with it
  useEffect(() => {
    if (initialData && initialData.data) {
      setActiveMode(initialData.type);
      setVisualData(initialData.data);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } else {
      loadDemo(activeMode);
    }
  }, [initialData, activeMode, loadDemo]);

  const steps = visualData?.steps || [];
  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex] || null;

  // Auto playback effect
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalSteps, playbackSpeed]);

  const handleModeSwitch = (mode) => {
    setActiveMode(mode);
    loadDemo(mode);
  };

  const handlePlayPause = () => {
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFirst = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleLast = () => {
    setIsPlaying(false);
    setCurrentStepIndex(totalSteps - 1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <PlaySquare color="#2563eb" size={32} />
            Interactive Algorithm Visualizer
          </h1>
          <p className="page-description">
            Step through Binary Search operations in slow motion. Watch low, mid, and high pointers dynamically adjust,
            active search spaces shrink logarithmically, and feasibility checks evaluate workloads.
          </p>
        </div>
        <ComplexityBadge 
          timeComplexity={visualData?.time_complexity || "O(log n)"} 
          spaceComplexity={visualData?.space_complexity || "O(1)"} 
          title="Active Complexity"
        />
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeMode === 'SCORE_SEARCH' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => handleModeSwitch('SCORE_SEARCH')}
        >
          <Search size={15} /> Standard Score Search
        </button>
        <button
          className={`btn ${activeMode === 'ROUTE_SEARCH' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => handleModeSwitch('ROUTE_SEARCH')}
        >
          <RotateCw size={15} /> Rotated Route Search
        </button>
        <button
          className={`btn ${activeMode === 'RESOURCE_OPTIMIZE' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => handleModeSwitch('RESOURCE_OPTIMIZE')}
        >
          <Layers size={15} /> Resource Allocation (Search on Answer)
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading visualizer execution trace...
        </div>
      ) : totalSteps === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <HelpCircle size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
          <div>No steps available to visualize for this run.</div>
        </div>
      ) : (
        <div>
          {/* Main Stage */}
          <div className="visualizer-stage">
            {/* Visual Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target / Objective:
                </span>
                <span style={{ marginLeft: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>
                  {activeMode === 'RESOURCE_OPTIMIZE'
                    ? `Minimize Max Workload for ${visualData?.workers_available} Workers`
                    : `Find Value ${visualData?.target}`}
                </span>
              </div>

              {/* Status Tag */}
              <div>
                {currentStep && (
                  <span className="complexity-tag" style={{
                    fontSize: '0.85rem',
                    background: currentStep.action === 'found' || currentStep.feasible ? '#dcfce7' : '#fee2e2',
                    color: currentStep.action === 'found' || currentStep.feasible ? '#15803d' : '#b91c1c'
                  }}>
                    Action: {currentStep.action ? currentStep.action.toUpperCase() : (currentStep.feasible ? 'FEASIBLE' : 'INFEASIBLE')}
                  </span>
                )}
              </div>
            </div>

            {/* Canvas Rendering depending on Mode */}
            {activeMode === 'RESOURCE_OPTIMIZE' ? (
              /* Resource Allocation Visualizer */
              <div>
                {/* Workload Range Bar */}
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
                    <span>Low Bound: {currentStep.low}</span>
                    <span style={{ color: '#2563eb', fontSize: '1rem' }}>Tested Candidate Mid: {currentStep.mid}</span>
                    <span>High Bound: {currentStep.high}</span>
                  </div>

                  <div style={{ position: 'relative', height: '14px', background: '#cbd5e1', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        position: 'absolute',
                        left: `${Math.max(0, Math.min(100, ((currentStep.low - visualData.theoretical_lower_bound) / Math.max(1, (visualData.theoretical_upper_bound - visualData.theoretical_lower_bound))) * 100))}%`,
                        width: `${Math.max(2, Math.min(100, ((currentStep.high - currentStep.low) / Math.max(1, (visualData.theoretical_upper_bound - visualData.theoretical_lower_bound))) * 100))}%`,
                        height: '100%',
                        background: '#3b82f6',
                        borderRadius: '9999px'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Worker Allocation Simulation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a8a' }}>
                    Greedy Worker Packing Simulation (Max Capacity = {currentStep.mid})
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: currentStep.feasible ? '#059669' : '#dc2626' }}>
                    Workers Needed: {currentStep.workers_needed} / {currentStep.workers_available} available
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
                  {visualData.originalTasks?.map((task, idx) => (
                    <div key={idx} style={{ 
                      padding: '0.6rem 0.85rem', 
                      background: '#fff', 
                      borderRadius: '6px', 
                      border: '1px solid #cbd5e1',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      Task #{idx} = {task}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Standard Array or Rotated Array Visualizer */
              <div className="array-container">
                {(activeMode === 'SCORE_SEARCH' ? visualData.originalScores : visualData.originalRoutes)?.map((val, idx) => {
                  const isLow = idx === currentStep?.low;
                  const isMid = idx === currentStep?.mid;
                  const isHigh = idx === currentStep?.high;
                  const isFound = currentStep?.action === 'found' && isMid;
                  const inActiveRange = currentStep?.active_range?.includes(idx);
                  const isPivot = activeMode === 'ROUTE_SEARCH' && idx === visualData.pivot_index;

                  return (
                    <div key={idx} className="array-cell-wrapper">
                      {/* Pointers Row */}
                      <div style={{ minHeight: '24px', display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                        {isFound && <span className="pointer-badge" style={{ background: '#10b981', color: '#fff' }}>FOUND</span>}
                        {!isFound && isLow && <span className="pointer-badge pointer-low">LOW</span>}
                        {!isFound && isMid && <span className="pointer-badge pointer-mid">MID</span>}
                        {!isFound && isHigh && <span className="pointer-badge pointer-high">HIGH</span>}
                        {isPivot && !isMid && <span className="pointer-badge pointer-pivot">PIVOT</span>}
                      </div>

                      {/* Cell Box */}
                      <div 
                        className={`array-cell 
                          ${inActiveRange ? 'active-range' : 'pruned'} 
                          ${isMid ? 'is-mid' : ''} 
                          ${isFound ? 'is-found' : ''}`
                        }
                      >
                        {val}
                      </div>

                      {/* Cell Index */}
                      <span className="cell-index">[{idx}]</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Explanation Card */}
            {currentStep && (
              <div className="explanation-card">
                <div className="explanation-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={18} color="#2563eb" />
                    <span>Step {currentStep.step_number} Logic Breakdown</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    Iteration {currentStep.step_number} of {totalSteps}
                  </span>
                </div>
                <div className="explanation-text">
                  {currentStep.explanation}
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <StepControls
            currentStep={currentStepIndex}
            totalSteps={totalSteps}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrev={handlePrev}
            onFirst={handleFirst}
            onLast={handleLast}
            playbackSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
          />
        </div>
      )}
    </div>
  );
}
