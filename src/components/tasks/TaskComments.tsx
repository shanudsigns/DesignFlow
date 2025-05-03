import React, { useState } from 'react';
import { format } from 'date-fns';
import { TaskComment } from '../../types';
import DesignerAvatar from '../ui/DesignerAvatar';

type TaskCommentsProps = {
  comments: TaskComment[];
  onAddComment: (content: string) => void;
};

const TaskComments: React.FC<TaskCommentsProps> = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DesignerAvatar designerId={comment.userId} size="sm" showName />
            <span className="text-sm text-gray-500">
              {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
            </span>
          </div>
          <p className="text-gray-700">{comment.content}</p>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="form-input w-full"
          rows={3}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="btn btn-primary"
          >
            Add Comment
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskComments;