import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { Task } from '../../types';
import { formatTimeString } from '../../utils/time';
import StatusBadge from '../ui/StatusBadge';

type TaskListProps = {
  designerName: string;
  tasks: Task[];
  day: string;
  onClose: () => void;
};

const TaskList: React.FC<TaskListProps> = ({ designerName, tasks, day, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const downloadAsPNG = async () => {
    if (contentRef.current) {
      try {
        const dataUrl = await toPng(contentRef.current, {
          quality: 1.0,
          backgroundColor: 'white',
        });
        
        const link = document.createElement('a');
        link.download = `${designerName}-${day}-tasks.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error generating image:', err);
      }
    }
  };

  const downloadAsPDF = async () => {
    if (contentRef.current) {
      try {
        const dataUrl = await toPng(contentRef.current, {
          quality: 1.0,
          backgroundColor: 'white',
        });
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [800, 1100]
        });

        pdf.addImage(dataUrl, 'PNG', 0, 0, 800, 1100);
        pdf.save(`${designerName}-${day}-tasks.pdf`);
      } catch (err) {
        console.error('Error generating PDF:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
        <div className="p-6">
          <div ref={contentRef} className="bg-white p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Daily Task List</h2>
                <p className="text-gray-600 mt-1">
                  {designerName} - {day.charAt(0).toUpperCase() + day.slice(1)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Generated on {format(new Date(), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="h-16 w-16 flex items-center justify-center bg-primary-100 rounded-lg">
                <span className="text-2xl text-primary-600 font-bold">
                  {tasks.length}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {index + 1}. {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <StatusBadge status={task.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Time:</p>
                      <p className="font-medium">
                        {formatTimeString(task.startTime)} - {formatTimeString(task.endTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration:</p>
                      <p className="font-medium">{task.estimatedHours} hours</p>
                    </div>
                    {task.brief && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Brief:</p>
                        <p className="font-medium">{task.brief}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Tasks: {tasks.length}</span>
                <span>
                  Total Hours: {tasks.reduce((sum, task) => sum + task.estimatedHours, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="btn btn-outline"
            >
              Close
            </button>
            <button
              onClick={downloadAsPNG}
              className="btn btn-primary"
            >
              Download as PNG
            </button>
            <button
              onClick={downloadAsPDF}
              className="btn btn-primary"
            >
              Download as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;