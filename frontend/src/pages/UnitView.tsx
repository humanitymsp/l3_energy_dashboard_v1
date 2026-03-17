import { useParams } from 'react-router-dom';

export default function UnitView() {
  const { unitId } = useParams<{ unitId: string }>();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Unit View</h1>
      <p className="text-gray-500">Unit ID: {unitId}</p>
      <p className="text-gray-500">Unit view implementation coming soon...</p>
    </div>
  );
}
