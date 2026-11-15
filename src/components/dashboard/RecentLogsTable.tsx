import { Clock } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import type { SensorHistoryPoint, ManualReading } from '../../types/telemetry';

interface RecentLogsTableProps {
  sensorHistory: SensorHistoryPoint[];
  manualHistory: ManualReading[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  source: 'sensor' | 'manual';
  value: string;
  sortTime: number;
}

export function RecentLogsTable({ sensorHistory, manualHistory }: RecentLogsTableProps) {
  // Merge and sort both sources, newest first, limit to 15
  const logs: LogEntry[] = [];

  for (const s of sensorHistory.slice(-10)) {
    logs.push({
      id: `sensor-${s.entry_id}`,
      timestamp: s.timestamp,
      source: 'sensor',
      value: `${s.moisture_pct}% (ADC: ${s.raw_adc})`,
      sortTime: new Date(s.timestamp).getTime(),
    });
  }

  for (const m of manualHistory.slice(0, 10)) {
    logs.push({
      id: m.id,
      timestamp: m.created_at,
      source: 'manual',
      value: m.moisture_status + (m.notes ? ` — ${m.notes}` : ''),
      sortTime: new Date(m.created_at).getTime(),
    });
  }

  logs.sort((a, b) => b.sortTime - a.sortTime);
  const display = logs.slice(0, 15);

  if (display.length === 0) {
    return (
      <Card title="Recent Activity">
        <p className="text-sm text-gray-400 text-center py-6">No readings recorded yet.</p>
      </Card>
    );
  }

  return (
    <Card title="Recent Activity">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="pb-2 pr-4">Time</th>
              <th className="pb-2 pr-4">Source</th>
              <th className="pb-2">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {display.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="py-2 pr-4 whitespace-nowrap">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-3 w-3" />
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <Badge
                    label={log.source === 'sensor' ? 'Sensor' : 'Manual'}
                    variant={log.source === 'sensor' ? 'green' : 'blue'}
                  />
                </td>
                <td className="py-2 text-gray-800">{log.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
