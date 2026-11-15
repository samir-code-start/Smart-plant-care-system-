import { Sparkles, AlertTriangle, CheckCircle2, TrendingDown, Lightbulb } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { PlantAnalysis } from '../../types/ai';

interface AnalysisViewProps {
  analysis: PlantAnalysis | null;
  loading: boolean;
  error: string | null;
  onAnalyze: () => void;
  plantName: string;
}

const assessmentColors: Record<string, string> = {
  'Optimal': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Under-watered': 'bg-red-50 text-red-800 border-red-200',
  'Over-watered': 'bg-blue-50 text-blue-800 border-blue-200',
  'No data': 'bg-gray-50 text-gray-600 border-gray-200',
};

export function AnalysisView({
  analysis,
  loading,
  error,
  onAnalyze,
  plantName,
}: AnalysisViewProps) {
  return (
    <Card title="AI Plant Health Analysis">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            AI-powered analysis for <strong>{plantName}</strong>
          </p>
          <Button onClick={onAnalyze} loading={loading} variant="primary" size="sm">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {analysis ? 'Re-analyse' : 'Analyse Plant'}
          </Button>
        </div>

        {loading && <LoadingSpinner text="Analysing plant health with Gemini AI..." />}

        {error && (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertTriangle className="inline h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-4">
            {/* Assessment Badge */}
            <div
              className={`p-4 rounded-lg border ${
                assessmentColors[analysis.moisture_status_assessment] ||
                'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-bold text-lg">{analysis.moisture_status_assessment}</span>
              </div>
              <p className="text-sm leading-relaxed">{analysis.current_condition_summary}</p>
            </div>

            {/* Trend */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Trend Analysis</span>
              </div>
              <p className="text-sm text-gray-600">{analysis.trend_interpretation}</p>
            </div>

            {/* Recommendations */}
            {analysis.care_recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-700">Recommendations</span>
                </div>
                <ul className="space-y-2">
                  {analysis.care_recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700 bg-emerald-50 p-2.5 rounded-lg"
                    >
                      <span className="text-emerald-600 font-bold shrink-0">{i + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {analysis.warnings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">Warnings</span>
                </div>
                <ul className="space-y-2">
                  {analysis.warnings.map((warn, i) => (
                    <li
                      key={i}
                      className="text-sm text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200"
                    >
                      ⚠ {warn}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metadata */}
            <p className="text-xs text-gray-400 text-right">
              Source: {analysis.data_source_evaluated} · Evaluated at{' '}
              {new Date(analysis.evaluation_timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
