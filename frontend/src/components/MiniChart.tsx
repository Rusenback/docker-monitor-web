import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface MiniChartProps {
  data: Array<{ timestamp: number; value: number }>;
  color: string;
}

export const MiniChart = ({ data, color }: MiniChartProps) => {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="h-12 flex items-center justify-center">
        <span className="text-xs text-dracula-comment">No data</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={data}>
        <YAxis domain={[0, 100]} hide />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
