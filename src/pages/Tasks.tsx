import React, { useState } from 'react';
import { Filter, MessageSquare, Grid, LayoutList, Plus } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext';
import { useDesigners } from '../contexts/DesignersContext';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import StatusBadge from '../components/ui/StatusBadge';
import DesignerAvatar from '../components/ui/DesignerAvatar';
import { Task, TaskStatus } from '../types';
import { format } from 'date-fns';

type ViewMode = 'cards' | 'spreadsheet';

const Tasks: React.FC = () => {
  const { tasks, updateTask, deleteTask, addTask } = useTasks();
  const { designers, getDesignerById } = useDesigners();
  const { isAdmin } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [designerFilter, setDesignerFilter] = useState<string>('all');
  const [statusComment, setStatusComment] = useState('');
  const [commentTaskId, setCommentTaskId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const activeDesigners = designers.filter(d => d.active);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filter === 'all' || task.status === filter;
    const matchesDesigner = designerFilter === 'all' || task.designerId === designerFilter;
    const hideCompleted = viewMode === 'cards' && filter !== 'completed' && task.status === 'completed';
    
    return matchesStatus && matchesDesigner && !hideCompleted;
  });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (['delayed', 'blocked'].includes(newStatus)) {
      setCommentTaskId(taskId);
      setPendingStatus(newStatus);
    } else {
      updateTask(taskId, { status: newStatus });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (isAdmin && window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteTask(taskId);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentTaskId && statusComment.trim() && pendingStatus) {
      const task = tasks.find(t => t.id === commentTaskId);
      if (task) {
        const newComment = {
          id: Date.now().toString(),
          taskId: commentTaskId,
          userId: task.designerId,
          content: statusComment,
          createdAt: new Date().toISOString(),
        };

        updateTask(commentTaskId, {
          status: pendingStatus,
          comments: [...(task.comments || []), newComment],
        });

        setStatusComment('');
        setCommentTaskId(null);
        setPendingStatus(null);
      }
    }
  };

  const handleAssignToProduction = (taskId: string, date: string) => {
    updateTask(taskId, {
      assignedToProduction: true,
      productionDate: date,
      status: 'in-production'
    });
  };

  const handleCancelComment = () => {
    const task = tasks.find(t => t.id === commentTaskId);
    if (task) {
      const selectElement = document.querySelector(`select[data-task-id="${task.id}"]`) as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = task.status;
      }
    }
    setCommentTaskId(null);
    setPendingStatus(null);
    setStatusComment('');
  };

  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
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

  if (showTaskForm) {
    return (
      <TaskForm
        initialTask={editingTask}
        onSubmit={handleSubmitTask}
        onCancel={() => setShowTaskForm(false)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Tasks</h1>
            <p className="mt-1 text-gray-600">
              View and manage all tasks across your design team.
            </p>
          </div>
          <button
            onClick={handleAddTask}
            className="mt-4 md:mt-0 btn btn-primary flex items-center"
          >
            <Plus size={18} className="mr-1" /> Add New Task
          </button>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <span className="font-medium">Filters:</span>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as TaskStatus | 'all')}
              className="form-input py-1 px-3"
            >
              <option value="all">All Statuses</option>
              <option value="todo">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Done</option>
              <option value="in-production">In Production</option>
            </select>

            <select
              value={designerFilter}
              onChange={(e) => setDesignerFilter(e.target.value)}
              className="form-input py-1 px-3"
            >
              <option value="all">All Designers</option>
              {activeDesigners.map(designer => (
                <option key={designer.id} value={designer.id}>
                  {designer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md ${
                viewMode === 'cards'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Card View"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('spreadsheet')}
              className={`p-2 rounded-md ${
                viewMode === 'spreadsheet'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Spreadsheet View"
            >
              <LayoutList size={20} />
            </button>
          </div>
        </div>

        {/* Status Comment Modal */}
        {commentTaskId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={20} className="text-gray-500" />
                <h3 className="text-lg font-semibold">
                  Add Comment for {pendingStatus === 'blocked' ? 'Blocked' : 'Delayed'} Status
                </h3>
              </div>
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="form-input w-full mb-4"
                  rows={4}
                  placeholder={`Please explain why this task is ${pendingStatus === 'blocked' ? 'blocked' : 'delayed'}...`}
                  required
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelComment}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tasks Views */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="relative">
                <TaskCard
                  task={task}
                  onEdit={() => {}}
                  onDelete={handleDeleteTask}
                  onAssignToProduction={handleAssignToProduction}
                />
                <div className="mt-2">
                  <select
                    data-task-id={task.id}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    className="form-input w-full py-1"
                  >
                    <option value="todo">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="delayed">Delayed</option>
                    <option value="completed">Done</option>
                    <option value="in-production">In Production</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day/Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time/Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DesignerAvatar designerId={task.designerId} size="sm" showName />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          data-task-id={task.id}
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="form-input py-1 text-sm"
                        >
                          <option value="todo">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="blocked">Blocked</option>
                          <option value="delayed">Delayed</option>
                          <option value="completed">Done</option>
                          <option value="in-production">In Production</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge priority={task.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.assignedToProduction ? (
                          <span className="text-sm text-gray-900">
                            {format(new Date(task.productionDate!), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-900 capitalize">{task.day}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.assignedToProduction ? (
                          <span className="text-sm text-gray-900">Production</span>
                        ) : (
                          <span className="text-sm text-gray-900">
                            {task.startTime} - {task.endTime}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {format(new Date(task.createdAt), 'MMM d, yyyy')}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-error-600 hover:text-error-900"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No tasks found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;