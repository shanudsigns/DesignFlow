import React from 'react';
import { Book } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Help & Support</h1>
        <p className="mt-1 text-gray-600">
          Find answers to common questions about using the platform.
        </p>
      </div>

      <div className="card mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-full bg-primary-100 p-2">
            <Book className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              How do I create a new task?
            </h3>
            <p className="text-gray-600">
              Click the "Add New Task" button on the dashboard or tasks page. Fill in the required information including title, description, and time allocation. Tasks can be assigned to specific days and time slots.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              How do I manage my weekly schedule?
            </h3>
            <p className="text-gray-600">
              Navigate to the Weekly View page to see your schedule. You can view tasks by day, manage time slots, and ensure your workload is balanced across the week.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              How do I track task progress?
            </h3>
            <p className="text-gray-600">
              Update task status as work progresses from "To Do" through "In Progress" to "Completed". Add comments to keep everyone informed about task progress.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              What are the different task statuses?
            </h3>
            <p className="text-gray-600">
              Tasks can be marked as "To Do", "In Progress", "In Review", "Completed", "Delayed", or "Blocked". Production managers can also set tasks to "In Production" when ready for final output.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              How does task archiving work?
            </h3>
            <p className="text-gray-600">
              When enabled by an admin, completed tasks are automatically archived after 30 days. This helps keep your active task list clean and focused on current work.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              What's the difference between designer and production manager roles?
            </h3>
            <p className="text-gray-600">
              Designers manage their daily tasks and schedules, while production managers oversee the final production process and can assign production dates to completed tasks.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              How do I manage notifications?
            </h3>
            <p className="text-gray-600">
              Click the bell icon in the top navigation to view notifications. Notifications are automatically marked as read when viewed and can be managed in Settings.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              How do working hours work?
            </h3>
            <p className="text-gray-600">
              The system operates on a schedule from Sunday to Thursday, with 9 working hours per day. Tasks can be scheduled between 9:00 AM and 6:00 PM each working day.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Can I customize my profile?
            </h3>
            <p className="text-gray-600">
              Yes, you can update your profile picture by clicking your avatar in the top navigation bar. Each team member is also assigned a unique color for easy identification.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              How do I view reports and analytics?
            </h3>
            <p className="text-gray-600">
              Admins can access the Reports page to view team performance metrics, task completion rates, and workload distribution. Reports can be filtered by date range and team member.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;