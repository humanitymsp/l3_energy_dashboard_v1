import { Brain, TrendingUp, AlertTriangle, Zap, DollarSign, Activity, CheckCircle, XCircle } from 'lucide-react';
import { mockEquipmentPredictions, mockEnergyForecasts, mockCostTrends, mockAnomalies, mockPredictiveInsights, mockMLModels } from '../lib/mockData/analytics';

export default function PredictiveAnalytics() {
  const predictions = mockEquipmentPredictions;
  const forecasts = mockEnergyForecasts;
  const costTrends = mockCostTrends;
  const anomalies = mockAnomalies;
  const insights = mockPredictiveInsights;
  const models = mockMLModels;

  const criticalPredictions = predictions.filter(p => p.prediction.failureRisk === 'critical' || p.prediction.failureRisk === 'high');
  const activeAnomalies = anomalies.filter(a => a.status === 'detected' || a.status === 'investigating');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Predictive Analytics</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            AI-powered insights and forecasting
          </p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
            {models.filter(m => m.status === 'active').length} Active ML Models
          </span>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Critical Predictions</dt>
                  <dd className="text-3xl font-semibold text-gray-900 dark:text-white">{criticalPredictions.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Anomalies</dt>
                  <dd className="text-3xl font-semibold text-gray-900 dark:text-white">{activeAnomalies.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Actionable Insights</dt>
                  <dd className="text-3xl font-semibold text-gray-900 dark:text-white">{insights.filter(i => i.actionable).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Potential Savings</dt>
                  <dd className="text-3xl font-semibold text-gray-900 dark:text-white">$10K</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI-Powered Insights</h2>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.priority === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : insight.priority === 'high'
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                    : insight.priority === 'medium'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        insight.priority === 'critical'
                          ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                          : insight.priority === 'high'
                          ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{insight.summary}</p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{insight.details}</p>
                    
                    {insight.impact && (
                      <div className="mt-3 flex flex-wrap gap-3 text-xs">
                        {insight.impact.financial && (
                          <span className={`inline-flex items-center px-2 py-1 rounded ${
                            insight.impact.financial > 0 
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                              : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                          }`}>
                            <DollarSign className="h-3 w-3 mr-1" />
                            {insight.impact.financial > 0 ? '+' : ''}{insight.impact.financial.toLocaleString()}
                          </span>
                        )}
                        <span className="text-gray-500 dark:text-gray-400">
                          Confidence: {insight.confidence}% • {insight.dataPoints.toLocaleString()} data points
                        </span>
                      </div>
                    )}

                    {insight.actions && insight.actions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Recommended Actions:</p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {insight.actions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Failure Predictions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Equipment Failure Predictions</h2>
          <div className="space-y-3">
            {predictions.map((pred) => (
              <div
                key={pred.id}
                className={`p-4 rounded-lg border ${
                  pred.prediction.failureRisk === 'critical'
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                    : pred.prediction.failureRisk === 'high'
                    ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{pred.equipmentName}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        pred.prediction.failureRisk === 'critical'
                          ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                          : pred.prediction.failureRisk === 'high'
                          ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {pred.prediction.failureRisk} risk
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {pred.location.propertyName} • {pred.location.buildingName}
                      {pred.location.unitNumber && ` • Unit ${pred.location.unitNumber}`}
                    </p>
                    
                    <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Failure Probability</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{pred.prediction.failureProbability}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Est. Days to Failure</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{pred.prediction.estimatedDaysToFailure}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Confidence</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{pred.prediction.confidence}%</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-4 text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        Maintenance Cost: <span className="font-semibold text-green-600 dark:text-green-400">${pred.estimatedMaintenanceCost}</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Failure Cost: <span className="font-semibold text-red-600 dark:text-red-400">${pred.estimatedFailureCost}</span>
                      </span>
                    </div>

                    {pred.recommendedActions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Actions:</p>
                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {pred.recommendedActions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly Detection */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Anomaly Detection</h2>
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{anomaly.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        anomaly.severity === 'critical' || anomaly.severity === 'high'
                          ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {anomaly.severity}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        anomaly.status === 'detected'
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                          : 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300'
                      }`}>
                        {anomaly.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{anomaly.description}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {anomaly.location.propertyName} • {anomaly.location.buildingName}
                    </p>
                    
                    <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Expected</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{anomaly.metrics.expected}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Actual</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{anomaly.metrics.actual}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Deviation</p>
                        <p className="font-semibold text-red-600 dark:text-red-400">{anomaly.metrics.deviation}%</p>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      ML Confidence: {anomaly.mlConfidence}%
                      {anomaly.rootCause && ` • Root Cause: ${anomaly.rootCause}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ML Models Status */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Machine Learning Models</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {models.map((model) => (
              <div
                key={model.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{model.name}</h3>
                  {model.status === 'active' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Accuracy</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{model.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Data Points</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{model.dataPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Version</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{model.version}</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
