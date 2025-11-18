import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Solo mostrar sidebar en rutas autenticadas
  const showSidebar = user && !['/login', '/register', '/', '/about', '/contact'].includes(location.pathname);

  // Determinar si mostrar navegación adicional
  const isHomeOrPublic = ['/', '/about', '/contact', '/projects'].includes(location.pathname);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg z-10 flex-shrink-0">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {showSidebar && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>
              )}
              <Link to="/" className="text-2xl font-bold text-green-600 hover:text-green-700 transition">
                GreenTech Hub
              </Link>
            </div>

            {/* Centro - Navegación */}
            {isHomeOrPublic && user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-medium transition">
                  📊 Dashboard
                </Link>
                <Link to="/projects" className="text-gray-600 hover:text-green-600 font-medium transition">
                  🌍 Proyectos
                </Link>
                <Link to="/wallet" className="text-gray-600 hover:text-green-600 font-medium transition">
                  💰 Wallet
                </Link>
              </div>
            )}

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <aside className="w-64 flex-shrink-0 overflow-hidden">
            <Sidebar user={user} collapsed={sidebarCollapsed} />
          </aside>
        )}
        
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className={`w-full h-full ${showSidebar ? 'px-4' : 'px-6'} py-8 overflow-auto`}>
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-lg flex-shrink-0">
        <div className="w-full px-4 py-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2025 GreenTech Hub. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4">
              <Link to="/about" className="text-sm text-gray-600 hover:text-green-600">
                Sobre Nosotros
              </Link>
              <Link to="/contact" className="text-sm text-gray-600 hover:text-green-600">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;