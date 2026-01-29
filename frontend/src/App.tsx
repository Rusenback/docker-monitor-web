import { useWebSocket } from './hooks/useWebSocket';
import { ContainerCard } from './components/ContainerCard';

function App() {
  const { stats, connected, history } = useWebSocket();

  return (
    <div className="min-h-screen bg-dracula-background">
      {/* Header */}
      <header className="bg-dracula-current shadow-lg border-b border-dracula-selection">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dracula-foreground">
                🐳 Docker Monitor
              </h1>
              <p className="text-sm text-dracula-comment mt-1">
                Real-time container monitoring
              </p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-dracula-green' : 'bg-dracula-red'} animate-pulse`}></div>
              <span className={`text-sm font-medium ${connected ? 'text-dracula-green' : 'text-dracula-red'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="mb-8">
          <div className="bg-dracula-current rounded-lg shadow-lg p-6 border border-dracula-selection">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dracula-comment">Total Containers</p>
                <p className="text-3xl font-bold text-dracula-foreground">{stats.length}</p>
              </div>
              <div className="w-16 h-16 bg-dracula-purple/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-dracula-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Container Grid */}
        {stats.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block w-16 h-16 bg-dracula-selection rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-dracula-comment" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-dracula-foreground mb-2">No containers running</h3>
            <p className="text-dracula-comment">Start some Docker containers to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <ContainerCard key={stat.container_id} stats={stat} history={history[stat.container_id]}/>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-dracula-comment">
        <p>Built with Go, React, TypeScript, and WebSockets</p>
      </footer>
    </div>
  );
}

export default App;
