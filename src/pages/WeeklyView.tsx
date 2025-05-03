import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext';
import { useDesigners } from '../contexts/DesignersContext';
import { useAuth } from '../contexts/AuthContext';
import TaskForm from '../components/tasks/TaskForm';
import TaskList from '../components/tasks/TaskList';
import DesignerAvatar from '../components/ui/DesignerAvatar';
import StatusBadge from '../components/ui/StatusBadge';
import { Task } from '../types';
import { formatTimeString, calculateWorkHours } from '../utils/time';

type TaskListModalState = {
  isOpen: boolean;
  designerId: string;
  day: string;
};

const WeeklyView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, getTasksByDesigner } = useTasks();
  const { designers } = useDesigners();
  const { currentUser, isAdmin } = useAuth();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [selectedDesignerId, setSelectedDesignerId] = useState<string | 'all'>(currentUser?.id || 'all');
  const [taskListModal, setTaskListModal] = useState<TaskListModalState>({
    isOpen: false,
    designerId: '',
    day: '',
  });
  
  const activeDesigners = isAdmin 
    ? designers.filter(d => d.active)
    : designers.filter(d => d.id === currentUser?.id);
  
  const filteredTasks = useMemo(() => {
    if (!isAdmin) {
      return tasks.filter(task => task.designerId === currentUser?.id);
    }
    return selectedDesignerId === 'all'
      ? tasks
      : tasks.filter(task => task.designerId === selectedDesignerId);
  }, [tasks, selectedDesignerId, isAdmin, currentUser]);
  
  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };
  
  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setShowTaskForm(true);
    }
  };
  
  const handleSubmitTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setShowTaskForm(false);
    setEditingTask(undefined);
  };
  
  const handleDeleteTask = (taskId: string) => {
    if (isAdmin && window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteTask(taskId);
    }
  };

  const handleDownloadTaskList = (designerId: string, day: string) => {
    setTaskListModal({
      isOpen: true,
      designerId,
      day,
    });
  };
  
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const;
  const workHoursByDesigner = new Map();
  
  activeDesigners.forEach(designer => {
    const designerTasks = getTasksByDesigner(designer.id);
    workHoursByDesigner.set(designer.id, calculateWorkHours(designerTasks));
  });

  const getDesignerDayTasks = (designerId: string, day: string) => {
    return tasks.filter(task => 
      task.designerId === designerId && 
      task.day === day
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      {showTaskForm ? (
        <TaskForm
          initialTask={editingTask}
          onSubmit={handleSubmitTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Weekly Schedule</h1>
              <p className="mt-1 text-gray-600">
                {isAdmin 
                  ? "View and manage your team's weekly schedule from Sunday to Thursday."
                  : "View and manage your weekly schedule from Sunday to Thursday."}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              {isAdmin && (
                <select
                  value={selectedDesignerId}
                  onChange={(e) => setSelectedDesignerId(e.target.value)}
                  className="form-input py-2 px-4"
                >
                  <option value="all">All Designers</option>
                  {activeDesigners.map((designer) => (
                    <option key={designer.id} value={designer.id}>
                      {designer.name}
                    </option>
                  ))}
                </select>
              )}
              
              <button
                onClick={handleAddTask}
                className="btn btn-primary flex items-center justify-center"
              >
                <Plus size={18} className="mr-1" /> Add New Task
              </button>
            </div>
          </div>
          
          {/* Weekly Calendar View */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-6 border-b">
              <div className="px-4 py-3 bg-gray-50 font-medium text-gray-500 border-r">Designer</div>
              {weekdays.map((day) => (
                <div key={day} className="px-4 py-3 bg-gray-50 font-medium text-gray-500 capitalize border-r">
                  {day}
                </div>
              ))}
            </div>
            
            {activeDesigners.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No active designers. Add designers in the Team Management section.
              </div>
            ) : (
              activeDesigners.map((designer) => {
                const designerWorkHours = workHoursByDesigner.get(designer.id) || {};
                return (
                  <div key={designer.id} className="grid grid-cols-6 border-b last:border-b-0">
                    <div className="px-4 py-4 border-r flex items-center">
                      <DesignerAvatar designerId={designer.id} showName />
                    </div>
                    
                    {weekdays.map((day) => {
                      const dayTasks = filteredTasks.filter(
                        task => task.designerId === designer.id && task.day === day
                      );
                      const dayHours = designerWorkHours[day] || { used: 0, remaining: 9 };
                      
                      return (
                        <div key={day} className="px-4 py-4 border-r relative">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">
                              {dayHours.used} of 9 hours
                            </span>
                            <button
                              onClick={() => handleDownloadTaskList(designer.id, day)}
                              className="text-gray-500 hover:text-primary-600"
                              title="Download task list"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                          
                          <div className="h-2 bg-gray-100 rounded-full mb-3">
                            <div 
                              className={`h-2 rounded-full ${dayHours.used > 9 ? 'bg-error-500' : 'bg-primary-500'}`} 
                              style={{ width: `${Math.min(100, (dayHours.used / 9) * 100)}%` }}
                            ></div>
                          </div>
                          
                          <div className="space-y-2">
                            {dayTasks.length === 0 ? (
                              <div className="text-xs text-gray-400 italic">No tasks</div>
                            ) : (
                              dayTasks.map((task) => (
                                <div 
                                  key={task.id} 
                                  className="text-xs p-2 rounded border cursor-pointer transition-colors hover:bg-gray-50 relative group"
                                  onClick={() => handleEditTask(task.id)}
                                >
                                  <div className="font-medium text-gray-700 mb-1">{task.title}</div>
                                  <div className="flex items-center justify-between">
                                    <div className="text-gray-500">
                                      {formatTimeString(task.startTime)} - {formatTimeString(task.endTime)}
                                    </div>
                                    <StatusBadge status={task.status} />
                                  </div>
                                  {isAdmin && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                      }}
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-error-600 hover:bg-gray-100 rounded"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
          
          {activeDesigners.length > 0 && (
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="card w-full md:w-1/2">
                <h2 className="text-xl font-semibold mb-4">Hours Overview</h2>
                <div className="space-y-4">
                  {activeDesigners.map((designer) => {
                    const designerWorkHours = workHoursByDesigner.get(designer.id) || {};
                    const totalUsedHours = Object.values(designerWorkHours).reduce(
                      (sum: number, day: any) => sum + day.used,
                      0
                    );
                    const totalHours = 9 * 5; // 9 hours per day, 5 days
                    const totalPercentage = Math.min(100, (totalUsedHours / totalHours) * 100);
                    
                    return (
                      <div key={designer.id}>
                        <div className="flex items-center justify-between mb-2">
                          <DesignerAvatar designerId={designer.id} size="sm" showName />
                          <span className="text-sm font-medium">
                            {totalUsedHours} / {totalHours} hours ({Math.round(totalPercentage)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${totalPercentage}%`,
                              backgroundColor: designer.color
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="card w-full md:w-1/2">
                <h2 className="text-xl font-semibold mb-4">Daily Distribution</h2>
                <div className="space-y-4">
                  {weekdays.map(day => {
                    const dayTasks = filteredTasks.filter(task => task.day === day);
                    const totalDayHours = dayTasks.reduce(
                      (sum, task) => sum + task.estimatedHours,
                      0
                    );
                    const totalDesigners = activeDesigners.length;
                    const maxDayHours = totalDesigners * 9;
                    const percentage = Math.min(100, (totalDayHours / maxDayHours) * 100);
                    
                    return (
                      <div key={day}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{day}</span>
                          <span className="text-sm">
                            {totalDayHours} / {maxDayHours} hours ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage > 90 ? 'bg-error-500' : percentage > 75 ? 'bg-warning-500' : 'bg-success-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Task List Modal */}
      {taskListModal.isOpen && (
        <TaskList
          designerName={designers.find(d => d.id === taskListModal.designerId)?.name || ''}
          tasks={getDesignerDayTasks(taskListModal.designerId, taskListModal.day)}
          day={taskListModal.day}
          onClose={() => setTaskListModal({ isOpen: false, designerId: '', day: '' })}
        />
      )}
    </div>
  );
};

export default WeeklyView;