import React from 'react';
import { 
  Compass, 
  BarChart3, 
  Layers, 
  RotateCw, 
  Search, 
  PlaySquare, 
  FileSpreadsheet
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'optimizer', label: 'Resource Optimizer', icon: Layers },
    { id: 'routes', label: 'Route Search', icon: RotateCw },
    { id: 'scores', label: 'Score Search', icon: Search },
    { id: 'visualizer', label: 'Algorithm Visualizer', icon: PlaySquare },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-section" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon">
            <Compass size={24} />
          </div>
          <div>
            <div className="brand-title">Route & Score Optimizer</div>
            <div className="brand-subtitle">Binary Search DSA Intelligence Suite</div>
          </div>
        </div>

        <nav className="nav-links">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="nav-right">
          <div className={`backend-status-pill ${backendStatus.online ? 'online' : 'offline'}`}>
            <span className="pulse-dot"></span>
            <span>FastAPI: {backendStatus.online ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
