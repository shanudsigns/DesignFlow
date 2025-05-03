import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Shield, Palette, Lock } from 'lucide-react';
import { useDesigners } from '../contexts/DesignersContext';
import { useTasks } from '../contexts/TasksContext';
import { UserRole } from '../types';

const TeamManagement: React.FC = () => {
  const { designers, addDesigner, updateDesigner, removeDesigner } = useDesigners();
  const { tasks, getTasksByDesigner } = useTasks();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [newDesigner, setNewDesigner] = useState({
    name: '',
    role: 'designer' as UserRole,
    isAdmin: false,
    color: '#4f46e5'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('designer');
  const [editColor, setEditColor] = useState('');
  
  const predefinedColors = [
    '#4f46e5', // Indigo
    '#0ea5e9', // Sky
    '#14b8a6', // Teal
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f97316', // Orange
    '#10b981', // Emerald
    '#6366f1', // Indigo
  ];
  
  const handleAddDesigner = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDesigner.name.trim()) {
      addDesigner(
        newDesigner.name.trim(), 
        newDesigner.role, 
        newDesigner.isAdmin,
        newDesigner.color
      );
      setNewDesigner({ 
        name: '', 
        role: 'designer', 
        isAdmin: false, 
        color: '#4f46e5' 
      });
      setShowAddModal(false);
    }
  };
  
  const handleEditStart = (id: string, name: string, role: UserRole, color: string) => {
    setEditingId(id);
    setEditName(name);
    setEditRole(role);
    setEditColor(color);
  };
  
  const handleEditSave = (id: string) => {
    if (editName.trim()) {
      updateDesigner(id, { 
        name: editName.trim(),
        role: editRole,
        color: editColor
      });
    }
    setEditingId(null);
  };
  
  const handleEditCancel = () => {
    setEditingId(null);
  };
  
  const handleRemoveDesigner = (id: string) => {
    const designerTasks = getTasksByDesigner(id);
    if (designerTasks.length > 0) {
      if (!window.confirm(`This team member has ${designerTasks.length} tasks assigned. Are you sure you want to remove?`)) {
        return;
      }
    }
    removeDesigner(id);
  };
  
  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateDesigner(id, { active: !currentActive });
  };

  const handleToggleAdmin = (id: string, currentIsAdmin: boolean) => {
    updateDesigner(id, { isAdmin: !currentIsAdmin });
  };

  const handleSetPassword = (designerId: string) => {
    setSelectedDesignerId(designerId);
    setPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDesignerId && password.trim()) {
      updateDesigner(selectedDesignerId, { password: password.trim() });
      setShowPasswordModal(false);
      setSelectedDesignerId('');
      setPassword('');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Team Management</h1>
        <p className="mt-1 text-gray-600">
          Add, edit, or remove team members. Manage designers and production managers.
        </p>
      </div>
      
      {/* Add Member Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-1" /> Add Team Member
        </button>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Team Member</h3>
            <form onSubmit={handleAddDesigner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newDesigner.name}
                  onChange={(e) => setNewDesigner({ ...newDesigner, name: e.target.value })}
                  className="form-input w-full"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newDesigner.role}
                  onChange={(e) => setNewDesigner({ ...newDesigner, role: e.target.value as UserRole })}
                  className="form-input w-full"
                >
                  <option value="designer">Designer</option>
                  <option value="production-manager">Production Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        newDesigner.color === color ? 'border-primary-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewDesigner({ ...newDesigner, color })}
                    />
                  ))}
                  <div className="relative">
                    <input
                      type="color"
                      value={newDesigner.color}
                      onChange={(e) => setNewDesigner({ ...newDesigner, color: e.target.value })}
                      className="opacity-0 absolute inset-0 w-8 h-8 cursor-pointer"
                    />
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <Palette size={16} className="text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newDesigner.isAdmin}
                    onChange={(e) => setNewDesigner({ ...newDesigner, isAdmin: e.target.checked })}
                    className="form-checkbox h-4 w-4 text-primary-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Grant admin privileges</span>
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newDesigner.name.trim()}
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Set User Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input w-full"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!password.trim()}
                >
                  Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Team Members List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Current Team</h2>
        {designers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No team members found. Add your first team member above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {designers.map((designer) => {
                  const designerTasks = getTasksByDesigner(designer.id);
                  
                  return (
                    <tr key={designer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === designer.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="form-input text-sm py-1 px-2 w-full"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center">
                            <div 
                              className="h-10 w-10 rounded-full flex items-center justify-center font-medium text-white"
                              style={{ backgroundColor: designer.color }}
                            >
                              {designer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{designer.name}</p>
                              {designer.password && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Lock size={12} />
                                  <span>Password protected</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === designer.id ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                            className="form-input text-sm py-1 px-2"
                          >
                            <option value="designer">Designer</option>
                            <option value="production-manager">Production Manager</option>
                          </select>
                        ) : (
                          <span className="text-sm text-gray-900">
                            {designer.role === 'production-manager' ? 'Production Manager' : 'Designer'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === designer.id ? (
                          <div className="flex flex-wrap gap-2">
                            {predefinedColors.map(color => (
                              <button
                                key={color}
                                type="button"
                                className={`w-6 h-6 rounded-full border-2 ${
                                  editColor === color ? 'border-primary-500' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setEditColor(color)}
                              />
                            ))}
                            <div className="relative">
                              <input
                                type="color"
                                value={editColor}
                                onChange={(e) => setEditColor(e.target.value)}
                                className="opacity-0 absolute inset-0 w-6 h-6 cursor-pointer"
                              />
                              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                <Palette size={14} className="text-gray-500" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div
                              className="h-6 w-6 rounded-full"
                              style={{ backgroundColor: designer.color }}
                            ></div>
                            <span className="ml-2 text-sm text-gray-600">{designer.color}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(designer.id, designer.active)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            designer.active
                              ? 'bg-success-100 text-success-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {designer.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleAdmin(designer.id, designer.isAdmin || false)}
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            designer.isAdmin
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <Shield size={12} />
                          {designer.isAdmin ? 'Admin' : 'Member'}
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {designerTasks.length} tasks
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === designer.id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditSave(designer.id)}
                              className="text-success-600 hover:text-success-900"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleSetPassword(designer.id)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Set password"
                            >
                              <Lock size={18} />
                            </button>
                            <button
                              onClick={() => handleEditStart(designer.id, designer.name, designer.role, designer.color)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Edit member"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleRemoveDesigner(designer.id)}
                              className="text-error-600 hover:text-error-900"
                              title="Remove member"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;