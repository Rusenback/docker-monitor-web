import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface HistoricalChartProps {
  data: Array<{
    time: string;
    cpu_percent: number;
    memory_percent: number;
  }>;
  title: string;
}

export const HistoricalChart = ({ data, title }: HistoricalChartProps) => {
  // Format data for recharts
  const chartData = data.map(point => ({
    time: new Date(point.time).toLocaleTimeString(),
    CPU: point.cpu_percent.toFixed(2),
    Memory: point.memory_percent.toFixed(2),
  }));

  return (
    <div className="bg-dracula-current rounded-lg p-6 border border-dracula-selection">
      <h3 className="text-lg font-semibold text-dracula-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#44475a" />
          <XAxis 
            dataKey="time" 
            stroke="#f8f8f2"
            tick={{ fill: '#6272a4' }}
          />
          <YAxis 
            stroke="#f8f8f2"
            tick={{ fill: '#6272a4' }}
            domain={[0, 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#282a36', 
              border: '1px solid #44475a',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#f8f8f2' }}
          />
          <Legend 
            wrapperStyle={{ color: '#f8f8f2' }}
          />
          <Line 
            type="monotone" 
            dataKey="CPU" 
            stroke="#50fa7b" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Memory" 
            stroke="#8be9fd" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
