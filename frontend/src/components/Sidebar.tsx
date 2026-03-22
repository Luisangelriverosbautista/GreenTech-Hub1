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
    <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="2" />
    <circle cx="16" cy="12" r="1.5" strokeWidth="2" />
  </svg>
);

const ContentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55-2.275A1 1 0 0121 8.618v6.764a1 1 0 01-1.45.893L15 14m-6 5h5a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);

const CurationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
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

          <NavItem
            to="/content"
            icon={<ContentIcon />}
            isActive={isActive('/content')}
          >
            {!collapsed && 'Contenido'}
          </NavItem>

          {user.role === 'admin' && (
            <NavItem
              to="/curation"
              icon={<CurationIcon />}
              isActive={isActive('/curation')}
            >
              {!collapsed && 'Curaduría'}
            </NavItem>
          )}
        </div>
      </div>
    </div>
  );
};