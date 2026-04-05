import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <NotificationProvider>
            <div className="min-h-screen gradient-bg">
              <AppRoutes />
            </div>
          </NotificationProvider>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
