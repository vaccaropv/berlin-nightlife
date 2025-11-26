import { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle } from 'lucide-react';
import { getReports, subscribeToReports, type StatusReport } from '../../api/communityApi';
import { useAuth } from '../../context/AuthContext';

interface CommunityTabProps {
    venueId: string;
    venueName: string;
    onLoginClick: () => void;
    onReportClick: () => void;
    lastUpdate?: number;
}

export default function CommunityTab({ venueId, venueName, onLoginClick, onReportClick, lastUpdate }: CommunityTabProps) {
    const { isAuthenticated } = useAuth();
    const [reports, setReports] = useState<StatusReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();

        // Subscribe to real-time updates
        const subscription = subscribeToReports(venueId, () => {
            // When a new report comes in, reload the list
            // In a more optimized version, we could just prepend the new report
            // but reloading ensures we get the joined username correctly
            loadReports();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [venueId, lastUpdate]);

    const loadReports = async () => {
        setLoading(true);
        const data = await getReports(venueId);
        setReports(data);
        setLoading(false);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    const getQueueColor = (queue: string) => {
        switch (queue) {
            case 'No Queue': return '#2bb812';
            case 'Short': return '#39ff14';
            case 'Medium': return '#ffcc00';
            case 'Long': return '#ff8800';
            case 'Full': return '#d32f2f';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className="community-tab">
            <div className="community-header">
                <div>
                    <h3 style={{ marginBottom: '4px' }}>Community Reports</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Real-time updates from clubbers
                    </p>
                </div>
                {isAuthenticated ? (
                    <button className="report-btn" onClick={onReportClick}>
                        Share Update
                    </button>
                ) : (
                    <button className="login-btn" onClick={onLoginClick}>
                        Login to Report
                    </button>
                )}
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    Loading reports...
                </p>
            ) : reports.length === 0 ? (
                <div className="no-reports">
                    <AlertCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p>No reports yet for {venueName}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Be the first to share the current status!
                    </p>
                </div>
            ) : (
                <div className="reports-list">
                    {reports.map((report) => (
                        <div key={report.id} className="report-card glass-panel">
                            <div className="report-header">
                                <div className="report-user">
                                    <Users size={14} />
                                    <span>{report.username}</span>
                                </div>
                                <div className="report-time">
                                    <Clock size={12} />
                                    <span>{formatTime(report.timestamp)}</span>
                                </div>
                            </div>

                            <div className="report-status">
                                <div className="status-item">
                                    <span className="status-label">Queue:</span>
                                    <span className="status-value" style={{ color: getQueueColor(report.queueLength) }}>
                                        {report.queueLength}
                                    </span>
                                </div>
                                <div className="status-item">
                                    <span className="status-label">Door:</span>
                                    <span className="status-value">{report.doorPolicy}</span>
                                </div>
                            </div>

                            {report.vibe && (
                                <p className="report-vibe">{report.vibe}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
        .community-tab {
          padding: 16px 0;
        }

        .community-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .report-btn, .login-btn {
          padding: 8px 16px;
          background: var(--primary);
          color: black;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
        }

        .login-btn {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-main);
        }

        .no-reports {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
        }

        .reports-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .report-card {
          padding: 16px;
          border-radius: 12px;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .report-user {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 14px;
        }

        .report-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .report-status {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
        }

        .status-item {
          display: flex;
          gap: 6px;
          font-size: 13px;
        }

        .status-label {
          color: var(--text-muted);
        }

        .status-value {
          font-weight: 700;
        }

        .report-vibe {
          font-size: 13px;
          color: var(--text-muted);
          font-style: italic;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
        </div>
    );
}
