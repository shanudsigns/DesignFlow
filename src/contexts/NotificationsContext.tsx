import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationType, Task } from '../types';
import { useAuth } from './AuthContext';

type NotificationsContextType = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  getTaskNotification: (task: Task, type: NotificationType) => Omit<Notification, 'id' | 'createdAt'>;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(`notifications_${currentUser?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(notifications));
    }
  }, [notifications, currentUser]);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTaskNotification = (task: Task, type: NotificationType): Omit<Notification, 'id' | 'createdAt'> => {
    const baseNotification = {
      taskId: task.id,
      userId: currentUser?.id || '',
      read: false,
    };

    switch (type) {
      case 'task-assigned':
        return {
          ...baseNotification,
          type,
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${task.title}`,
        };
      case 'task-completed':
        return {
          ...baseNotification,
          type,
          title: 'Task Completed',
          message: `Task "${task.title}" has been marked as completed`,
        };
      case 'task-delayed':
        return {
          ...baseNotification,
          type,
          title: 'Task Delayed',
          message: `Task "${task.title}" has been marked as delayed`,
        };
      case 'task-blocked':
        return {
          ...baseNotification,
          type,
          title: 'Task Blocked',
          message: `Task "${task.title}" has been marked as blocked`,
        };
      case 'task-in-production':
        return {
          ...baseNotification,
          type,
          title: 'Task In Production',
          message: `Task "${task.title}" has been moved to production`,
        };
      case 'task-comment':
        return {
          ...baseNotification,
          type,
          title: 'New Comment',
          message: `A new comment has been added to task "${task.title}"`,
        };
      case 'task-status-changed':
        return {
          ...baseNotification,
          type,
          title: 'Task Status Updated',
          message: `Status of task "${task.title}" has been updated to ${task.status}`,
        };
      default:
        return {
          ...baseNotification,
          type: 'task-status-changed',
          title: 'Task Updated',
          message: `Task "${task.title}" has been updated`,
        };
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        getTaskNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};