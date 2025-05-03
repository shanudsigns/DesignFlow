import React, { useState } from 'react';
import { Calendar, Clock, Award, Plus, X, Check } from 'lucide-react';
import { useDesigners } from '../contexts/DesignersContext';
import { useAuth } from '../contexts/AuthContext';
import DesignerAvatar from '../components/ui/DesignerAvatar';
import { DesignerSkill, DesignerAvailability } from '../types';
import { format, addDays, isSameDay } from 'date-fns';

const ResourceManagement: React.FC = () => {
  const { designers, updateDesignerSkills, updateDesignerAvailability, updateWorkingHours } = useDesigners();
  const { currentUser, isAdmin } = useAuth();
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>(currentUser?.id || '');
  const [newSkill, setNewSkill] = useState({ name: '', level: 'intermediate' as DesignerSkill['level'] });
  const [newAvailability, setNewAvailability] = useState<Partial<DesignerAvailability>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'vacation',
    note: ''
  });

  const activeDesigners = isAdmin 
    ? designers.filter(d => d.active)
    : designers.filter(d => d.id === currentUser?.id);

  const selectedDesigner = designers.find(d => d.id === selectedDesignerId);

  const handleAddSkill = () => {
    if (!selectedDesigner || !newSkill.name) return;

    const updatedSkills = [
      ...(selectedDesigner.skills || []),
      { name: newSkill.name, level: newSkill.level }
    ];

    updateDesignerSkills(selectedDesigner.id, updatedSkills);
    setNewSkill({ name: '', level: 'intermediate' });
  };

  const handleRemoveSkill = (skillName: string) => {
    if (!selectedDesigner) return;

    const updatedSkills = selectedDesigner.skills?.filter(skill => skill.name !== skillName) || [];
    updateDesignerSkills(selectedDesigner.id, updatedSkills);
  };

  const handleAddAvailability = () => {
    if (!selectedDesigner || !newAvailability.date || !newAvailability.type) return;

    const updatedAvailability = [
      ...(selectedDesigner.availability || []),
      newAvailability as DesignerAvailability
    ];

    updateDesignerAvailability(selectedDesigner.id, updatedAvailability);
    setNewAvailability({
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      type: 'vacation',
      note: ''
    });
  };

  const handleRemoveAvailability = (date: string) => {
    if (!selectedDesigner) return;

    const updatedAvailability = selectedDesigner.availability?.filter(
      a => !isSameDay(new Date(a.date), new Date(date))
    ) || [];
    updateDesignerAvailability(selectedDesigner.id, updatedAvailability);
  };

  const handleWorkingHoursChange = (
    day: keyof NonNullable<typeof selectedDesigner.workingHours>,
    field: 'start' | 'end',
    value: string
  ) => {
    if (!selectedDesigner) return;

    const updatedHours = {
      ...(selectedDesigner.workingHours || {}),
      [day]: {
        ...(selectedDesigner.workingHours?.[day] || {}),
        [field]: value
      }
    };

    updateWorkingHours(selectedDesigner.id, updatedHours);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Resource Management</h1>
        <p className="mt-1 text-gray-600">
          Manage team skills, availability, and working hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Designer Selection */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Team Members</h2>
            <div className="space-y-2">
              {activeDesigners.map(designer => (
                <button
                  key={designer.id}
                  onClick={() => setSelectedDesignerId(designer.id)}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                    selectedDesignerId === designer.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <DesignerAvatar designerId={designer.id} size="sm" />
                  <div className="text-left">
                    <div className="font-medium">{designer.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{designer.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedDesigner ? (
          <div className="lg:col-span-3 space-y-8">
            {/* Skills Management */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Award className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold">Skills & Expertise</h2>
              </div>

              <div className="space-y-4">
                {/* Add New Skill */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    placeholder="Add new skill..."
                    className="form-input flex-1"
                  />
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as DesignerSkill['level'] })}
                    className="form-input w-40"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                  <button
                    onClick={handleAddSkill}
                    disabled={!newSkill.name}
                    className="btn btn-primary"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Skills List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDesigner.skills?.map(skill => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{skill.level}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="text-gray-400 hover:text-error-600"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability Management */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold">Availability</h2>
              </div>

              <div className="space-y-4">
                {/* Add New Availability */}
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={newAvailability.date}
                    onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="form-input"
                  />
                  <select
                    value={newAvailability.type}
                    onChange={(e) => setNewAvailability({ ...newAvailability, type: e.target.value as DesignerAvailability['type'] })}
                    className="form-input"
                  >
                    <option value="vacation">Vacation</option>
                    <option value="sick-leave">Sick Leave</option>
                    <option value="training">Training</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    value={newAvailability.note || ''}
                    onChange={(e) => setNewAvailability({ ...newAvailability, note: e.target.value })}
                    placeholder="Add note (optional)"
                    className="form-input flex-1"
                  />
                  <button
                    onClick={handleAddAvailability}
                    className="btn btn-primary"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Availability List */}
                <div className="space-y-3">
                  {selectedDesigner.availability?.map(item => (
                    <div
                      key={item.date}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {format(new Date(item.date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="capitalize">{item.type}</span>
                          {item.note && ` - ${item.note}`}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAvailability(item.date)}
                        className="text-gray-400 hover:text-error-600"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold">Working Hours</h2>
              </div>

              <div className="space-y-4">
                {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'].map(day => (
                  <div key={day} className="grid grid-cols-3 gap-4 items-center">
                    <div className="font-medium capitalize">{day}</div>
                    <input
                      type="time"
                      value={selectedDesigner.workingHours?.[day]?.start || '09:00'}
                      onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                      className="form-input"
                    />
                    <input
                      type="time"
                      value={selectedDesigner.workingHours?.[day]?.end || '18:00'}
                      onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                      className="form-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 card flex items-center justify-center p-12">
            <p className="text-gray-500">Select a team member to manage their resources</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceManagement;