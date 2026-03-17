import { EquipmentPrediction, EnergyForecast, CostTrend, AnomalyDetection, PredictiveInsight, MLModel } from '../types/analytics';

// Mock Equipment Failure Predictions
export const mockEquipmentPredictions: EquipmentPrediction[] = [
  {
    id: 'pred-001',
    equipmentId: 'shelly-204',
    equipmentName: 'Unit 204 Electric Monitor',
    equipmentType: 'electric_monitor',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
      unitId: 'unit-204',
      unitNumber: '204',
    },
    prediction: {
      failureRisk: 'high',
      failureProbability: 78,
      estimatedDaysToFailure: 12,
      confidence: 85,
    },
    indicators: [
      {
        type: 'Signal Degradation',
        severity: 'high',
        description: 'WiFi signal strength declining over 14 days',
        value: 45,
        threshold: 60,
      },
      {
        type: 'Data Gaps',
        severity: 'medium',
        description: 'Intermittent data reporting',
        value: 12,
        threshold: 5,
      },
    ],
    recommendedActions: [
      'Schedule replacement within 10 days',
      'Check WiFi access point signal strength',
      'Prepare backup monitoring solution',
    ],
    estimatedMaintenanceCost: 85,
    estimatedFailureCost: 450,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'pred-002',
    equipmentId: 'eco-312',
    equipmentName: 'Unit 312 Water Sensor',
    equipmentType: 'water_sensor',
    location: {
      propertyId: 'prop-002',
      propertyName: 'Riverside Complex',
      buildingId: 'bldg-003',
      buildingName: 'Building A',
      unitId: 'unit-312',
      unitNumber: '312',
    },
    prediction: {
      failureRisk: 'medium',
      failureProbability: 45,
      estimatedDaysToFailure: 28,
      confidence: 72,
    },
    indicators: [
      {
        type: 'Battery Degradation',
        severity: 'medium',
        description: 'Battery voltage declining faster than normal',
        value: 3.2,
        threshold: 3.5,
      },
    ],
    recommendedActions: [
      'Replace battery within 3 weeks',
      'Monitor daily for sudden drops',
    ],
    estimatedMaintenanceCost: 35,
    estimatedFailureCost: 2500,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'pred-003',
    equipmentId: 'cam-002',
    equipmentName: 'Parking Lot North Camera',
    equipmentType: 'camera',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
    },
    prediction: {
      failureRisk: 'critical',
      failureProbability: 92,
      estimatedDaysToFailure: 5,
      confidence: 91,
    },
    indicators: [
      {
        type: 'Overheating',
        severity: 'high',
        description: 'Operating temperature 15°C above normal',
        value: 68,
        threshold: 55,
      },
      {
        type: 'Frame Drops',
        severity: 'high',
        description: 'Increasing frame drop rate',
        value: 18,
        threshold: 5,
      },
    ],
    recommendedActions: [
      'URGENT: Replace camera within 5 days',
      'Check ventilation and sun exposure',
      'Order replacement unit immediately',
    ],
    estimatedMaintenanceCost: 450,
    estimatedFailureCost: 1200,
    lastUpdated: new Date().toISOString(),
  },
];

// Mock Energy Forecasts
export const mockEnergyForecasts: EnergyForecast[] = [
  {
    id: 'forecast-001',
    propertyId: 'prop-001',
    propertyName: 'Sunset Apartments',
    period: 'monthly',
    forecast: {
      electric: {
        predicted: 12500,
        confidence: 88,
        trend: 'increasing',
        percentChange: 8.5,
      },
      water: {
        predicted: 285000,
        confidence: 85,
        trend: 'stable',
        percentChange: 1.2,
      },
    },
    historicalAverage: {
      electric: 11520,
      water: 281500,
    },
    anomalies: [
      {
        type: 'spike',
        severity: 'medium',
        description: 'Expected 8.5% increase in electric usage due to seasonal HVAC demand',
        expectedImpact: 980,
      },
    ],
    recommendations: [
      'Consider HVAC efficiency audit',
      'Review thermostat settings across units',
      'Evaluate solar panel ROI for common areas',
    ],
    generatedAt: new Date().toISOString(),
  },
  {
    id: 'forecast-002',
    propertyId: 'prop-002',
    propertyName: 'Riverside Complex',
    period: 'weekly',
    forecast: {
      electric: {
        predicted: 3200,
        confidence: 82,
        trend: 'decreasing',
        percentChange: -3.2,
      },
      water: {
        predicted: 68000,
        confidence: 79,
        trend: 'decreasing',
        percentChange: -5.1,
      },
    },
    historicalAverage: {
      electric: 3305,
      water: 71650,
    },
    anomalies: [],
    recommendations: [
      'Positive trend - recent leak repairs showing impact',
      'Continue monitoring for sustained improvement',
    ],
    generatedAt: new Date().toISOString(),
  },
];

// Mock Cost Trends
export const mockCostTrends: CostTrend[] = [
  {
    id: 'trend-001',
    category: 'utilities',
    period: 'month',
    data: [
      { date: '2026-01', actual: 4250, predicted: 4200, budget: 4500 },
      { date: '2026-02', actual: 4580, predicted: 4550, budget: 4500 },
      { date: '2026-03', actual: 4920, predicted: 4900, budget: 4500 },
      { date: '2026-04', actual: 0, predicted: 5280, budget: 4500 },
    ],
    analysis: {
      trend: 'increasing',
      percentChange: 15.8,
      averageMonthlyCost: 4583,
      projectedAnnualCost: 58500,
      variance: 17.3,
    },
    insights: [
      'Utilities costs trending 17.3% over budget',
      'Electric usage driving majority of increase',
      'Recommend energy efficiency upgrades',
    ],
  },
  {
    id: 'trend-002',
    category: 'maintenance',
    period: 'quarter',
    data: [
      { date: '2025-Q4', actual: 8500, predicted: 8200 },
      { date: '2026-Q1', actual: 6200, predicted: 6500 },
      { date: '2026-Q2', actual: 0, predicted: 7100 },
    ],
    analysis: {
      trend: 'stable',
      percentChange: -2.3,
      averageMonthlyCost: 2433,
      projectedAnnualCost: 29200,
      variance: 0,
    },
    insights: [
      'Maintenance costs within expected range',
      'Preventive maintenance reducing emergency repairs',
    ],
  },
];

