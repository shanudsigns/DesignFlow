import React, { useState, useMemo } from 'react';
import { Download, Filter, Calendar } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext';
import { useDesigners } from '../contexts/DesignersContext';
import StatusBadge from '../components/ui/StatusBadge';
import DesignerAvatar from '../components/ui/DesignerAvatar';
import { ReportFilters, Task, TaskStatus } from '../types';
import { calculateWorkHours } from '../utils/time';
import { format, subDays, subMonths, parseISO } from 'date-fns';

const Reports: React.FC = () => {
  const { tasks } = useTasks();
  const { designers } = useDesigners();
  const activeDesigners = designers.filter(d => d.active);
  
  const [filters, setFilters] = useState<ReportFilters>({
    designerId: undefined,
    timeRange: 'week',
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  
  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    // Filter by designer
    if (filters.designerId && filters.designerId !== 'all') {
      result = result.filter(task => task.designerId === filters.designerId);
    }
    
    // We don't actually have dates in our task model for this demo, but
    // we'll simulate filtering by date based on the createdAt timestamp
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;
    
    if (startDate && endDate) {
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      
      result = result.filter(task => {
        const taskDate = parseISO(task.createdAt);
        return taskDate >= startDate && taskDate <= endDate;
      });
    }
    
    return result;
  }, [tasks, filters]);
  
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'timeRange') {
      let startDate = filters.startDate;
      const today = new Date();
      
      switch (value) {
        case 'week':
          startDate = format(subDays(today, 7), 'yyyy-MM-dd');
          break;
        case 'month':
          startDate = format(subMonths(today, 1), 'yyyy-MM-dd');
          break;
        case 'custom':
          // Keep existing dates
          break;
      }
      
      setFilters({
        ...filters,
        timeRange: value as 'week' | 'month' | 'custom',
        startDate,
        endDate: format(today, 'yyyy-MM-dd'),
      });
    } else {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
  };
  
  // Calculate stats for the report
  const reportStats = useMemo(() => {
    // Group tasks by status
    const statusCounts: Record<TaskStatus, number> = {
      'todo': 0,
      'in-progress': 0,
      'review': 0,
      'completed': 0,
    };
    
    filteredTasks.forEach(task => {
      statusCounts[task.status]++;
    });
    
    // Calculate designer workload
    const designerWorkload: Record<string, { 
      name: string, 
      totalHours: number, 
      taskCount: number,
      completedCount: number
    }> = {};
    
    activeDesigners.forEach(designer => {
      const designerTasks = filteredTasks.filter(t => t.designerId === designer.id);
      const completedTasks = designerTasks.filter(t => t.status === 'completed');
      
      const totalHours = designerTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
      
      designerWorkload[designer.id] = {
        name: designer.name,
        totalHours,
        taskCount: designerTasks.length,
        completedCount: completedTasks.length,
      };
    });
    
    // Group by day
    const dayWorkload: Record<string, number> = {
      'sunday': 0,
      'monday': 0,
      'tuesday': 0,
      'wednesday': 0,
      'thursday': 0,
    };
    
    filteredTasks.forEach(task => {
      dayWorkload[task.day] += task.estimatedHours;
    });
    
    return {
      totalTasks: filteredTasks.length,
      totalHours: filteredTasks.reduce((sum, task) => sum + task.estimatedHours, 0),
      statusCounts,
      designerWorkload,
      dayWorkload,
    };
  }, [filteredTasks, activeDesigners]);
  
  // Generate CSV for download
  const generateCSV = () => {
    // Headers
    let csv = 'Task Title,Designer,Day,Hours,Status,Priority,Created At\n';
    
    // Data rows
    filteredTasks.forEach(task => {
      const designer = designers.find(d => d.id === task.designerId);
      const row = [
        `"${task.title.replace(/"/g, '""')}"`,
        `"${designer ? designer.name.replace(/"/g, '""') : 'Unknown'}"`,
        task.day,
        task.estimatedHours,
        task.status,
        task.priority,
        task.createdAt,
      ];
      csv += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `designer-tasks-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-gray-600">
          Generate and view reports on your design team's tasks and workload.
        </p>
      </div>
      
      {/* Filters */}
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-xl font-semibold">Filter Report</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="form-label">Designer</label>
            <select
              name="designerId"
              value={filters.designerId || 'all'}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="all">All Designers</option>
              {activeDesigners.map(designer => (
                <option key={designer.id} value={designer.id}>{designer.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Time Range</label>
            <select
              name="timeRange"
              value={filters.timeRange}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="form-input"
              disabled={filters.timeRange !== 'custom'}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="form-input"
              disabled={filters.timeRange !== 'custom'}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={generateCSV}
            className="btn btn-primary flex items-center"
            disabled={filteredTasks.length === 0}
          >
            <Download size={18} className="mr-1" /> Download Report
          </button>
        </div>
      </div>
      
      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-primary-100 mr-4">
            <Calendar size={22} className="text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Tasks</p>
            <h3 className="text-2xl font-bold">{reportStats.totalTasks}</h3>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-success-100 mr-4">
            <Calendar size={22} className="text-success-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Hours</p>
            <h3 className="text-2xl font-bold">{reportStats.totalHours}h</h3>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-accent-100 mr-4">
            <Calendar size={22} className="text-accent-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed Tasks</p>
            <h3 className="text-2xl font-bold">{reportStats.statusCounts['completed']}</h3>
          </div>
        </div>
      </div>
      
      {/* Task Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(reportStats.statusCounts).map(([status, count]) => {
              const total = reportStats.totalTasks;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              let barColor = 'bg-gray-500';
              switch (status) {
                case 'todo': barColor = 'bg-gray-500'; break;
                case 'in-progress': barColor = 'bg-primary-500'; break;
                case 'review': barColor = 'bg-warning-500'; break;
                case 'completed': barColor = 'bg-success-500'; break;
              }
              
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <StatusBadge status={status as TaskStatus} />
                    </div>
                    <span className="text-sm text-gray-600">{count} tasks ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Daily Distribution</h3>
          <div className="space-y-3">
            {Object.entries(reportStats.dayWorkload).map(([day, hours]) => {
              const maxHours = activeDesigners.length * 8;
              const percentage = Math.min(100, (hours / maxHours) * 100);
              
              return (
                <div key={day}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize">{day}</span>
                    <span className="text-sm text-gray-600">{hours} hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        percentage > 90 ? 'bg-error-500' : 
                        percentage > 75 ? 'bg-warning-500' : 
                        'bg-primary-500'
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
      
      {/* Designer Workload Table */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-4">Designer Workload</h3>
        {Object.keys(reportStats.designerWorkload).length === 0 ? (
          <p className="text-gray-500 text-center py-4">No data available for the selected filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designer
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Tasks
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed Tasks
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(reportStats.designerWorkload).map(([id, data]) => {
                  const completionRate = data.taskCount > 0 
                    ? Math.round((data.completedCount / data.taskCount) * 100) 
                    : 0;
                  
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <DesignerAvatar designerId={id} showName />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {data.taskCount}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {data.completedCount}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {data.totalHours}h
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                          <span className={`text-sm mr-2 ${
                            completionRate >= 75 ? 'text-success-600' :
                            completionRate >= 50 ? 'text-warning-600' :
                            'text-gray-600'
                          }`}>
                            {completionRate}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                completionRate >= 75 ? 'bg-success-500' :
                                completionRate >= 50 ? 'bg-warning-500' :
                                'bg-gray-500'
                              }`}
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Tasks List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Tasks {filteredTasks.length > 0 && `(${filteredTasks.length})`}</h3>
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tasks found for the selected filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <DesignerAvatar designerId={task.designerId} size="sm" showName />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {task.day}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {task.estimatedHours}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;