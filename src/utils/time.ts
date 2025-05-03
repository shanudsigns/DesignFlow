import { Task } from '../types';
import { format, parse } from 'date-fns';

// Get the hour difference between two time strings (HH:MM format)
export const getHoursDifference = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  
  const start = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());
  
  const diffInMs = end.getTime() - start.getTime();
  const hours = diffInMs / (1000 * 60 * 60);
  
  return Math.max(0, hours);
};

// Format a time string (HH:MM) to a more readable format (e.g., "9:00 AM")
export const formatTimeString = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    const date = parse(timeString, 'HH:mm', new Date());
    return format(date, 'h:mm a');
  } catch (error) {
    return timeString;
  }
};

// Get available time slots for a specific day and designer
export const getAvailableTimeSlots = (
  tasks: Task[],
  designerId: string,
  day: string,
  currentTaskId?: string
): string[] => {
  // Generate all possible time slots from 9 AM to 6 PM
  const allTimeSlots: string[] = [];
  for (let hour = 9; hour <= 18; hour++) {
    const formattedHour = hour.toString().padStart(2, '0');
    allTimeSlots.push(`${formattedHour}:00`);
  }

  // Get tasks for the specified designer and day
  const designerTasks = tasks.filter(task => 
    task.designerId === designerId && 
    task.day === day &&
    task.id !== currentTaskId // Exclude current task when editing
  );

  // Mark occupied time slots
  const occupiedSlots = new Set<string>();
  designerTasks.forEach(task => {
    const startHour = parseInt(task.startTime.split(':')[0], 10);
    const endHour = parseInt(task.endTime.split(':')[0], 10);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      occupiedSlots.add(`${formattedHour}:00`);
    }
  });

  // Filter out occupied slots
  return allTimeSlots.filter(slot => !occupiedSlots.has(slot));
};

// Calculate work hours for each day
export const calculateWorkHours = (tasks: Task[]) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const;
  const maxHoursPerDay = 9; // Updated to 9 hours
  
  return days.reduce((acc, day) => {
    const dayTasks = tasks.filter(task => task.day === day);
    const hoursUsed = dayTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    
    return {
      ...acc,
      [day]: {
        used: hoursUsed,
        remaining: Math.max(0, maxHoursPerDay - hoursUsed),
      },
    };
  }, {} as Record<typeof days[number], { used: number; remaining: number }>);
};

// Calculate the percentage of hours used
export const calculateHoursPercentage = (hoursUsed: number, maxHours: number = 9): number => {
  return Math.min(100, Math.round((hoursUsed / maxHours) * 100));
};

// Check if two time ranges overlap
export const doTimeRangesOverlap = (
  startTime1: string,
  endTime1: string,
  startTime2: string,
  endTime2: string
): boolean => {
  const start1 = parse(startTime1, 'HH:mm', new Date()).getTime();
  const end1 = parse(endTime1, 'HH:mm', new Date()).getTime();
  const start2 = parse(startTime2, 'HH:mm', new Date()).getTime();
  const end2 = parse(endTime2, 'HH:mm', new Date()).getTime();
  
  return start1 < end2 && start2 < end1;
};