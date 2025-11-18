import { Link, useLocation } from 'react-router-dom';
import type { User } from '../types';

// Iconos como componentes inline SVG para mantener todo en un archivo
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
);

const ProjectsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
  </svg>
);

const TransactionsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

const CreateProjectIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
  </svg>
);

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

const NavItem = ({ to, icon, children, isActive }: NavItemProps) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-green-100 text-green-700'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span>{children}</span>
  </Link>
);

interface SidebarProps {
  user: User;
  collapsed?: boolean;
}

export const Sidebar = ({ user, collapsed = false }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`bg-white h-full shadow-lg transition-all ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="p-4">
        <div className="space-y-1">
          <NavItem
            to="/dashboard"
            icon={<DashboardIcon />}
            isActive={isActive('/dashboard')}
          >
            {!collapsed && 'Dashboard'}
          </NavItem>

          <NavItem
            to="/projects"
            icon={<ProjectsIcon />}
            isActive={isActive('/projects')}
          >
            {!collapsed && 'Proyectos'}
          </NavItem>

          {user.role === 'creator' && (
            <NavItem
              to="/create-project"
              icon={<CreateProjectIcon />}
              isActive={isActive('/create-project')}
            >
              {!collapsed && 'Crear Proyecto'}
            </NavItem>
          )}

          <NavItem
            to="/wallet"
            icon={<WalletIcon />}
            isActive={isActive('/wallet')}
          >
            {!collapsed && 'Wallet'}
          </NavItem>

          {user.role === 'donor' && (
            <NavItem
              to="/transactions"
              icon={<TransactionsIcon />}
              isActive={isActive('/transactions')}
            >
              {!collapsed && 'Transacciones'}
            </NavItem>
          )}
        </div>
      </div>
    </div>
  );
};