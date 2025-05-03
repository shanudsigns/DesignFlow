import React, { useState } from 'react';
import { Clock, Edit2, Trash2, MessageSquare, Paperclip, Link, FileText, Download, Calendar } from 'lucide-react';
import { Task } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import DesignerAvatar from '../ui/DesignerAvatar';
import { formatTimeString } from '../../utils/time';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

type TaskCardProps = {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAddComment?: (taskId: string, comment: string) => void;
  onAddAttachment?: (taskId: string, file: File) => void;
  onAssignToProduction?: (taskId: string, date: string) => void;
};

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onAddComment,
  onAddAttachment,
  onAssignToProduction 
}) => {
  const { currentUser, isAdmin } = useAuth();
  const isProductionManager = currentUser?.role === 'production-manager';
  const [showComments, setShowComments] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [productionDate, setProductionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && onAddComment) {
      onAddComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAddAttachment) {
      onAddAttachment(task.id, file);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      onDelete(task.id);
    }
  };

  const handleAssignToProduction = () => {
    if (onAssignToProduction) {
      onAssignToProduction(task.id, productionDate);
      setShowProductionModal(false);
    }
  };

  return (
    <>
      <div className={`card hover:shadow-md transition-shadow duration-200 border-l-4 ${
        task.status === 'in-production' ? 'border-accent-500' :
        task.status === 'delayed' ? 'border-error-500 bg-error-50' :
        task.status === 'completed' ? 'border-success-500' :
        task.priority === 'urgent' ? 'border-error-500' :
        'border-gray-200'
      }`}>
        <div className="flex justify-between items-start">
          <h3 className="text-gray-900 font-medium text-lg mb-2">{task.title}</h3>
          <div className="flex space-x-1">
            <button 
              onClick={() => onEdit(task.id)}
              className="p-1 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded"
            >
              <Edit2 size={16} />
            </button>
            {(isAdmin || isProductionManager) && (
              <button 
                onClick={handleDelete}
                className="p-1 text-gray-500 hover:text-error-600 hover:bg-gray-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-1 mb-3">
          <StatusBadge status={task.status} />
          <StatusBadge priority={task.priority} />
          {task.dependencies?.length > 0 && (
            <div className="flex items-center text-xs text-gray-600">
              <Link size={12} className="mr-1" />
              {task.dependencies.length} dependencies
            </div>
          )}
        </div>
        
        {task.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
        )}

        {task.brief && (
          <div className="mb-4">
            <button
              onClick={() => setShowBrief(!showBrief)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <FileText size={14} className="mr-1" />
              {showBrief ? 'Hide Brief' : 'View Brief'}
            </button>
            {showBrief && (
              <div className="mt-2 text-sm bg-gray-50 rounded-lg p-3">
                <p className="text-gray-700 whitespace-pre-wrap">{task.brief}</p>
                {task.briefAttachments && task.briefAttachments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Paperclip size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-600">Brief Attachments</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {task.briefAttachments.map(attachment => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
                        >
                          <FileText size={12} />
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {task.assetLinks && task.assetLinks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Download size={14} className="text-gray-500" />
              <span className="text-sm text-gray-600">Assets</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.assetLinks.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
                >
                  Asset {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {task.attachments?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={14} className="text-gray-500" />
              <span className="text-sm text-gray-600">Attachments</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.attachments.map(attachment => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
                >
                  {attachment.name}
                </a>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <MessageSquare size={14} className="mr-1" />
            {task.comments?.length || 0} comments
          </button>
          
          {showComments && (
            <div className="mt-3 space-y-3">
              {task.comments?.map(comment => (
                <div key={comment.id} className="text-sm bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <DesignerAvatar designerId={comment.userId} size="sm" />
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
              
              <form onSubmit={handleAddComment} className="mt-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="form-input text-sm py-1 px-2 w-full"
                />
              </form>
            </div>
          )}
        </div>
        
        {isProductionManager ? (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Production Date:</p>
            <p className="font-medium">{format(new Date(task.productionDate!), 'MMMM d, yyyy')}</p>
          </div>
        ) : (
          <div className="mt-4">
            {task.status === 'completed' && !task.assignedToProduction && (
              <button
                onClick={() => setShowProductionModal(true)}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <Calendar size={16} className="mr-2" />
                Assign to Production
              </button>
            )}
            {!task.assignedToProduction && (
              <div className="flex items-center justify-between text-sm">
                <div>
                  <Clock size={14} className="inline mr-1 text-gray-500" />
                  <span className="text-gray-600">
                    {formatTimeString(task.startTime!)} - {formatTimeString(task.endTime!)}
                  </span>
                </div>
                <span className="text-gray-600">{task.estimatedHours}h</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Production Assignment Modal */}
      {showProductionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Assign to Production</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Production Date
                </label>
                <input
                  type="date"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="form-input w-full"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowProductionModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToProduction}
                  className="btn btn-primary"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;