import React, { useState } from 'react';
import { Plus, Filter, BarChart, Calendar } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext';
import { useDesigners } from '../contexts/DesignersContext';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import StatusBadge from '../components/ui/StatusBadge';
import { Task, TaskStatus } from '../types';
import { calculateWorkHours, calculateHoursPercentage } from '../utils/time';

const Dashboard: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { designers } = useDesigners();
  const { currentUser, isAdmin } = useAuth();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  
  const isProductionManager = currentUser?.role === 'production-manager';
  const relevantDesigners = isAdmin 
    ? designers.filter(d => d.active)
    : designers.filter(d => d.id === currentUser?.id);
  
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

  const filteredTasks = tasks.filter((task) => filter === 'all' || task.status === filter);
  
  // Calculate status counts
  const statusCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProduction: tasks.filter(t => t.status === 'in-production').length,
  };

  // Calculate designer workload if not production manager
  const designerWorkHours = !isProductionManager && relevantDesigners.map(designer => {
    const designerTasks = tasks.filter(task => task.designerId === designer.id);
    const workHours = calculateWorkHours(designerTasks);
    const totalTasksCompleted = designerTasks.filter(task => task.status === 'completed').length;
    
    return {
      designer,
      workHours,
      tasksCount: designerTasks.length,
      tasksCompleted: totalTasksCompleted,
    };
  });
  
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
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">
                  {isProductionManager ? "Production Dashboard" : isAdmin ? "Designer Task Management" : "My Dashboard"}
                </h1>
                <p className="mt-1 text-gray-600">
                  {isProductionManager 
                    ? "Manage production tasks and schedules."
                    : isAdmin 
                    ? "Manage your design team's tasks and schedules."
                    : "View and manage your tasks and schedule."}
                </p>
              </div>
              <button
                onClick={handleAddTask}
                className="mt-4 md:mt-0 btn btn-primary flex items-center"
              >
                <Plus size={18} className="mr-1" /> Add New Task
              </button>
            </div>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card bg-white p-5 flex items-center">
                <div className="rounded-full bg-primary-100 p-3 mr-4">
                  <Filter size={24} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <h3 className="text-2xl font-bold text-gray-800">{tasks.length}</h3>
                </div>
              </div>
              
              <div className="card bg-white p-5 flex items-center">
                <div className="rounded-full bg-success-100 p-3 mr-4">
                  <Calendar size={24} className="text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <h3 className="text-2xl font-bold text-gray-800">{statusCounts.completed}</h3>
                </div>
              </div>
              
              {isProductionManager ? (
                <div className="card bg-white p-5 flex items-center">
                  <div className="rounded-full bg-accent-100 p-3 mr-4">
                    <Calendar size={24} className="text-accent-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">In Production</p>
                    <h3 className="text-2xl font-bold text-gray-800">{statusCounts.inProduction}</h3>
                  </div>
                </div>
              ) : (
                <div className="card bg-white p-5 flex items-center">
                  <div className="rounded-full bg-warning-100 p-3 mr-4">
                    <BarChart size={24} className="text-warning-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <h3 className="text-2xl font-bold text-gray-800">{statusCounts.inProgress}</h3>
                  </div>
                </div>
              )}
              
              {isAdmin && !isProductionManager && (
                <div className="card bg-white p-5 flex items-center">
                  <div className="rounded-full bg-accent-100 p-3 mr-4">
                    <Calendar size={24} className="text-accent-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Designers</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {designers.filter(d => d.active).length}
                    </h3>
                  </div>
                </div>
              )}
            </div>

            {/* Workload Section - Only show for non-production managers */}
            {!isProductionManager && designerWorkHours && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  {isAdmin ? "Team Workload" : "My Workload"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {designerWorkHours.map(({ designer, workHours }) => {
                    const totalUsedHours = Object.values(workHours).reduce(
                      (sum, day) => sum + day.used,
                      0
                    );
                    const maxWeeklyHours = 9 * 5; // 9 hours per day, 5 days per week
                    const usedPercentage = (totalUsedHours / maxWeeklyHours) * 100;
                    
                    return (
                      <div key={designer.id} className="card">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div 
                              className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white"
                              style={{ backgroundColor: designer.color }}
                            >
                              {designer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <h3 className="font-medium text-gray-900">{designer.name}</h3>
                              <p className="text-sm text-gray-500">
                                {totalUsedHours} of {maxWeeklyHours} hours assigned
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {Object.entries(workHours).map(([day, hours]) => (
                            <div key={day} className="flex items-center">
                              <div className="w-24 text-sm font-medium capitalize">{day}</div>
                              <div className="flex-1">
                                <div className="h-2.5 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-2.5 rounded-full"
                                    style={{
                                      width: `${calculateHoursPercentage(hours.used)}%`,
                                      backgroundColor: hours.used > 9 ? '#ef4444' : designer.color
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="w-16 text-right text-sm">
                                {hours.used}/{9}h
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
              
            {/* Tasks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Tasks</h2>
                <div className="flex space-x-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as TaskStatus | 'all')}
                    className="form-input py-1 px-3 text-sm"
                  >
                    <option value="all">All Tasks</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="completed">Completed</option>
                    {isProductionManager && <option value="in-production">In Production</option>}
                  </select>
                </div>
              </div>
              
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 card">
                  <p className="text-gray-500 mb-4">No tasks found. Start by adding a new task.</p>
                  <button onClick={handleAddTask} className="btn btn-primary inline-flex items-center">
                    <Plus size={18} className="mr-1" /> Add New Task
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.slice(0, 6).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;