export interface LaundryMachine {
  id: string;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  machine_type: 'washer' | 'dryer';
  provider: 'csc_serviceworks'; // CSC ServiceWorks is the laundry service provider
  brand: string; // Machine manufacturer (e.g. Speed Queen)
  model: string;
  serial_number: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'out_of_order';
  last_maintenance?: string;
  next_maintenance?: string;
  total_cycles: number;
  cycles_today: number;
  cycles_this_month: number;
  revenue_today: number;
  revenue_this_month: number;
  average_cycle_time: number; // in minutes
  current_cycle_start?: string;
  current_cycle_end?: string;
  error_codes: string[];
  efficiency_score: number;
  water_usage_per_cycle?: number; // for washers
  energy_usage_per_cycle: number; // for both
  installation_date: string;
  warranty_expiry?: string;
}

export interface LaundrySession {
  id: string;
  machine_id: string;
  property_id: string;
  user_id?: string;
  unit_number?: string;
  start_time: string;
  end_time?: string;
  duration?: number; // in minutes
  cycle_type: 'quick' | 'normal' | 'heavy' | 'delicate';
  cost: number;
  payment_method: 'card' | 'csc_go' | 'coin'; // CSC GO app, card reader, or coin
  status: 'active' | 'completed' | 'cancelled' | 'error';
  machine_type: 'washer' | 'dryer';
  revenue: number;
  water_usage?: number;
  energy_usage: number;
}

export interface LaundryRevenue {
  id: string;
  property_id: string;
  date: string;
  total_revenue: number;
  washer_revenue: number;
  dryer_revenue: number;
  total_sessions: number;
  washer_sessions: number;
  dryer_sessions: number;
  peak_hour: number;
  average_session_duration: number;
  payment_breakdown: {
    card: number;
    csc_go: number; // CSC GO mobile app payments
    coin: number;
  };
}

export interface LaundryAlert {
  id: string;
  property_id: string;
  machine_id?: string;
  type: 'maintenance_due' | 'error' | 'offline' | 'revenue_drop' | 'high_usage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  machine_type?: 'washer' | 'dryer';
  machine_location?: string;
}

export interface LaundryAnalytics {
  property_id: string;
  period: 'daily' | 'weekly' | 'monthly';
  total_revenue: number;
  revenue_growth: number; // percentage
  total_sessions: number;
  session_growth: number; // percentage
  average_revenue_per_session: number;
  peak_usage_hours: number[];
  machine_utilization: number; // percentage
  maintenance_costs: number;
  profit_margin: number;
  top_performing_machines: {
    machine_id: string;
    revenue: number;
    sessions: number;
  }[];
  revenue_forecast: {
    period: string;
    predicted_revenue: number;
    confidence: number;
  }[];
}

export interface LaundrySettings {
  property_id: string;
  washer_cost: {
    quick: number;
    normal: number;
    heavy: number;
    delicate: number;
  };
  dryer_cost: {
    quick: number;
    normal: number;
    heavy: number;
    delicate: number;
  };
  operating_hours: {
    open: string;
    close: string;
  };
  maintenance_reminder_days: number;
  revenue_alert_threshold: number; // percentage drop
  auto_maintenance_scheduling: boolean;
  payment_methods: ('card' | 'csc_go' | 'coin')[];
}
