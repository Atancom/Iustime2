import React from 'react';
import { ViewState, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  CalendarClock, 
  AlertTriangle, 
  FileText,
  ChevronLeft,
  Home,
  Settings,
  LogOut,
  Globe,
  PieChart
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onExitLine: () => void;
  onLogout: () => void;
  lineName: string;
  isOpen: boolean;
  toggleSidebar: () => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  onExitLine,
  onLogout,
  lineName,
  isOpen,
  toggleSidebar,
  userRole
}) => {
  
  const menuItems = [
    { id: ViewState.PROJECTS, label: 'Proyectos', icon: Briefcase },
    { id: ViewState.TASKS, label: 'Tareas', icon: CheckSquare },
    { id: ViewState.TIMELINE, label: 'Línea de Tiempo', icon: CalendarClock },
    { id: ViewState.RISKS, label: 'Riesgos', icon: AlertTriangle },
    { id: ViewState.MONTHLY_REVIEW, label: 'Revisión Mensual', icon: FileText },
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  ];

  // Determine if we are in a "Global" view to hide the line-specific menu
  const isGlobalView = currentView === ViewState.GLOBAL_DASHBOARD || currentView === ViewState.GLOBAL_REVIEW || currentView === ViewState.CONFIGURATION;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-brand-900/60 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30 w-72 bg-brand-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-full border-r border-brand-800
      `}>
        {/* Brand Header */}
        <div className="p-8 border-b border-brand-800 bg-brand-950/30">
          <h1 
            onClick={userRole === 'ADMIN' ? onExitLine : undefined}
            className={`text-2xl font-bold text-white mb-8 tracking-tight transition-colors ${userRole === 'ADMIN' ? 'cursor-pointer hover:text-brand-300' : 'cursor-default'}`}
            title={userRole === 'ADMIN' ? "Volver al inicio" : ""}
          >
            Gestión de Líneas Ius
          </h1>
          <div className="flex items-center">
            <div className={`w-1 h-8 rounded-full mr-3 ${isGlobalView ? 'bg-purple-500' : 'bg-accent-500'}`}></div>
            <div className="overflow-hidden">
                <p className="text-xs text-brand-300 uppercase tracking-wider font-semibold">
                  {isGlobalView ? 'Modo Admin' : 'Línea Actual'}
                </p>
                <p className="text-sm font-bold text-white truncate w-48 leading-tight" title={lineName}>
                  {isGlobalView ? 'Panel de Control' : lineName}
                </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          
          {/* Main Home / Change Line Action - ONLY FOR ADMIN */}
          {userRole === 'ADMIN' && (
            <>
              <button
                onClick={() => {
                  onExitLine();
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className="w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-lg transition-all duration-200 group relative text-brand-200 hover:bg-brand-800 hover:text-white mb-2 border border-transparent hover:border-brand-700"
              >
                <Home className="mr-4 h-5 w-5 text-brand-400 group-hover:text-white transition-colors" />
                <span className="tracking-wide">Inicio / Cambiar Línea</span>
              </button>
              
              <div className="px-4 pb-2 mt-4 text-xs font-semibold text-brand-500 uppercase tracking-wider">
                Supervisión Global
              </div>
              
              <button
                onClick={() => {
                  onChangeView(ViewState.GLOBAL_REVIEW);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={`
                  w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-lg transition-all duration-200 group relative
                  ${currentView === ViewState.GLOBAL_REVIEW
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-900/20 translate-x-1' 
                    : 'text-brand-200 hover:bg-brand-800 hover:text-white'}
                `}
              >
                <Globe className={`mr-4 h-5 w-5 ${currentView === ViewState.GLOBAL_REVIEW ? 'text-white' : 'text-brand-400 group-hover:text-white'} transition-colors`} />
                <span className="tracking-wide">Revisión Global</span>
              </button>

              <button
                onClick={() => {
                  onChangeView(ViewState.GLOBAL_DASHBOARD);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={`
                  w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-lg transition-all duration-200 group relative
                  ${currentView === ViewState.GLOBAL_DASHBOARD
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-900/20 translate-x-1' 
                    : 'text-brand-200 hover:bg-brand-800 hover:text-white'}
                `}
              >
                <PieChart className={`mr-4 h-5 w-5 ${currentView === ViewState.GLOBAL_DASHBOARD ? 'text-white' : 'text-brand-400 group-hover:text-white'} transition-colors`} />
                <span className="tracking-wide">Dashboard Global</span>
              </button>

              <div className="my-4 border-t border-brand-800/50 mx-2"></div>
            </>
          )}

          {/* Line Specific Menu (Hide if in Global View to reduce clutter) */}
          {!isGlobalView && (
            <>
              <div className="px-4 pb-2 text-xs font-semibold text-brand-500 uppercase tracking-wider">
                Gestión de Línea
              </div>

              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChangeView(item.id);
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className={`
                      w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-lg transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-lg shadow-accent-900/20 translate-x-1' 
                        : 'text-brand-200 hover:bg-brand-800 hover:text-white'}
                    `}
                  >
                    <Icon className={`mr-4 h-5 w-5 ${isActive ? 'text-white' : 'text-brand-400 group-hover:text-white'} transition-colors`} />
                    <span className="tracking-wide">{item.label}</span>
                    {isActive && <ChevronLeft className="h-4 w-4 absolute right-3 opacity-50" />}
                  </button>
                );
              })}
            </>
          )}

          {/* Configuration - ONLY FOR ADMIN */}
          {userRole === 'ADMIN' && (
             <>
                <div className="my-4 border-t border-brand-800/50 mx-2"></div>
                <div className="px-4 pb-2 text-xs font-semibold text-brand-500 uppercase tracking-wider">
                    Sistema
                </div>
                <button
                    onClick={() => {
                    onChangeView(ViewState.CONFIGURATION);
                    if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className={`
                    w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-lg transition-all duration-200 group relative
                    ${currentView === ViewState.CONFIGURATION
                        ? 'bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-lg shadow-accent-900/20 translate-x-1' 
                        : 'text-brand-200 hover:bg-brand-800 hover:text-white'}
                    `}
                >
                    <Settings className={`mr-4 h-5 w-5 ${currentView === ViewState.CONFIGURATION ? 'text-white' : 'text-brand-400 group-hover:text-white'} transition-colors`} />
                    <span className="tracking-wide">Configuración</span>
                </button>
             </>
          )}

        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-brand-800 bg-brand-950/30">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-brand-300 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
          <div className="mt-2 text-[10px] text-brand-600 text-center">
            v1.3 | {userRole === 'ADMIN' ? 'Administrador' : 'Usuario'}
          </div>
        </div>
      </div>
    </>
  );
};