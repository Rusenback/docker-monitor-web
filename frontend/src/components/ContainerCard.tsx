import type { ContainerWithStats } from '../types/container';
import { MiniChart } from './MiniChart';
import { useState } from 'react';
import { HistoricalModal } from './HistoricalModal';
import { LogsModal } from './LogsModal';

interface ContainerCardProps {
  stats: ContainerWithStats;
  history?: Array<{ timestamp: number; cpu_percent: number; memory_percent: number }>;
}

export const ContainerCard = ({ stats, history = [] }: ContainerCardProps) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  
  const containerId = stats.container_id.slice(0, 12);
  const memoryMB = (stats.memory_usage / 1024 / 1024).toFixed(0);
  const memoryLimitMB = (stats.memory_limit / 1024 / 1024).toFixed(0);

  const displayName = stats.name || containerId;
  const displayImage = stats.image || 'Unknown';

  const cpuColor =
    stats.cpu_percent > 80 ? 'text-dracula-red' :
    stats.cpu_percent > 50 ? 'text-dracula-yellow' :
    'text-dracula-green';

  const memColor =
    stats.memory_percent > 80 ? 'text-dracula-red' :
    stats.memory_percent > 50 ? 'text-dracula-yellow' :
    'text-dracula-green';

  const cpuChartData = history.map(h => ({ timestamp: h.timestamp, value: h.cpu_percent }));
  const memChartData = history.map(h => ({ timestamp: h.timestamp, value: h.memory_percent }));

  return (
    <>
      <div className="bg-dracula-current rounded-lg shadow-lg p-6 hover:shadow-xl transition-all border border-dracula-selection hover:border-dracula-purple">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-dracula-green rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-lg font-semibold text-dracula-foreground">
                {displayName}
              </h3>
              <p className="text-xs text-dracula-comment font-mono">
                {containerId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* History Button */}
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 rounded-lg bg-dracula-purple/20 hover:bg-dracula-purple/30 text-dracula-purple transition-colors"
              title="View History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            
            {/* Logs Button */}
            <button
              onClick={() => setShowLogs(true)}
              className="p-2 rounded-lg bg-dracula-cyan/20 hover:bg-dracula-cyan/30 text-dracula-cyan transition-colors"
              title="View Logs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            <span className="px-3 py-1 text-xs font-medium bg-dracula-green/20 text-dracula-green rounded-full border border-dracula-green/30">
              Running
            </span>
          </div>
        </div>

        {/* Image Info */}
        <div className="mb-4 pb-4 border-b border-dracula-selection">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-dracula-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-dracula-cyan font-mono truncate">
              {displayImage}
            </span>
          </div>
        </div>

        {/* Stats with Charts */}
        <div className="space-y-6">
          {/* CPU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dracula-comment">CPU</span>
              <span className={`text-sm font-semibold font-mono ${cpuColor}`}>
                {stats.cpu_percent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-dracula-selection rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  stats.cpu_percent > 80 ? 'bg-dracula-red' :
                  stats.cpu_percent > 50 ? 'bg-dracula-yellow' :
                  'bg-dracula-green'
                }`}
                style={{ width: `${Math.min(stats.cpu_percent, 100)}%` }}
              ></div>
            </div>
            <MiniChart data={cpuChartData} color={cpuColor.includes('red') ? '#ff5555' : cpuColor.includes('yellow') ? '#f1fa8c' : '#50fa7b'} />
          </div>

          {/* Memory */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dracula-comment">Memory</span>
              <span className={`text-sm font-semibold font-mono ${memColor}`}>
                {stats.memory_percent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-dracula-selection rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  stats.memory_percent > 80 ? 'bg-dracula-red' :
                  stats.memory_percent > 50 ? 'bg-dracula-yellow' :
                  'bg-dracula-green'
                }`}
                style={{ width: `${stats.memory_percent}%` }}
              ></div>
            </div>
            <MiniChart data={memChartData} color={memColor.includes('red') ? '#ff5555' : memColor.includes('yellow') ? '#f1fa8c' : '#50fa7b'} />
          </div>
        </div>

        {/* Memory Details */}
        <div className="mt-4 pt-4 border-t border-dracula-selection">
          <p className="text-xs text-dracula-comment font-mono">
            {memoryMB} MB / {memoryLimitMB} MB
          </p>
        </div>
      </div>

      {/* Historical Modal */}
      {showHistory && (
        <HistoricalModal
          containerId={stats.container_id}
          containerName={displayName}
          onClose={() => setShowHistory(false)}
        />
      )}
      
      {/* Logs Modal */}
      {showLogs && (
        <LogsModal
          containerId={stats.container_id}
          containerName={displayName}
          onClose={() => setShowLogs(false)}
        />
      )}
    </>
  );
};
