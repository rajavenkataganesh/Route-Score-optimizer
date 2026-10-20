import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';

export default function StepControls({
  currentStep,
  totalSteps,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onFirst,
  onLast,
  playbackSpeed,
  onSpeedChange
}) {
  return (
    <div className="controls-bar">
      <div className="playback-buttons">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onFirst}
          disabled={currentStep <= 0}
          title="Jump to Start"
        >
          <SkipBack size={16} />
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onPrev}
          disabled={currentStep <= 0}
          title="Previous Step"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'} btn-sm`}
          onClick={onPlayPause}
          disabled={totalSteps <= 1}
          style={{ minWidth: '95px' }}
        >
          {isPlaying ? (
            <>
              <Pause size={15} /> Pause
            </>
          ) : (
            <>
              <Play size={15} /> Play
            </>
          )}
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
          title="Next Step"
        >
          <ChevronRight size={16} />
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onLast}
          disabled={currentStep >= totalSteps - 1}
          title="Jump to End"
        >
          <SkipForward size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e3a8a' }}>
          Step <span style={{ color: '#2563eb' }}>{totalSteps > 0 ? currentStep + 1 : 0}</span> of {totalSteps}
        </div>

        <div className="speed-control">
          <Gauge size={16} />
          <span>Speed:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontWeight: 600,
              fontSize: '0.8rem',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value={2000}>0.5x (Slow)</option>
            <option value={1000}>1x (Normal)</option>
            <option value={500}>2x (Fast)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
