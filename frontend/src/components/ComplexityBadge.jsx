import React from 'react';
import { Clock, Cpu, Award } from 'lucide-react';

export default function ComplexityBadge({ timeComplexity, spaceComplexity, title = "Algorithm Complexity" }) {
  return (
    <div className="complexity-box">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#1e3a8a', fontSize: '0.875rem' }}>
        <Award size={18} color="#2563eb" />
        <span>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div className="complexity-item">
          <Clock size={15} color="#64748b" />
          <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>Time:</span>
          <span className="complexity-tag">{timeComplexity || "O(log n)"}</span>
        </div>
        <div className="complexity-item">
          <Cpu size={15} color="#64748b" />
          <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>Space:</span>
          <span className="complexity-tag">{spaceComplexity || "O(1)"}</span>
        </div>
      </div>
    </div>
  );
}
