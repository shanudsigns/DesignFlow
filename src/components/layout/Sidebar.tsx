import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Palette,
  Menu,
  X,
  ListTodo,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin } = useAuth();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const baseNavItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/tasks', name: 'Tasks', icon: <ListTodo size={20} /> },
    { path: '/weekly', name: 'Weekly View', icon: <CalendarClock size={20} /> },
  ];

  const adminNavItems = [
    { path: '/resources', name: 'Resources', icon: <Briefcase size={20} /> },
    { path: '/team', name: 'Team', icon: <Users size={20} /> },
    { path: '/reports', name: 'Reports', icon: <BarChart3 size={20} /> },
  ];

  const bottomNavItems = [
    { path: '/settings', name: 'Settings', icon: <Settings size={20} /> },
    { path: '/help', name: 'Help', icon: <HelpCircle size={20} /> },
  ];

  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  const navClasses = "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200";
  const activeClasses = "bg-primary-50 text-primary-700 font-medium";
  const inactiveClasses = "text-gray-700 hover:bg-gray-100";

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-white shadow-md text-gray-700" 
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:hidden`}>
        <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="relative flex flex-col bg-white w-72 h-full overflow-y-auto shadow-xl">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Palette className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-semibold text-gray-800">DesignFlow</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${navClasses} ${isActive ? activeClasses : inactiveClasses}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${navClasses} ${isActive ? activeClasses : inactiveClasses} mt-2`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 ${expanded ? 'w-64' : 'w-20'} transition-width duration-300 ease-in-out`}>
        <div className={`flex items-center ${expanded ? 'justify-between' : 'justify-center'} h-16 px-4 border-b border-gray-200`}>
          {expanded ? (
            <>
              <div className="flex items-center">
                <Palette className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-semibold text-gray-800">DesignFlow</span>
              </div>
              <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
                <Menu size={20} />
              </button>
            </>
          ) : (
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
              <Palette size={24} className="text-primary-600" />
            </button>
          )}
        </div>
        
        <nav className={`flex-1 p-4 ${expanded ? 'space-y-2' : 'flex flex-col items-center space-y-6'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                expanded
                  ? `${navClasses} ${isActive ? activeClasses : inactiveClasses}`
                  : `p-2 rounded-md ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`
              }
              title={!expanded ? item.name : undefined}
            >
              {item.icon}
              {expanded && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
        
        <div className={`p-4 border-t border-gray-200 ${expanded ? '' : 'flex flex-col items-center space-y-6'}`}>
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                expanded
                  ? `${navClasses} ${isActive ? activeClasses : inactiveClasses} mt-2`
                  : `p-2 rounded-md text-gray-700 hover:bg-gray-100 mt-2`
              }
              title={!expanded ? item.name : undefined}
            >
              {item.icon}
              {expanded && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;