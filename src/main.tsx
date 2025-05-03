import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DesignersProvider } from './contexts/DesignersContext';
import { TasksProvider } from './contexts/TasksContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DesignersProvider>
        <AuthProvider>
          <NotificationsProvider>
            <TasksProvider>
              <App />
            </TasksProvider>
          </NotificationsProvider>
        </AuthProvider>
      </DesignersProvider>
    </BrowserRouter>
  </StrictMode>
);