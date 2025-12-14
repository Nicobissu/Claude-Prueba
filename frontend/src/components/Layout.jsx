import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../services/api';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000); // Cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (role) => {
    const roles = {
      PEDIDOR: 'Pedidor',
      ADMINISTRACION: 'Administración',
      VALIDADOR: 'Validador',
      ADMIN: 'Administrador'
    };
    return roles[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1
                className="text-2xl font-bold cursor-pointer"
                onClick={() => navigate('/')}
              >
                SolPed
              </h1>
              {user && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate('/')}
                    className="hover:bg-blue-700 px-3 py-2 rounded"
                  >
                    Dashboard
                  </button>
                  {(user.role === 'PEDIDOR') && (
                    <button
                      onClick={() => navigate('/mis-solicitudes')}
                      className="hover:bg-blue-700 px-3 py-2 rounded"
                    >
                      Mis Solicitudes
                    </button>
                  )}
                  {user.role === 'ADMIN' && (
                    <button
                      onClick={() => navigate('/usuarios')}
                      className="hover:bg-blue-700 px-3 py-2 rounded"
                    >
                      Usuarios
                    </button>
                  )}
                </div>
              )}
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/notificaciones')}
                  className="relative hover:bg-blue-700 px-3 py-2 rounded"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{user.fullName}</span>
                  <span className="text-xs bg-blue-800 px-2 py-1 rounded">
                    {getRoleName(user.role)}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
