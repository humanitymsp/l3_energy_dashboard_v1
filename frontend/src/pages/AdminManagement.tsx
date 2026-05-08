import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Building2, Zap, Droplet, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = 'http://localhost:4000';

type Tab = 'properties' | 'buildings' | 'devices';

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: { label: string; value: string }[];
  required?: boolean;
}

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('properties');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  // Fetch data
  const { data: properties = [] } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => fetch(`${API_BASE}/api/properties`).then(r => r.json()),
  });

  const { data: buildingsData } = useQuery({
    queryKey: ['admin-buildings'],
    queryFn: () => fetch(`${API_BASE}/api/admin/buildings`).then(r => r.json()),
  });
  const buildings = buildingsData?.buildings || [];

  const { data: devicesData } = useQuery({
    queryKey: ['admin-devices'],
    queryFn: () => fetch(`${API_BASE}/api/devices`).then(r => r.json()),
  });
  const devices = devicesData?.devices || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async ({ endpoint, data }: { endpoint: string; data: any }) => {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-buildings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-devices'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ endpoint, data }: { endpoint: string; data: any }) => {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-buildings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-devices'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-buildings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-devices'] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'properties') {
      if (editingId) {
        updateMutation.mutate({ endpoint: `/api/properties/${editingId}`, data: formData });
      } else {
        createMutation.mutate({ endpoint: '/api/properties', data: formData });
      }
    } else if (activeTab === 'buildings') {
      if (editingId) {
        updateMutation.mutate({ endpoint: `/api/buildings/${editingId}`, data: formData });
      } else {
        createMutation.mutate({ endpoint: '/api/buildings', data: formData });
      }
    } else if (activeTab === 'devices') {
      if (editingId) {
        updateMutation.mutate({ endpoint: `/api/devices/${editingId}`, data: formData });
      } else {
        createMutation.mutate({ endpoint: '/api/devices', data: formData });
      }
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    if (activeTab === 'properties') deleteMutation.mutate(`/api/properties/${id}`);
    else if (activeTab === 'buildings') deleteMutation.mutate(`/api/buildings/${id}`);
    else if (activeTab === 'devices') deleteMutation.mutate(`/api/devices/${id}`);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setShowForm(true);
  };

  const getFormFields = (): FormField[] => {
    if (activeTab === 'properties') {
      return [
        { key: 'name', label: 'Property Name', type: 'text', required: true },
        { key: 'address', label: 'Address', type: 'text', required: true },
        { key: 'units_count', label: 'Total Units', type: 'number' },
        { key: 'buildings_count', label: 'Number of Buildings', type: 'number' },
      ];
    } else if (activeTab === 'buildings') {
      return [
        { key: 'property_id', label: 'Property', type: 'select', required: true, options: properties.map((p: any) => ({ label: p.name, value: p.id })) },
        { key: 'name', label: 'Building Name', type: 'text', required: true },
        { key: 'address', label: 'Address', type: 'text' },
        { key: 'floor_count', label: 'Floors', type: 'number' },
        { key: 'unit_count', label: 'Units', type: 'number' },
      ];
    } else {
      return [
        { key: 'property_id', label: 'Property', type: 'select', required: true, options: properties.map((p: any) => ({ label: p.name, value: p.id })) },
        { key: 'building_id', label: 'Building', type: 'select', options: buildings.map((b: any) => ({ label: `${b.name} (${properties.find((p: any) => p.id === b.property_id)?.name || ''})`, value: b.id })) },
        { key: 'type', label: 'Device Type', type: 'select', required: true, options: [
          { label: 'Shelly Pro 3EM (3-phase main panel)', value: 'shelly_pro_3em' },
          { label: 'Shelly EM (single-phase unit)', value: 'shelly_em' },
          { label: 'Shelly Plus Uni (pulse counter / laundry)', value: 'shelly_plus_uni' },
          { label: 'Dragino SW3L (water flow)', value: 'ecodirect_water' },
          { label: 'Dragino S31-LB (inline flow)', value: 'ecodirect_inline' },
        ]},
        { key: 'name', label: 'Device Name', type: 'text', required: true },
        { key: 'location', label: 'Physical Location', type: 'text', required: true },
      ];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage properties, buildings, and devices</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {activeTab === 'properties' ? 'Property' : activeTab === 'buildings' ? 'Building' : 'Device'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted/50 rounded-lg p-1 w-fit">
        {(['properties', 'buildings', 'devices'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); resetForm(); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {editingId ? 'Edit' : 'Add'} {activeTab === 'properties' ? 'Property' : activeTab === 'buildings' ? 'Building' : 'Device'}
            </h2>
            <button onClick={resetForm} className="p-1 hover:bg-muted rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFormFields().map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    required={field.required}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                    required={field.required}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                )}
              </div>
            ))}
            <div className="md:col-span-2 flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {activeTab === 'properties' && (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Address</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Units</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Buildings</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {properties.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.address}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.units_count || 0}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.buildings_count || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-muted rounded mr-1"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No properties yet</td></tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'buildings' && (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Property</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Floors</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Units</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {buildings.map((b: any) => (
                <tr key={b.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">{b.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{properties.find((p: any) => p.id === b.property_id)?.name || b.property_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.floor_count || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.unit_count || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(b)} className="p-1.5 hover:bg-muted rounded mr-1"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </td>
                </tr>
              ))}
              {buildings.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No buildings yet</td></tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'devices' && (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {devices.map((d: any) => (
                <tr key={d.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      {d.type === 'shelly_pro_3em' ? 'Pro 3EM' : d.type === 'shelly_em' ? 'Shelly EM' : d.type === 'shelly_plus_uni' ? 'Plus Uni' : 'Dragino'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.location}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      d.status === 'online' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(d)} className="p-1.5 hover:bg-muted rounded mr-1"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(d.id)} className="p-1.5 hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No devices yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Info */}
      <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Note:</strong> Data is stored in-memory on the backend. Changes persist until the server restarts. When connected to PostgreSQL, data will be permanent.</p>
      </div>
    </div>
  );
}