// Mock Anomaly Detections
export const mockAnomalies: AnomalyDetection[] = [
  {
    id: 'anom-001',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    type: 'usage_spike',
    severity: 'high',
    title: 'Unusual Water Usage - Building A',
    description: 'Water consumption 340% above baseline during off-peak hours',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
    },
    affectedSystems: ['Water Monitoring', 'Cost Tracking'],
    metrics: {
      expected: 45,
      actual: 198,
      deviation: 340,
    },
    mlConfidence: 94,
    rootCause: 'Potential irrigation system malfunction or leak',
    recommendedActions: [
      'Inspect irrigation system immediately',
      'Check for visible leaks in common areas',
      'Review water sensor data for specific units',
    ],
    estimatedImpact: {
      cost: 850,
      efficiency: -35,
      risk: 'High - potential property damage',
    },
    status: 'investigating',
  },
  {
    id: 'anom-002',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    type: 'device_malfunction',
    severity: 'medium',
    title: 'Network Device Offline Pattern',
    description: 'Access point cycling offline/online every 4 hours',
    location: {
      propertyId: 'prop-002',
      propertyName: 'Riverside Complex',
      buildingId: 'bldg-003',
      buildingName: 'Building A',
    },
    affectedSystems: ['Network Infrastructure', 'Security Cameras'],
    metrics: {
      expected: 99.9,
      actual: 87.5,
      deviation: -12.4,
    },
    mlConfidence: 88,
    rootCause: 'Possible power supply issue or firmware bug',
    recommendedActions: [
      'Check PoE switch port health',
      'Update access point firmware',
      'Consider power supply replacement',
    ],
    estimatedImpact: {
      cost: 200,
      risk: 'Medium - intermittent security coverage',
    },
    status: 'detected',
  },
];

// Mock Predictive Insights
export const mockPredictiveInsights: PredictiveInsight[] = [
  {
    id: 'insight-001',
    category: 'cost',
    priority: 'high',
    title: 'Projected Budget Overrun - Q2 2026',
    summary: 'Utilities costs projected to exceed Q2 budget by $3,200 (18%)',
    details: 'Based on current consumption trends and seasonal patterns, electric usage is trending 22% above budget. Water usage is within normal range. Primary drivers: increased HVAC usage and aging equipment inefficiency.',
    impact: {
      financial: 3200,
      operational: 'Budget reallocation required',
      risk: 'Medium - manageable with proactive measures',
    },
    confidence: 87,
    dataPoints: 2847,
    timeframe: 'Next 60 days',
    actionable: true,
    actions: [
      'Schedule HVAC efficiency audit',
      'Implement smart thermostat program',
      'Review and adjust Q3 budget projections',
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'insight-002',
    category: 'equipment',
    priority: 'critical',
    title: 'Multiple Equipment Failures Predicted',
    summary: '3 devices at high risk of failure within 14 days',
    details: 'ML models predict high probability of failure for 1 camera, 1 electric monitor, and 1 water sensor. Combined replacement cost: $570. Potential failure cost if not addressed: $4,150.',
    impact: {
      financial: 3580,
      operational: 'Service disruption risk',
      risk: 'High - potential data loss and property damage',
    },
    confidence: 85,
    dataPoints: 15234,
    timeframe: 'Next 14 days',
    actionable: true,
    actions: [
      'Order replacement equipment immediately',
      'Schedule maintenance window',
      'Prepare backup monitoring solutions',
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'insight-003',
    category: 'efficiency',
    priority: 'medium',
    title: 'Energy Efficiency Opportunity Identified',
    summary: 'Potential 12% reduction in electric costs through optimization',
    details: 'Analysis of usage patterns reveals significant opportunity for load shifting and HVAC optimization. Properties with smart thermostats show 12-15% lower electric costs.',
    impact: {
      financial: -6840,
      operational: 'Improved tenant comfort',
      risk: 'Low - proven technology',
    },
    confidence: 79,
    dataPoints: 8932,
    timeframe: 'Annual savings',
    actionable: true,
    actions: [
      'Pilot smart thermostat program in 10 units',
      'Implement time-of-use rate optimization',
      'Educate tenants on energy-saving practices',
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Mock ML Models
export const mockMLModels: MLModel[] = [
  {
    id: 'model-001',
    name: 'Equipment Failure Predictor v2.1',
    type: 'failure_prediction',
    status: 'active',
    accuracy: 87.3,
    lastTrained: new Date(Date.now() - 7 * 86400000).toISOString(),
    dataPoints: 45678,
    version: '2.1.0',
  },
  {
    id: 'model-002',
    name: 'Energy Forecast Model',
    type: 'energy_forecast',
    status: 'active',
    accuracy: 84.1,
    lastTrained: new Date(Date.now() - 3 * 86400000).toISOString(),
    dataPoints: 128934,
    version: '1.8.2',
  },
  {
    id: 'model-003',
    name: 'Anomaly Detection Engine',
    type: 'anomaly_detection',
    status: 'active',
    accuracy: 91.7,
    lastTrained: new Date(Date.now() - 1 * 86400000).toISOString(),
    dataPoints: 234567,
    version: '3.0.1',
  },
];
