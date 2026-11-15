import { useState } from 'react';
import { Hand, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import type { MoistureStatus } from '../../types/telemetry';
import { MOISTURE_CONDITIONS } from '../../types/telemetry';

interface ManualInputCardProps {
  onSubmit: (status: MoistureStatus, growthStage: string, notes?: string) => Promise<void>;
  submitting: boolean;
  error: string | null;
  successMessage: string | null;
  growthStage: string;
  plantName: string;
}

const conditionIcons: Record<MoistureStatus, string> = {
  Dry: '🏜️',
  Damp: '💧',
  Wet: '🌊',
};

const conditionDescriptions: Record<MoistureStatus, string> = {
  Dry: 'Soil feels dry and crumbly',
  Damp: 'Soil feels cool and moist',
  Wet: 'Soil feels saturated with water',
};

export function ManualInputCard({
  onSubmit,
  submitting,
  error,
  successMessage,
  growthStage,
  plantName,
}: ManualInputCardProps) {
  const [selected, setSelected] = useState<MoistureStatus | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!selected) return;
    await onSubmit(selected, growthStage, notes || undefined);
    setSelected(null);
    setNotes('');
  };

  return (
    <Card title="Manual Moisture Input">
      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          <Hand className="inline h-3.5 w-3.5 mr-1" />
          Record your observation for <strong>{plantName}</strong>
        </p>

        {/* Moisture Condition Radio Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {MOISTURE_CONDITIONS.map((condition) => (
            <button
              key={condition}
              onClick={() => setSelected(condition)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                selected === condition
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">{conditionIcons[condition]}</span>
              <span className="text-sm font-semibold block">{condition}</span>
              <span className="text-xs text-gray-500 block mt-0.5">
                {conditionDescriptions[condition]}
              </span>
            </button>
          ))}
        </div>

        {/* Optional Notes */}
        <div>
          <label htmlFor="manual-notes" className="block text-xs font-medium text-gray-600 mb-1">
            Notes (optional)
          </label>
          <input
            id="manual-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Topsoil feels cool..."
            maxLength={200}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          loading={submitting}
          disabled={!selected}
          className="w-full"
        >
          Submit Manual Reading
        </Button>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </Card>
  );
}
