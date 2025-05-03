import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Link, FileText, Download, X, Upload, File } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskAttachment } from '../../types';
import { useDesigners } from '../../contexts/DesignersContext';
import { useTasks } from '../../contexts/TasksContext';
import { useAuth } from '../../contexts/AuthContext';
import { getAvailableTimeSlots } from '../../utils/time';

type TaskFormProps = {
  initialTask?: Task;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
};

const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSubmit, onCancel }) => {
  const { designers } = useDesigners();
  const { tasks } = useTasks();
  const { currentUser, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isProductionManager = currentUser?.role === 'production-manager';
  const activeDesigners = designers.filter(d => d.active);
  
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt'>>({
    title: '',
    designerId: currentUser?.id || '',
    status: 'todo',
    priority: 'medium',
    description: '',
    brief: '',
    briefAttachments: [],
    assetLinks: [],
    comments: [],
    attachments: [],
    dependencies: [],
    completedAt: undefined,
    ...(isProductionManager ? {
      productionDate: new Date().toISOString().split('T')[0],
      assignedToProduction: true,
    } : {
      estimatedHours: 1,
      day: 'monday',
      startTime: '09:00',
      endTime: '10:00',
    }),
  });

  const [newAssetLink, setNewAssetLink] = useState('');

  const availableTimeSlots = useMemo(() => {
    if (!formData.designerId || !formData.day || isProductionManager) return [];
    return getAvailableTimeSlots(
      tasks,
      formData.designerId,
      formData.day,
      initialTask?.id
    );
  }, [formData.designerId, formData.day, tasks, initialTask?.id, isProductionManager]);
  
  useEffect(() => {
    if (initialTask) {
      setFormData({
        ...initialTask,
        dependencies: [],
        comments: initialTask.comments || [],
        attachments: initialTask.attachments || [],
        assetLinks: initialTask.assetLinks || [],
        briefAttachments: initialTask.briefAttachments || [],
      });
    }
  }, [initialTask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (!isProductionManager) {
      if (name === 'estimatedHours') {
        const hours = parseFloat(value);
        setFormData({
          ...formData,
          [name]: Math.max(0.5, Math.min(8, hours)),
        });
      } else if (name === 'startTime') {
        const startHour = parseInt(value.split(':')[0], 10);
        const endHour = Math.min(17, startHour + Math.ceil(formData.estimatedHours));
        const endTime = `${endHour.toString().padStart(2, '0')}:00`;
        
        setFormData({
          ...formData,
          startTime: value,
          endTime,
        });
      } else if (name === 'designerId' || name === 'day') {
        const newStartTime = availableTimeSlots[0] || '09:00';
        const startHour = parseInt(newStartTime.split(':')[0], 10);
        const endHour = Math.min(17, startHour + Math.ceil(formData.estimatedHours));
        const endTime = `${endHour.toString().padStart(2, '0')}:00`;

        setFormData({
          ...formData,
          [name]: value,
          startTime: newStartTime,
          endTime,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAddAssetLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssetLink.trim()) {
      setFormData({
        ...formData,
        assetLinks: [...(formData.assetLinks || []), newAssetLink.trim()]
      });
      setNewAssetLink('');
    }
  };

  const handleRemoveAssetLink = (index: number) => {
    setFormData({
      ...formData,
      assetLinks: formData.assetLinks?.filter((_, i) => i !== index)
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: TaskAttachment[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      createdAt: new Date().toISOString()
    }));

    setFormData({
      ...formData,
      briefAttachments: [...(formData.briefAttachments || []), ...newAttachments]
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setFormData({
      ...formData,
      briefAttachments: formData.briefAttachments?.filter(att => att.id !== attachmentId)
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const noTimeSlotsAvailable = !isProductionManager && availableTimeSlots.length === 0;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {initialTask ? 'Edit Task' : 'Create New Task'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group md:col-span-2">
            <label htmlFor="title" className="form-label">Task Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter task title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="designerId" className="form-label">Assigned Designer*</label>
            {isAdmin ? (
              <select
                id="designerId"
                name="designerId"
                value={formData.designerId}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select designer</option>
                {activeDesigners.map((designer) => (
                  <option key={designer.id} value={designer.id}>
                    {designer.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={currentUser?.name || ''}
                readOnly
                className="form-input bg-gray-50"
              />
            )}
          </div>
          
          {isProductionManager ? (
            <div className="form-group">
              <label htmlFor="productionDate" className="form-label">Production Date*</label>
              <input
                type="date"
                id="productionDate"
                name="productionDate"
                value={formData.productionDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="form-input"
              />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="estimatedHours" className="form-label">Estimated Hours*</label>
                <input
                  type="number"
                  id="estimatedHours"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  min="0.5"
                  max="8"
                  step="0.5"
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="day" className="form-label">Day*</label>
                <select
                  id="day"
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="sunday">Sunday</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="startTime" className="form-label">Start Time*</label>
                <select
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={noTimeSlotsAvailable}
                >
                  {noTimeSlotsAvailable ? (
                    <option value="">No available time slots</option>
                  ) : (
                    availableTimeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))
                  )}
                </select>
                {noTimeSlotsAvailable && (
                  <p className="text-sm text-error-600 mt-1">
                    No available time slots for this day. Please select a different day or designer.
                  </p>
                )}
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="status" className="form-label">Status*</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
              <option value="blocked">Blocked</option>
              {isProductionManager && <option value="in-production">In Production</option>}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="priority" className="form-label">Priority*</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div className="form-group md:col-span-2">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="form-input"
              placeholder="Enter task description (optional)"
            ></textarea>
          </div>

          <div className="form-group md:col-span-2">
            <label htmlFor="brief" className="form-label flex items-center gap-2">
              <FileText size={16} />
              Brief
            </label>
            <textarea
              id="brief"
              name="brief"
              value={formData.brief}
              onChange={handleChange}
              rows={4}
              className="form-input mb-4"
              placeholder="Enter project brief details..."
            ></textarea>

            {/* Brief Attachments */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Attachments</span>
              </div>

              {/* Existing Attachments */}
              {formData.briefAttachments && formData.briefAttachments.length > 0 && (
                <div className="space-y-2">
                  {formData.briefAttachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <File size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700">{attachment.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-gray-500 hover:text-error-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File Input */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  id="briefAttachments"
                />
                <label
                  htmlFor="briefAttachments"
                  className="btn btn-outline flex items-center gap-2 cursor-pointer"
                >
                  <Upload size={16} />
                  Add Files
                </label>
                <span className="text-sm text-gray-500">
                  Supported: JPG, PDF, DOC, XLS
                </span>
              </div>
            </div>
          </div>

          <div className="form-group md:col-span-2">
            <label className="form-label flex items-center gap-2">
              <Download size={16} />
              Asset Links
            </label>
            <div className="space-y-2">
              {formData.assetLinks?.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link}
                    readOnly
                    className="form-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAssetLink(index)}
                    className="text-error-600 hover:text-error-900"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <form onSubmit={handleAddAssetLink} className="flex gap-2">
                <input
                  type="text"
                  value={newAssetLink}
                  onChange={(e) => setNewAssetLink(e.target.value)}
                  placeholder="Add asset link..."
                  className="form-input flex-1"
                />
                <button
                  type="submit"
                  className="btn btn-outline py-2"
                  disabled={!newAssetLink.trim()}
                >
                  <Plus size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!formData.title || !formData.designerId || (!isProductionManager && noTimeSlotsAvailable)}
          >
            {initialTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;