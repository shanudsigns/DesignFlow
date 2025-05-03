import React from 'react';
import { TaskStatus, TaskPriority } from '../../types';

type StatusBadgeProps = {
  status?: TaskStatus;
  priority?: TaskPriority;
  className?: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, priority, className = '' }) => {
  // Status styling
  if (status) {
    const statusStyles = {
      'todo': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-primary-100 text-primary-800',
      'review': 'bg-warning-100 text-warning-800',
      'completed': 'bg-success-100 text-success-800',
      'delayed': 'bg-error-100 text-error-800',
    };
    
    const statusLabels = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'review': 'In Review',
      'completed': 'Completed',
      'delayed': 'Delayed',
    };
    
    return (
      <span 
        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusStyles[status]} ${className}`}
      >
        {statusLabels[status]}
      </span>
    );
  }
  
  // Priority styling
  if (priority) {
    const priorityStyles = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-warning-100 text-warning-800',
      'urgent': 'bg-error-100 text-error-800',
    };
    
    const priorityLabels = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent',
    };
    
    return (
      <span 
        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${priorityStyles[priority]} ${className}`}
      >
        {priorityLabels[priority]}
      </span>
    );
  }
  
  return null;
};

export default StatusBadge;