import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import WeeklyView from './pages/WeeklyView';
import ResourceManagement from './pages/ResourceManagement';
import TeamManagement from './pages/TeamManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Help from './pages/Help';
import NotFound from './pages/NotFound';

const ProtectedRoute: React.FC<{ element: React.ReactElement; adminOnly?: boolean }> = ({ 
  element, 
  adminOnly = false 
}) => {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return element;
};

const App: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" replace />} />
      
      <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="weekly" element={<WeeklyView />} />
        <Route path="resources" element={<ProtectedRoute element={<ResourceManagement />} adminOnly />} />
        <Route path="team" element={<ProtectedRoute element={<TeamManagement />} adminOnly />} />
        <Route path="reports" element={<ProtectedRoute element={<Reports />} adminOnly />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;