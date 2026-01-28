import type { ContainerWithStats } from '../types/container';

interface ContainerCardProps {
  stats: ContainerWithStats;
}

export const ContainerCard = ({ stats }: ContainerCardProps) => {
  const containerId = stats.container_id.slice(0, 12);
  const memoryMB = (stats.memory_usage / 1024 / 1024).toFixed(0);
  const memoryLimitMB = (stats.memory_limit / 1024 / 1024).toFixed(0);

  // Use name if available, fallback to ID
  const displayName = stats.name || containerId;
  const displayImage = stats.image || 'Unknown';

  // Dracula color coding for CPU
  const cpuColor = 
    stats.cpu_percent > 80 ? 'text-dracula-red' :
    stats.cpu_percent > 50 ? 'text-dracula-yellow' :
    'text-dracula-green';

  // Dracula color coding for Memory
  const memColor =
    stats.memory_percent > 80 ? 'text-dracula-red' :
    stats.memory_percent > 50 ? 'text-dracula-yellow' :
    'text-dracula-green';

  return (
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
        <span className="px-3 py-1 text-xs font-medium bg-dracula-green/20 text-dracula-green rounded-full border border-dracula-green/30">
          Running
        </span>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Memory Details */}
      <div className="mt-4 pt-4 border-t border-dracula-selection">
        <p className="text-xs text-dracula-comment font-mono">
          {memoryMB} MB / {memoryLimitMB} MB
        </p>
      </div>
    </div>
  );
};
