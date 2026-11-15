import { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card } from '../common/Card';
import type { SensorHistoryPoint, ManualReading } from '../../types/telemetry';

interface MoistureChartProps {
  sensorHistory: SensorHistoryPoint[];
  manualHistory: ManualReading[];
  moistureMin: number;
  moistureMax: number;
}

// Map manual conditions to approximate percentages for chart positioning
const MANUAL_CONDITION_VALUES: Record<string, number> = {
  Dry: 20,
  Damp: 50,
  Wet: 85,
};

interface ChartDataPoint {
  time: string;
  timestamp: number;
  sensorPct?: number;
  manualPct?: number;
  manualLabel?: string;
}

export function MoistureChart({
  sensorHistory,
  manualHistory,
  moistureMin,
  moistureMax,
}: MoistureChartProps) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const points: ChartDataPoint[] = [];

    // Add sensor readings
    for (const reading of sensorHistory) {
      const date = new Date(reading.timestamp);
      points.push({
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: date.getTime(),
        sensorPct: reading.moisture_pct,
      });
    }

    // Add manual readings as discrete points
    for (const reading of manualHistory) {
      const date = new Date(reading.created_at);
      points.push({
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: date.getTime(),
        manualPct: MANUAL_CONDITION_VALUES[reading.moisture_status] ?? 50,
        manualLabel: reading.moisture_status,
      });
    }

    // Sort by timestamp
    points.sort((a, b) => a.timestamp - b.timestamp);
    return points;
  }, [sensorHistory, manualHistory]);

  if (chartData.length === 0) {
    return (
      <Card title="Moisture Trends">
        <div className="text-center py-10 text-gray-400 text-sm">
          No moisture data available yet. Connect a sensor or submit a manual reading.
        </div>
      </Card>
    );
  }

  return (
    <Card title="Moisture Trends">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
              formatter={(value?: any, name?: any) => {
                const val = value != null ? `${value}%` : '--';
                if (name === 'Sensor') return [val, 'Sensor'];
                return [`${val} (approx)`, 'Manual'];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />

            {/* Target moisture range reference lines */}
            <ReferenceLine
              y={moistureMin}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: `Min ${moistureMin}%`, position: 'left', fontSize: 10, fill: '#10b981' }}
            />
            <ReferenceLine
              y={moistureMax}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: `Max ${moistureMax}%`, position: 'left', fontSize: 10, fill: '#10b981' }}
            />

            {/* Sensor readings as continuous line */}
            <Line
              type="monotone"
              dataKey="sensorPct"
              name="Sensor"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 3, fill: '#059669' }}
              connectNulls={false}
            />

            {/* Manual readings as scatter points */}
            <Scatter
              dataKey="manualPct"
              name="Manual"
              fill="#3b82f6"
              shape="diamond"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 justify-center">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-emerald-600 inline-block" /> Sensor (%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rotate-45 inline-block" /> Manual (approx)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-emerald-400 inline-block border-dashed" /> Target range
        </span>
      </div>
    </Card>
  );
}
