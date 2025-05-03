import React from 'react';
import { format } from 'date-fns';
import { useNotifications } from '../../contexts/NotificationsContext';
import { Bell, Check, Trash2 } from 'lucide-react';

const NotificationsDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { notifications, markAsRead, clearNotification, markAllAsRead } = useNotifications();

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleClearNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    clearNotification(id);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={() => markAllAsRead()}
          className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
        >
          <Check size={14} className="mr-1" />
          Mark all as read
        </button>
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
              onClick={() => handleNotificationClick(notification.id)}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !notification.read ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h4>
                <button
                  onClick={(e) => handleClearNotification(e, notification.id)}
                  className="text-gray-400 hover:text-error-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <span className="text-xs text-gray-500 mt-2 block">
                {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsDropdown;