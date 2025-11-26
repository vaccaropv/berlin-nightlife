import { useState, useEffect } from 'react';
import { Train, Car, Footprints, AlertTriangle } from 'lucide-react';
import { TransportOption, getTransportOptions, calculateDistance } from '../../utils/transportService';
import { Venue } from '../../data/mockData';

interface TransportPanelProps {
  userLocation: [number, number] | null;
  venue: Venue;
}

export default function TransportPanel({ userLocation, venue }: TransportPanelProps) {
  const [activeTab, setActiveTab] = useState<'Public' | 'Ride' | 'Walk'>('Public');
  const [options, setOptions] = useState<TransportOption[]>([]);

  useEffect(() => {
    if (userLocation) {
      const dist = calculateDistance(
        userLocation[0], userLocation[1],
        venue.coordinates[0], venue.coordinates[1]
      );
      setOptions(getTransportOptions(dist));
    }
  }, [userLocation, venue]);

  if (!userLocation) {
    return (
      <div className="transport-panel glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Enable location to see directions.</p>
      </div>
    );
  }

  const currentOptions = options.filter(o => o.type === activeTab);

  return (
    <div className="transport-panel">
      <div className="transport-tabs">
        <button
          className={`tab-btn ${activeTab === 'Public' ? 'active' : ''}`}
          onClick={() => setActiveTab('Public')}
        >
          <Train size={18} />
          <span>Public</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'Ride' ? 'active' : ''}`}
          onClick={() => setActiveTab('Ride')}
        >
          <Car size={18} />
          <span>Ride</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'Walk' ? 'active' : ''}`}
          onClick={() => setActiveTab('Walk')}
        >
          <Footprints size={18} />
          <span>Walk</span>
        </button>
      </div>

      <div className="transport-content">
        {currentOptions.map((opt, idx) => (
          <div key={idx} className="transport-option-card">
            <div className="opt-header">
              <span className="opt-provider">{opt.provider}</span>
              <span className="opt-time">{opt.duration} min</span>
            </div>
            <div className="opt-details">
              <span className="opt-info">{opt.details}</span>
              {opt.price && <span className="opt-price">€{opt.price.toFixed(2)}</span>}
              {opt.calories && <span className="opt-calories">{opt.calories} kcal</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="safety-disclaimer">
        <AlertTriangle size={12} />
        <span>Never drive a scooter or car under the influence of substances.</span>
      </div>

      <style>{`
        .transport-panel {
          margin-top: 16px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 16px;
        }
        .transport-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          background: rgba(255,255,255,0.05);
          padding: 4px;
          border-radius: 12px;
        }
        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: var(--primary);
          color: black;
          font-weight: 700;
        }
        .transport-content {
          background: transparent;
          min-height: 50px;
        }
        .transport-option-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 8px;
        }
        .opt-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .opt-provider {
          font-weight: 700;
          font-size: 15px;
          color: var(--text-main);
        }
        .opt-time {
          font-weight: 700;
          color: var(--primary);
        }
        .opt-details {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-muted);
        }
        .opt-price {
          color: var(--text-main);
          font-weight: 600;
        }
        .opt-calories {
          color: var(--text-main);
          font-weight: 600;
        }
        .safety-disclaimer {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          font-size: 10px;
          color: #ffcc00;
          background: rgba(255, 204, 0, 0.1);
          padding: 8px;
          border-radius: 8px;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
