import { useState } from 'react';
import { Activity, Zap, Clock, AlertTriangle, CheckCircle2, RefreshCw, TrendingUp, DollarSign } from 'lucide-react';

interface LaundryMachine {
  id: string;
  name: string;
  type: 'washer' | 'dryer';
  property: string;
  location: string;
  status: 'running' | 'idle' | 'offline' | 'error';
  cyclestoday: number;
  cyclesTotalMonth: number;
  avgCycleMinutes: number;
  lastCycleEnd: string;
  shellyDevice: string;
  revenuePerCycle: number;
}

export default function LaundryMonitoring() {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  // Mock data representing what Shelly pulse counters would actually report
  // Each Shelly Plus Uni counts dry contact closures from coin mech / card reader start signal
  const machines: LaundryMachine[] = [
    {
      id: 'wash-001', name: 'Washer #1', type: 'washer',
      property: 'NBC HQ - Building A', location: 'Basement Laundry Room',
      status: 'running', cyclestoday: 8, cyclesTotalMonth: 142,
      avgCycleMinutes: 35, lastCycleEnd: '10 min ago',
      shellyDevice: 'shelly-uni-wash-001', revenuePerCycle: 2.50,
    },
    {
      id: 'wash-002', name: 'Washer #2', type: 'washer',
      property: 'NBC HQ - Building A', location: 'Basement Laundry Room',
      status: 'idle', cyclestoday: 6, cyclesTotalMonth: 128,
      avgCycleMinutes: 34, lastCycleEnd: '45 min ago',
      shellyDevice: 'shelly-uni-wash-002', revenuePerCycle: 2.50,
    },
    {
      id: 'wash-003', name: 'Washer #3', type: 'washer',
      property: 'NBC HQ - Building A', location: 'Basement Laundry Room',
      status: 'idle', cyclestoday: 5, cyclesTotalMonth: 115,
      avgCycleMinutes: 36, lastCycleEnd: '1 hr ago',
      shellyDevice: 'shelly-uni-wash-003', revenuePerCycle: 2.50,
    },
    {
      id: 'dry-001', name: 'Dryer #1', type: 'dryer',
      property: 'NBC HQ - Building A', location: 'Basement Laundry Room',
      status: 'running', cyclestoday: 7, cyclesTotalMonth: 136,
      avgCycleMinutes: 45, lastCycleEnd: '5 min ago',
      shellyDevice: 'shelly-uni-dry-001', revenuePerCycle: 2.75,
    },
    {
      id: 'dry-002', name: 'Dryer #2', type: 'dryer',
      property: 'NBC HQ - Building A', location: 'Basement Laundry Room',
      status: 'idle', cyclestoday: 6, cyclesTotalMonth: 130,
      avgCycleMinutes: 44, lastCycleEnd: '30 min ago',
      shellyDevice: 'shelly-uni-dry-002', revenuePerCycle: 2.75,
    },
    {
      id: 'dry-003', name: 'Dryer #3', type: 'dryer',
      property: 'NBC HQ - Building A', location: 'Basement Laundry Room',
      status: 'error', cyclestoday: 0, cyclesTotalMonth: 98,
      avgCycleMinutes: 45, lastCycleEnd: '2 days ago',
      shellyDevice: 'shelly-uni-dry-003', revenuePerCycle: 2.75,
    },
    {
      id: 'wash-004', name: 'Washer #1', type: 'washer',
      property: 'NBC HQ - Building B', location: '2nd Floor Laundry',
      status: 'running', cyclestoday: 4, cyclesTotalMonth: 98,
      avgCycleMinutes: 35, lastCycleEnd: '12 min ago',
      shellyDevice: 'shelly-uni-wash-004', revenuePerCycle: 2.50,
    },
    {
      id: 'dry-004', name: 'Dryer #1', type: 'dryer',
      property: 'NBC HQ - Building B', location: '2nd Floor Laundry',
      status: 'idle', cyclestoday: 3, cyclesTotalMonth: 87,
      avgCycleMinutes: 44, lastCycleEnd: '1 hr ago',
      shellyDevice: 'shelly-uni-dry-004', revenuePerCycle: 2.75,
    },
  ];

  const filteredMachines = selectedProperty === 'all'
    ? machines
    : machines.filter(m => m.property === selectedProperty);

  const properties = [...new Set(machines.map(m => m.property))];

  const totalCyclesToday = filteredMachines.reduce((sum, m) => sum + m.cyclestoday, 0);
  const totalCyclesMonth = filteredMachines.reduce((sum, m) => sum + m.cyclesTotalMonth, 0);
  const estimatedRevenueToday = filteredMachines.reduce((sum, m) => sum + (m.cyclestoday * m.revenuePerCycle), 0);
  const estimatedRevenueMonth = filteredMachines.reduce((sum, m) => sum + (m.cyclesTotalMonth * m.revenuePerCycle), 0);
  const runningCount = filteredMachines.filter(m => m.status === 'running').length;
  const errorCount = filteredMachines.filter(m => m.status === 'error').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-success/10 text-success';
      case 'idle': return 'bg-muted text-muted-foreground';
      case 'offline': return 'bg-destructive/10 text-destructive';
      case 'error': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Laundry Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Machine usage tracked via Shelly Plus Uni pulse counters
          </p>
        </div>
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
        >
          <option value="all">All Properties</option>
          {properties.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Cycles Today</p>
              <p className="text-2xl font-bold text-foreground">{totalCyclesToday}</p>
            </div>
            <Activity className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Est. Revenue Today</p>
              <p className="text-2xl font-bold text-success">${estimatedRevenueToday.toFixed(2)}</p>
            </div>
            <DollarSign className="h-5 w-5 text-success" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Cycles This Month</p>
              <p className="text-2xl font-bold text-foreground">{totalCyclesMonth}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Est. Revenue Month</p>
              <p className="text-2xl font-bold text-success">${estimatedRevenueMonth.toFixed(2)}</p>
            </div>
            <DollarSign className="h-5 w-5 text-success" />
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 text-success rounded-full">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          {runningCount} Running
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full">
          {filteredMachines.filter(m => m.status === 'idle').length} Idle
        </span>
        {errorCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-destructive/10 text-destructive rounded-full">
            <AlertTriangle className="h-3 w-3" />
            {errorCount} Error
          </span>
        )}
      </div>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map((machine) => (
          <div
            key={machine.id}
            className={`bg-card border rounded-xl p-4 ${
              machine.status === 'error' ? 'border-destructive/40' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{machine.name}</h3>
                <p className="text-xs text-muted-foreground">{machine.property}</p>
                <p className="text-xs text-muted-foreground">{machine.location}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(machine.status)}`}>
                {machine.status}
              </span>
            </div>

            {machine.status === 'error' && (
              <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-xs text-destructive font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  No signal from Shelly device — check wiring or power
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Today</span>
                <p className="font-semibold text-foreground">{machine.cyclestoday} cycles</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">This Month</span>
                <p className="font-semibold text-foreground">{machine.cyclesTotalMonth} cycles</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Avg Cycle</span>
                <p className="font-semibold text-foreground">{machine.avgCycleMinutes} min</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Last Cycle</span>
                <p className="font-semibold text-foreground">{machine.lastCycleEnd}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <span className="font-mono">{machine.shellyDevice}</span>
              </div>
              <div className="text-xs font-medium text-success">
                ${(machine.cyclestoday * machine.revenuePerCycle).toFixed(2)} today
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">How Machine Monitoring Works</h3>
        <div className="text-sm text-muted-foreground space-y-3">
          <div>
            <span className="font-medium text-foreground">Hardware: Shelly Plus Uni (1 per machine)</span>
            <p className="mt-1">Each washer/dryer has a Shelly Plus Uni wired to the machine's start signal relay or coin mech contact closure. When a cycle starts, the Shelly detects the pulse and increments its counter. The device also monitors whether the machine is currently drawing power (running vs idle).</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Data Flow: Shelly → MQTT → Backend</span>
            <p className="mt-1">Shelly Plus Uni connects to WiFi and publishes counter events via Gen2 MQTT RPC protocol to the Mosquitto broker. The backend subscribes to these events, increments cycle counts, and calculates revenue based on configured per-cycle pricing ($2.50/wash, $2.75/dry).</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Revenue Estimation</span>
            <p className="mt-1">Revenue is calculated by multiplying cycle count × configured price per cycle. This works for coin-operated machines (each coin drop = 1 pulse = 1 cycle). For card-reader machines, the start signal from the card reader triggers the same contact closure.</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Alerts</span>
            <p className="mt-1">If a Shelly device goes offline (no MQTT heartbeat for 5+ minutes) or reports 0 cycles for 24+ hours during business hours, an alert is triggered. This catches equipment failures, wiring issues, or machines that are out of service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
