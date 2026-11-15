import { Leaf, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '../common/Badge';
import type { ConnectionStatus } from '../../types/telemetry';

interface HeaderProps {
  connectionStatus: ConnectionStatus | null;
  secondsSinceUpdate: number | null;
}

export function Header({ connectionStatus, secondsSinceUpdate }: HeaderProps) {
  const statusBadge = () => {
    if (!connectionStatus) {
      return <Badge label="No Sensor Data" variant="gray" dot />;
    }
    switch (connectionStatus) {
      case 'online':
        return <Badge label={`Online (${secondsSinceUpdate}s ago)`} variant="green" dot />;
      case 'stale':
        return <Badge label={`Stale (${formatDuration(secondsSinceUpdate)})`} variant="amber" dot />;
      case 'offline':
        return <Badge label="Sensor Offline" variant="red" dot />;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Leaf className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Smart Plant Care AI</h1>
            <p className="text-xs text-gray-500">IoT Moisture Monitor & AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {connectionStatus === 'online' ? (
            <Wifi className="h-4 w-4 text-emerald-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-gray-400" />
          )}
          {statusBadge()}
        </div>
      </div>
    </header>
  );
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return 'unknown';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}
