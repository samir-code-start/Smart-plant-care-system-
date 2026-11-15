import { Header } from './components/dashboard/Header';
import { PlantSelector } from './components/dashboard/PlantSelector';
import { PlantInfoCard } from './components/dashboard/PlantInfoCard';
import { SensorCard } from './components/dashboard/SensorCard';
import { ManualInputCard } from './components/dashboard/ManualInputCard';
import { MoistureChart } from './components/dashboard/MoistureChart';
import { RecentLogsTable } from './components/dashboard/RecentLogsTable';
import { AnalysisView } from './components/ai/AnalysisView';
import { ChatAssistant } from './components/ai/ChatAssistant';

import { usePlantSelection } from './hooks/usePlantSelection';
import { useSensorTelemetry } from './hooks/useSensorTelemetry';
import { useManualReading } from './hooks/useManualReading';
import { usePlantAnalysis } from './hooks/usePlantAnalysis';
import { usePlantChat } from './hooks/usePlantChat';
import type { AnalysisRequest } from './types/ai';

export default function App() {
  const {
    plants,
    selectedPlantId,
    selectedPlant,
    selectPlant,
    growthStage,
    setGrowthStage,
  } = usePlantSelection();

  const {
    latest: sensorLatest,
    history: sensorHistory,
    loading: sensorLoading,
    error: sensorError,
    refresh: refreshSensor,
  } = useSensorTelemetry(selectedPlantId);

  const {
    readings: manualReadings,
    submitting: manualSubmitting,
    error: manualError,
    successMessage: manualSuccessMessage,
    submit: submitManual,
  } = useManualReading(selectedPlantId);

  const {
    analysis,
    loading: analysisLoading,
    error: analysisError,
    analyze: analyzePlant,
  } = usePlantAnalysis();

  const {
    messages: chatMessages,
    loading: chatLoading,
    error: chatError,
    sendMessage: sendChatMessage,
    clearChat,
  } = usePlantChat(selectedPlantId, growthStage);

  // Fallback safe plant if somehow not found
  const currentPlant = selectedPlant || plants[0];

  // Handler for triggering Gemini analysis
  const handleAnalyze = () => {
    if (!currentPlant) return;

    let activeTelemetry: AnalysisRequest['active_telemetry'] = null;
    if (sensorLatest) {
      activeTelemetry = {
        source: 'sensor',
        moisture_pct: sensorLatest.moisture_pct,
        raw_adc: sensorLatest.raw_adc,
        timestamp: sensorLatest.timestamp,
        is_stale: sensorLatest.is_stale,
      };
    } else if (manualReadings.length > 0) {
      const latestManual = manualReadings[0];
      activeTelemetry = {
        source: 'manual',
        moisture_status: latestManual.moisture_status,
        timestamp: latestManual.created_at,
      };
    }

    const historySummary: AnalysisRequest['recent_history_summary'] = [];

    for (const s of sensorHistory.slice(-5)) {
      historySummary.push({
        timestamp: s.timestamp,
        source: 'sensor',
        moisture_pct: s.moisture_pct,
      });
    }

    for (const m of manualReadings.slice(0, 5)) {
      historySummary.push({
        timestamp: m.created_at,
        source: 'manual',
        moisture_status: m.moisture_status,
      });
    }

    historySummary.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    analyzePlant({
      plant_id: currentPlant.id,
      growth_stage: growthStage,
      active_telemetry: activeTelemetry,
      recent_history_summary: historySummary,
    });
  };

  const connectionStatus = sensorLatest?.connection_status || null;
  const secondsSinceUpdate = sensorLatest?.seconds_since_update ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        connectionStatus={connectionStatus}
        secondsSinceUpdate={secondsSinceUpdate}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* SECTION A & B: Plant Selection and Profile */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Plant Selection
            </h2>
            <PlantSelector
              plants={plants}
              selectedPlantId={selectedPlantId}
              onSelectPlant={selectPlant}
              growthStage={growthStage}
              onSelectStage={setGrowthStage}
            />
          </div>

          <div className="lg:col-span-2">
            <PlantInfoCard plant={currentPlant} />
          </div>
        </section>

        {/* SECTION C & D: Physical Sensor Monitoring and Manual Input */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SensorCard
            reading={sensorLatest}
            loading={sensorLoading}
            error={sensorError}
            onRefresh={refreshSensor}
            moistureMin={currentPlant.moisture_min_pct}
            moistureMax={currentPlant.moisture_max_pct}
          />

          <ManualInputCard
            onSubmit={submitManual}
            submitting={manualSubmitting}
            error={manualError}
            successMessage={manualSuccessMessage}
            growthStage={growthStage}
            plantName={currentPlant.name}
          />
        </section>

        {/* SECTION E: Moisture Trends and History */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MoistureChart
              sensorHistory={sensorHistory}
              manualHistory={manualReadings}
              moistureMin={currentPlant.moisture_min_pct}
              moistureMax={currentPlant.moisture_max_pct}
            />
          </div>

          <div className="lg:col-span-1">
            <RecentLogsTable
              sensorHistory={sensorHistory}
              manualHistory={manualReadings}
            />
          </div>
        </section>

        {/* SECTION F & G: Gemini AI Analysis and Botanical Chat */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalysisView
            analysis={analysis}
            loading={analysisLoading}
            error={analysisError}
            onAnalyze={handleAnalyze}
            plantName={currentPlant.name}
          />

          <ChatAssistant
            messages={chatMessages}
            loading={chatLoading}
            error={chatError}
            onSendMessage={sendChatMessage}
            onClear={clearChat}
            plantName={currentPlant.name}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          AI-Powered Smart Plant Care System · IoT + Google Gemini API · Single-User Demo
        </div>
      </footer>
    </div>
  );
}
