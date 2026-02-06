import { useState, useEffect } from 'react';

interface LogsModalProps {
  containerId: string;
  containerName: string;
  onClose: () => void;
}

export const LogsModal = ({ containerId, containerName, onClose }: LogsModalProps) => {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/containers/${containerId}/logs?lines=500`);
        const data = await response.json();
        setLogs(data.logs || 'No logs available');
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        setLogs('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [containerId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dracula-background rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-dracula-current border-b border-dracula-selection p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dracula-foreground">{containerName}</h2>
            <p className="text-sm text-dracula-comment mt-1">Container Logs</p>
          </div>
          <button
            onClick={onClose}
            className="text-dracula-comment hover:text-dracula-foreground transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Logs Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dracula-purple"></div>
            </div>
          ) : (
            <pre className="bg-dracula-current rounded-lg p-4 text-xs text-dracula-foreground font-mono overflow-x-auto whitespace-pre-wrap border border-dracula-selection">
              {logs}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
