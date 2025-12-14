import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStatistics, getSolPeds } from '../services/api';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSolPeds, setRecentSolPeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, solPedsRes] = await Promise.all([
        getStatistics(),
        getSolPeds()
      ]);
      setStats(statsRes.data);
      setRecentSolPeds(solPedsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      BORRADOR: 'bg-gray-200 text-gray-800',
      ENVIADA_ADMINISTRACION: 'bg-blue-200 text-blue-800',
      EN_REVISION_COTIZANDO: 'bg-yellow-200 text-yellow-800',
      PENDIENTE_VALIDACION_PRECIO: 'bg-orange-200 text-orange-800',
      RECHAZADA_VALIDACION: 'bg-red-200 text-red-800',
      APROBADA_PARA_COMPRAR: 'bg-green-200 text-green-800',
      ORDEN_COMPRA_GENERADA: 'bg-purple-200 text-purple-800',
      COMPRADA: 'bg-indigo-200 text-indigo-800',
      RECIBIDA_ENTREGADA: 'bg-teal-200 text-teal-800',
      CANCELADA: 'bg-red-300 text-red-900'
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      BORRADOR: 'Borrador',
      ENVIADA_ADMINISTRACION: 'Enviada a Administración',
      EN_REVISION_COTIZANDO: 'En Revisión / Cotizando',
      PENDIENTE_VALIDACION_PRECIO: 'Pendiente Validación',
      RECHAZADA_VALIDACION: 'Rechazada',
      APROBADA_PARA_COMPRAR: 'Aprobada para Comprar',
      ORDEN_COMPRA_GENERADA: 'OC Generada',
      COMPRADA: 'Comprada',
      RECIBIDA_ENTREGADA: 'Recibida/Entregada',
      CANCELADA: 'Cancelada'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-600">Cargando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          {user.role === 'PEDIDOR' && (
            <button
              onClick={() => navigate('/crear-solped')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              + Nueva SolPed
            </button>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-500 text-sm">Total</div>
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg shadow">
              <div className="text-blue-600 text-sm">Borradores</div>
              <div className="text-3xl font-bold text-blue-700">{stats.byStatus.BORRADOR}</div>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg shadow">
              <div className="text-yellow-600 text-sm">En Revisión</div>
              <div className="text-3xl font-bold text-yellow-700">{stats.byStatus.EN_REVISION_COTIZANDO}</div>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg shadow">
              <div className="text-orange-600 text-sm">Pendiente Validación</div>
              <div className="text-3xl font-bold text-orange-700">{stats.byStatus.PENDIENTE_VALIDACION_PRECIO}</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Solicitudes Recientes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentSolPeds.map(solped => (
                  <tr key={solped.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{solped.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(solped.status)}`}>
                        {getStatusLabel(solped.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{solped.priority}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{solped.createdBy.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(solped.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => navigate(`/solped/${solped.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/mis-solicitudes')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todas las solicitudes →
          </button>
        </div>
      </div>
    </Layout>
  );
}
