import { Activity, RefreshCw, Clock } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { SensorReading } from '../../types/telemetry';

interface SensorCardProps {
  reading: SensorReading | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  moistureMin: number;
  moistureMax: number;
}

export function SensorCard({
  reading,
  loading,
  error,
  onRefresh,
  moistureMin,
  moistureMax,
}: SensorCardProps) {
  if (loading && !reading) {
    return (
      <Card title="Physical Sensor">
        <LoadingSpinner text="Connecting to sensor..." />
      </Card>
    );
  }

  const statusVariant = (): 'green' | 'amber' | 'red' | 'gray' => {
    if (!reading) return 'gray';
    switch (reading.connection_status) {
      case 'online': return 'green';
      case 'stale': return 'amber';
      case 'offline': return 'red';
      default: return 'gray';
    }
  };

  const statusLabel = (): string => {
    if (!reading) return 'No Data';
    switch (reading.connection_status) {
      case 'online': return 'Online';
      case 'stale': return 'Stale';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  // Determine moisture bar color relative to target range
  const getMoistureColor = (pct: number): string => {
    if (pct < moistureMin) return 'bg-red-500';
    if (pct > moistureMax) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <Card
      title="Physical Sensor"
      headerAction={
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      {error && !reading && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-3">{error}</div>
      )}

      {!reading ? (
        <div className="text-center py-6 text-gray-500">
          <Activity className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No sensor readings available</p>
          <p className="text-xs text-gray-400 mt-1">
            Connect your ESP8266 and configure ThingSpeak
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge label={statusLabel()} variant={statusVariant()} dot />
            {reading.is_stale && (
              <span className="text-xs text-amber-600 font-medium">
                ⚠ Reading may be outdated
              </span>
            )}
          </div>

          {/* Moisture Gauge */}
          <div>
            <div className="flex items-end justify-between mb-1">
              <span className="text-3xl font-bold text-gray-900">
                {reading.moisture_pct}%
              </span>
              <span className="text-xs text-gray-500">
                Target: {moistureMin}%–{moistureMax}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getMoistureColor(reading.moisture_pct)}`}
                style={{ width: `${Math.min(reading.moisture_pct, 100)}%` }}
              />
            </div>
            {/* Target range markers */}
            <div className="relative w-full h-1 mt-0.5">
              <div
                className="absolute h-1 bg-emerald-200 rounded-full opacity-60"
                style={{
                  left: `${moistureMin}%`,
                  width: `${moistureMax - moistureMin}%`,
                }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <span className="text-xs text-gray-500 block">Raw ADC</span>
              <span className="font-mono font-semibold text-gray-800">{reading.raw_adc}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <span className="text-xs text-gray-500 block">Sensor Status</span>
              <span className="font-semibold text-gray-800 capitalize">{reading.sensor_status}</span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {new Date(reading.timestamp).toLocaleString()} ({reading.seconds_since_update}s ago)
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
