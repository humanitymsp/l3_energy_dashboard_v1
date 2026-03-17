// Predictive Analytics Types

export interface EquipmentPrediction {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: 'water_sensor' | 'electric_monitor' | 'camera' | 'access_point' | 'network_device' | 'hvac';
  location: {
    propertyId: string;
    propertyName: string;
    buildingId?: string;
    buildingName?: string;
    unitId?: string;
    unitNumber?: string;
  };
  prediction: {
    failureRisk: 'low' | 'medium' | 'high' | 'critical';
    failureProbability: number; // 0-100
    estimatedDaysToFailure: number;
    confidence: number; // 0-100
  };
  indicators: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    value: number;
    threshold: number;
  }>;
  recommendedActions: string[];
  estimatedMaintenanceCost: number;
  estimatedFailureCost: number;
  lastUpdated: string;
}

export interface EnergyForecast {
  id: string;
  propertyId: string;
  propertyName: string;
  period: 'daily' | 'weekly' | 'monthly';
  forecast: {
    electric: {
      predicted: number; // kWh
      confidence: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      percentChange: number;
    };
    water: {
      predicted: number; // gallons
      confidence: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      percentChange: number;
    };
  };
  historicalAverage: {
    electric: number;
    water: number;
  };
  anomalies: Array<{
    type: 'spike' | 'drop' | 'pattern_change';
    severity: 'low' | 'medium' | 'high';
    description: string;
    expectedImpact: number;
  }>;
  recommendations: string[];
  generatedAt: string;
}

export interface CostTrend {
  id: string;
  category: 'utilities' | 'maintenance' | 'security' | 'network' | 'total';
  period: 'month' | 'quarter' | 'year';
  data: Array<{
    date: string;
    actual: number;
    predicted: number;
    budget?: number;
  }>;
  analysis: {
    trend: 'increasing' | 'decreasing' | 'stable';
    percentChange: number;
    averageMonthlyCost: number;
    projectedAnnualCost: number;
    variance: number; // vs budget
  };
  insights: string[];
}

export interface AnomalyDetection {
  id: string;
  timestamp: string;
  type: 'usage_spike' | 'usage_drop' | 'device_malfunction' | 'security_breach' | 'network_issue' | 'cost_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    propertyId: string;
    propertyName: string;
    buildingId?: string;
    buildingName?: string;
    unitId?: string;
    unitNumber?: string;
  };
  affectedSystems: string[];
  metrics: {
    expected: number;
    actual: number;
    deviation: number; // percentage
  };
  mlConfidence: number; // 0-100
  rootCause?: string;
  recommendedActions: string[];
  estimatedImpact: {
    cost?: number;
    efficiency?: number;
    risk?: string;
  };
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  resolvedAt?: string;
}

export interface PredictiveInsight {
  id: string;
  category: 'equipment' | 'energy' | 'cost' | 'security' | 'efficiency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  summary: string;
  details: string;
  impact: {
    financial?: number;
    operational?: string;
    risk?: string;
  };
  confidence: number;
  dataPoints: number;
  timeframe: string;
  actionable: boolean;
  actions?: string[];
  createdAt: string;
}

export interface MLModel {
  id: string;
  name: string;
  type: 'failure_prediction' | 'energy_forecast' | 'anomaly_detection' | 'cost_optimization';
  status: 'training' | 'active' | 'updating' | 'deprecated';
  accuracy: number;
  lastTrained: string;
  dataPoints: number;
  version: string;
}
