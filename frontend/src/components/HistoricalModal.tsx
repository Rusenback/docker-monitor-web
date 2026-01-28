import { useState, useEffect } from 'react';
import { HistoricalChart } from './HistoricalChart';

interface HistoricalModalProps {
  containerId: string;
  containerName: string;
  onClose: () => void;
}

interface HistoricalData {
  time: string;
  cpu_percent: number;
  memory_percent: number;
}

export const HistoricalModal = ({ containerId, containerName, onClose }: HistoricalModalProps) => {
  const [data, setData] = useState<HistoricalData[]>([]);
  const [timeRange, setTimeRange] = useState('1h');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (range: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/containers/${containerId}/history?range=${range}`);
      const historyData = await response.json();
      setData(historyData);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(timeRange);
  }, [containerId, timeRange]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dracula-background rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dracula-current border-b border-dracula-selection p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dracula-foreground">{containerName}</h2>
            <p className="text-sm text-dracula-comment mt-1">Historical Performance Data</p>
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

        {/* Time Range Selector */}
        <div className="p-6 border-b border-dracula-selection">
          <div className="flex gap-2">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? 'bg-dracula-purple text-dracula-foreground'
                    : 'bg-dracula-selection text-dracula-comment hover:text-dracula-foreground'
                }`}
              >
                {range === '1h' && 'Last Hour'}
                {range === '24h' && 'Last 24 Hours'}
                {range === '7d' && 'Last 7 Days'}
                {range === '30d' && 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dracula-purple"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-dracula-comment">No historical data available for this time range</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-dracula-current rounded-lg p-4 border border-dracula-selection">
                  <p className="text-sm text-dracula-comment">Avg CPU</p>
                  <p className="text-2xl font-bold text-dracula-green">
                    {(data.reduce((sum, d) => sum + d.cpu_percent, 0) / data.length).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-dracula-current rounded-lg p-4 border border-dracula-selection">
                  <p className="text-sm text-dracula-comment">Max CPU</p>
                  <p className="text-2xl font-bold text-dracula-yellow">
                    {Math.max(...data.map(d => d.cpu_percent)).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-dracula-current rounded-lg p-4 border border-dracula-selection">
                  <p className="text-sm text-dracula-comment">Avg Memory</p>
                  <p className="text-2xl font-bold text-dracula-cyan">
                    {(data.reduce((sum, d) => sum + d.memory_percent, 0) / data.length).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-dracula-current rounded-lg p-4 border border-dracula-selection">
                  <p className="text-sm text-dracula-comment">Data Points</p>
                  <p className="text-2xl font-bold text-dracula-purple">
                    {data.length}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <HistoricalChart data={data} title="CPU & Memory Usage Over Time" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
