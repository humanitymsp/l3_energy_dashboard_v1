import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Building2, Home, Zap, Droplet, AlertTriangle, ArrowLeft, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function BuildingView() {
  const { buildingId } = useParams<{ buildingId: string }>();

  // Fetch building details
  const { data: buildingData, isLoading: buildingLoading } = useQuery({
    queryKey: ['building', buildingId],
    queryFn: async () => {
      // Mock building data based on buildingId
      const buildings: Record<string, any> = {
        'bldg-001': {
          id: 'bldg-001',
          property_id: 'prop-001',
          property_name: 'Sunset Apartments',
          name: 'Building A',
          address: '123 NW 23rd Ave, Building A',
          floor_count: 4,
          unit_count: 24,
          active_alerts: 2,
          total_electric_kwh: 6200,
          total_water_gallons: 22800,
          occupied_units: 22,
          vacant_units: 2,
        },
        'bldg-002': {
          id: 'bldg-002',
          property_id: 'prop-001',
          property_name: 'Sunset Apartments',
          name: 'Building B',
          address: '123 NW 23rd Ave, Building B',
          floor_count: 4,
          unit_count: 24,
          active_alerts: 1,
          total_electric_kwh: 6250,
          total_water_gallons: 22800,
          occupied_units: 22,
          vacant_units: 2,
        },
        'bldg-003': {
          id: 'bldg-003',
          property_id: 'prop-002',
          property_name: 'Riverside Complex',
          name: 'Building C',
          address: '456 SE Hawthorne Blvd, Building C',
          floor_count: 6,
          unit_count: 72,
          active_alerts: 2,
          total_electric_kwh: 18920,
          total_water_gallons: 68400,
          occupied_units: 68,
          vacant_units: 4,
        },
      };
      return buildings[buildingId!] || buildings['bldg-001'];
    },
    enabled: !!buildingId,
  });

  // Fetch devices for this building
  const { data: devicesData } = useQuery({
    queryKey: ['devices', buildingId],
    queryFn: () => fetch(`http://localhost:4000/api/devices`).then(res => res.json()),
  });

  // Fetch usage data
  const { data: usageData } = useQuery({
    queryKey: ['usage', buildingId],
    queryFn: () => fetch(`http://localhost:4000/api/usage`).then(res => res.json()),
  });

  if (buildingLoading) {
    return <div className="flex items-center justify-center h-64">Loading building details...</div>;
  }

  const building = buildingData;
  const devices = devicesData?.devices?.filter((d: any) => d.building_id === buildingId) || [];
  const shellyDevices = devices.filter((d: any) => d.type.startsWith('shelly'));
  const ecodirectDevices = devices.filter((d: any) => d.type.startsWith('ecodirect'));
  const buildingMainDevices = devices.filter((d: any) => !d.unit_id);
  const unitDevices = devices.filter((d: any) => d.unit_id);

  // Generate mock units for this building
  const units = Array.from({ length: building.unit_count }, (_, i) => {
    const unitNum = (i + 1).toString().padStart(3, '0');
    const isOccupied = i < building.occupied_units;
    return {
      id: `unit-${unitNum}`,
      number: unitNum,
      floor: Math.floor(i / (building.unit_count / building.floor_count)) + 1,
      occupied: isOccupied,
      electric_kwh_today: isOccupied ? Math.random() * 20 + 5 : Math.random() * 2,
      water_gallons_today: isOccupied ? Math.random() * 80 + 20 : Math.random() * 5,
    };
  });

  const electricUsage = usageData?.electric || [];
  const waterUsage = usageData?.water || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/properties/${building.property_id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {building.property_name}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{building.name}</h1>
          <p className="text-gray-500 mt-1">{building.address}</p>
        </div>
        {building.active_alerts > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {building.active_alerts} Active Alerts
          </span>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Units</dt>
              <dd className="text-2xl font-semibold text-gray-900">{building.occupied_units}/{building.unit_count}</dd>
              <dd className="text-xs text-gray-500">{building.floor_count} floors</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Electric (30d)</dt>
              <dd className="text-2xl font-semibold text-gray-900">{building.total_electric_kwh.toLocaleString()} kWh</dd>
              <dd className="text-xs text-green-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                3.2% vs last month
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Droplet className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Water (30d)</dt>
              <dd className="text-2xl font-semibold text-gray-900">{building.total_water_gallons.toLocaleString()} gal</dd>
              <dd className="text-xs text-green-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                1.8% vs last month
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Monitoring Devices</dt>
              <dd className="text-2xl font-semibold text-gray-900">{devices.length}</dd>
              <dd className="text-xs text-gray-500">{shellyDevices.length} Shelly + {ecodirectDevices.length} Ecodirect</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Building-Level Devices */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Building-Level Monitoring</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buildingMainDevices.map((device: any) => (
              <div
                key={device.id}
                className={`border rounded-lg p-4 ${
                  device.alert ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-900">{device.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{device.location}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                      {device.type === 'shelly_pro_3em' ? 'Shelly Pro 3EM' : 'Ecodirect Main'}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {device.status}
                  </span>
                </div>

                {device.alert && (
                  <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded">
                    <p className="text-xs font-medium text-red-800 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {device.alert}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {device.current_power_kw && (
                    <div>
                      <span className="text-gray-600">Current Power</span>
                      <p className="font-semibold text-gray-900">{device.current_power_kw} kW</p>
                    </div>
                  )}
                  {device.total_kwh_today && (
                    <div>
                      <span className="text-gray-600">Today's Usage</span>
                      <p className="font-semibold text-gray-900">{device.total_kwh_today} kWh</p>
                    </div>
                  )}
                  {device.current_flow_gpm !== undefined && (
                    <div>
                      <span className="text-gray-600">Current Flow</span>
                      <p className="font-semibold text-gray-900">{device.current_flow_gpm} GPM</p>
                    </div>
                  )}
                  {device.total_gallons_today && (
                    <div>
                      <span className="text-gray-600">Today's Usage</span>
                      <p className="font-semibold text-gray-900">{device.total_gallons_today.toLocaleString()} gal</p>
                    </div>
                  )}
                  {device.voltage_l1 && (
                    <div className="col-span-2">
                      <span className="text-gray-600">3-Phase Voltage</span>
                      <p className="font-semibold text-gray-900 text-xs">
                        L1: {device.voltage_l1}V | L2: {device.voltage_l2}V | L3: {device.voltage_l3}V
                      </p>
                    </div>
                  )}
                  {device.power_factor && (
                    <div>
                      <span className="text-gray-600">Power Factor</span>
                      <p className="font-semibold text-gray-900">{device.power_factor}</p>
                    </div>
                  )}
                  {device.pressure_psi && (
                    <div>
                      <span className="text-gray-600">Pressure</span>
                      <p className="font-semibold text-gray-900">{device.pressure_psi} PSI</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Electric Usage Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Electric Usage (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={electricUsage}>
              <defs>
                <linearGradient id="electricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="kwh" stroke="#f59e0b" fillOpacity={1} fill="url(#electricGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Water Usage Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Water Usage (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={waterUsage}>
              <defs>
                <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="gallons" stroke="#3b82f6" fillOpacity={1} fill="url(#waterGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Units List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Units ({building.unit_count} total)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {units.map((unit) => (
              <Link
                key={unit.id}
                to={`/units/${unit.id}`}
                className={`border rounded-lg p-3 hover:shadow-md transition-shadow ${
                  unit.occupied ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">#{unit.number}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    unit.occupied ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {unit.occupied ? 'Occupied' : 'Vacant'}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    {unit.electric_kwh_today.toFixed(1)} kWh
                  </div>
                  <div className="flex items-center">
                    <Droplet className="h-3 w-3 mr-1" />
                    {unit.water_gallons_today.toFixed(0)} gal
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
