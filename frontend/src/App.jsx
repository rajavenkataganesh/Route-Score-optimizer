import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ResourceOptimizer from './components/ResourceOptimizer';
import RouteSearch from './components/RouteSearch';
import ScoreSearch from './components/ScoreSearch';
import Visualizer from './components/Visualizer';
import Reports from './components/Reports';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [visualizerPayload, setVisualizerPayload] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ online: false, checking: true });

  const checkBackend = async () => {
    try {
      await api.checkHealth();
      setBackendStatus({ online: true, checking: false });
    } catch {
      setBackendStatus({ online: false, checking: false });
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSendToVisualizer = (payload) => {
    setVisualizerPayload(payload);
    setActiveTab('visualizer');
  };

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendStatus={backendStatus} 
      />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            setActiveTab={setActiveTab} 
            onSelectHistoryItem={(item) => {
              // Format item for visualizer
              handleSendToVisualizer({
                type: item.operation_type,
                data: null
              });
            }}
          />
        )}

        {activeTab === 'optimizer' && (
          <ResourceOptimizer onSendToVisualizer={handleSendToVisualizer} />
        )}

        {activeTab === 'routes' && (
          <RouteSearch onSendToVisualizer={handleSendToVisualizer} />
        )}

        {activeTab === 'scores' && (
          <ScoreSearch onSendToVisualizer={handleSendToVisualizer} />
        )}

        {activeTab === 'visualizer' && (
          <Visualizer initialData={visualizerPayload} />
        )}

        {activeTab === 'reports' && (
          <Reports />
        )}
      </main>

      <footer className="footer">
        <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Route & Score Optimizer</strong> &copy; 2026 — Advanced Binary Search DSA Suite
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Python FastAPI Backend</span>
            <span>React.js + Vite Frontend</span>
            <span>O(log n) Logarithmic Guarantees</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
