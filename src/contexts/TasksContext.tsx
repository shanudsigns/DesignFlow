import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Task, TaskStatus, TaskPriority } from '../types';
import { differenceInDays } from 'date-fns';

type TasksContextType = {
  tasks: Task[];
  archivedTasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByDesigner: (designerId: string) => Task[];
  getTasksByDay: (day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday') => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  visibleTasks: Task[];
  archiveOldTasks: () => void;
  isArchivingEnabled: boolean;
  setIsArchivingEnabled: (enabled: boolean) => void;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Sample initial tasks
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Website Redesign for Client A',
    designerId: '1',
    estimatedHours: 4,
    day: 'monday',
    startTime: '09:00',
    endTime: '13:00',
    status: 'in-progress',
    priority: 'high',
    description: 'Redesign the homepage and product pages for Client A',
    createdAt: new Date().toISOString(),
    comments: [],
    attachments: [],
    dependencies: [],
  },
  {
    id: '2',
    title: 'Logo Design for Client B',
    designerId: '2',
    estimatedHours: 3,
    day: 'tuesday',
    startTime: '10:00',
    endTime: '13:00',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    comments: [],
    attachments: [],
    dependencies: [],
  },
  {
    id: '3',
    title: 'Mobile App Mockups',
    designerId: '3',
    estimatedHours: 6,
    day: 'wednesday',
    startTime: '09:00',
    endTime: '15:00',
    status: 'review',
    priority: 'urgent',
    createdAt: new Date().toISOString(),
    comments: [],
    attachments: [],
    dependencies: [],
  },
];

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });
  const [archivedTasks, setArchivedTasks] = useState<Task[]>(() => {
    const savedArchivedTasks = localStorage.getItem('archivedTasks');
    return savedArchivedTasks ? JSON.parse(savedArchivedTasks) : [];
  });
  const [isArchivingEnabled, setIsArchivingEnabled] = useState(() => {
    const savedSetting = localStorage.getItem('isArchivingEnabled');
    return savedSetting ? JSON.parse(savedSetting) : false;
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('archivedTasks', JSON.stringify(archivedTasks));
  }, [archivedTasks]);

  useEffect(() => {
    localStorage.setItem('isArchivingEnabled', JSON.stringify(isArchivingEnabled));
  }, [isArchivingEnabled]);

  // Archive completed tasks that are older than 30 days
  const archiveOldTasks = () => {
    if (!isArchivingEnabled) return;

    const now = new Date();
    const [tasksToKeep, tasksToArchive] = tasks.reduce<[Task[], Task[]]>(
      ([keep, archive], task) => {
        if (
          task.status === 'completed' &&
          differenceInDays(now, new Date(task.createdAt)) > 30
        ) {
          return [keep, [...archive, task]];
        }
        return [[...keep, task], archive];
      },
      [[], []]
    );

    if (tasksToArchive.length > 0) {
      setTasks(tasksToKeep);
      setArchivedTasks(prev => [...prev, ...tasksToArchive]);
    }
  };

  // Run archiving check when enabled
  useEffect(() => {
    if (isArchivingEnabled) {
      archiveOldTasks();
      // Set up daily check for archiving
      const interval = setInterval(archiveOldTasks, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isArchivingEnabled]);

  // Filter tasks based on user role
  const visibleTasks = isAdmin 
    ? tasks 
    : tasks.filter(task => task.designerId === currentUser?.id);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const getTasksByDesigner = (designerId: string) => {
    return tasks.filter((task) => task.designerId === designerId);
  };

  const getTasksByDay = (day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday') => {
    return visibleTasks.filter((task) => task.day === day);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return visibleTasks.filter((task) => task.status === status);
  };

  const getTasksByPriority = (priority: TaskPriority) => {
    return visibleTasks.filter((task) => task.priority === priority);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks: visibleTasks,
        archivedTasks,
        addTask,
        updateTask,
        deleteTask,
        getTasksByDesigner,
        getTasksByDay,
        getTasksByStatus,
        getTasksByPriority,
        visibleTasks,
        archiveOldTasks,
        isArchivingEnabled,
        setIsArchivingEnabled,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};