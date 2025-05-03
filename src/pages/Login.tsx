import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesigners } from '../contexts/DesignersContext';
import { useAuth } from '../contexts/AuthContext';
import { Palette, Shield, Lock } from 'lucide-react';
import DesignerAvatar from '../components/ui/DesignerAvatar';

const Login: React.FC = () => {
  const { designers } = useDesigners();
  const { login } = useAuth();
  const navigate = useNavigate();
  const activeDesigners = designers.filter(d => d.active);

  const [selectedDesigner, setSelectedDesigner] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDesignerSelect = (designerId: string) => {
    const designer = designers.find(d => d.id === designerId);
    if (designer?.isAdmin || designer?.password) {
      setSelectedDesigner(designerId);
    } else {
      if (login(designerId)) {
        navigate('/');
      }
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDesigner) {
      if (login(selectedDesigner, password)) {
        navigate('/');
      } else {
        setError('Incorrect password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Password Modal */}
      {selectedDesigner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-6 w-6 text-primary-600" />
              <h3 className="text-xl font-semibold text-gray-900">Enter Password</h3>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="mt-1 form-input w-full"
                  placeholder="Enter password"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-error-600">{error}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDesigner(null);
                    setPassword('');
                    setError('');
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!password}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-fit p-3 bg-white rounded-full shadow-md">
          <Palette className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to DesignFlow
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto">
          Select your profile to access your personalized dashboard and manage your design tasks
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDesigners.map(designer => (
            <button
              key={designer.id}
              onClick={() => handleDesignerSelect(designer.id)}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <div className="h-32 relative" style={{ backgroundColor: designer.color }}>
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity" />
                {designer.isAdmin && (
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-3 py-1 flex items-center gap-1">
                    <Shield size={14} className="text-primary-600" />
                    <span className="text-xs font-medium text-primary-600">Admin</span>
                  </div>
                )}
                {designer.password && !designer.isAdmin && (
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-3 py-1 flex items-center gap-1">
                    <Lock size={14} className="text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">Password Protected</span>
                  </div>
                )}
                <div className="absolute -bottom-8 left-4">
                  <div className="ring-4 ring-white rounded-full">
                    <DesignerAvatar
                      designerId={designer.id}
                      size="lg"
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 pt-10 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 text-left">
                  {designer.name}
                </h3>
                <p className="text-sm text-gray-500 text-left mt-1">
                  {designer.role === 'production-manager' ? 'Production Manager' : 
                   designer.isAdmin ? 'Design Team Lead' : 'Designer'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;