import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BellIcon, SearchIcon, LogOut, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDesigners } from '../../contexts/DesignersContext';
import { useTasks } from '../../contexts/TasksContext';
import DesignerAvatar from '../ui/DesignerAvatar';

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { updateDesigner } = useDesigners();
  const { tasks } = useTasks();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Task Assigned',
      message: 'You have been assigned a new design task.',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Task Status Update',
      message: 'Your task "Homepage Redesign" has been marked as completed.',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]);
  
  const getPageTitle = (): string => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/tasks':
        return 'My Tasks';
      case '/weekly':
        return 'Weekly Schedule';
      case '/team':
        return 'Team Management';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      case '/help':
        return 'Help & Support';
      default:
        return 'Designer Task Management';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateDesigner(currentUser.id, {
          profilePicture: base64String
        });
      };
      reader.readAsDataURL(file);
    }
    setShowProfileModal(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const searchResults = tasks.filter(task => {
    const searchLower = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchLower) ||
      (task.description?.toLowerCase().includes(searchLower)) ||
      (task.brief?.toLowerCase().includes(searchLower))
    );
  }).slice(0, 5); // Limit to 5 results

  const handleSearchResultClick = (taskId: string) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate('/tasks');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-4 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setShowSearchResults(searchQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="w-64 rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map(task => (
                      <button
                        key={task.id}
                        onClick={() => handleSearchResultClick(task.id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50"
                      >
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-gray-500 truncate">{task.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No tasks found
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
              onClick={handleNotificationClick}
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50`}
                      >
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 mt-2 block">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {currentUser && (
              <DesignerAvatar
                designerId={currentUser.id}
                onProfileClick={handleProfileClick}
              />
            )}
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Profile Picture</h3>
            <div className="space-y-4">
              <div className="flex justify-center">
                <DesignerAvatar
                  designerId={currentUser?.id || ''}
                  size="lg"
                />
              </div>
              <label className="btn btn-outline w-full flex items-center justify-center cursor-pointer">
                <Upload size={18} className="mr-2" />
                Choose Image
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              <button
                onClick={() => setShowProfileModal(false)}
                className="btn btn-outline w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;