import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { FirebaseConfigModal } from './components/common/FirebaseConfigModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { WorkerRegisterScreen } from './components/auth/WorkerRegisterScreen';
import { StaffRegisterScreen } from './components/auth/StaffRegisterScreen';
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen';
import { WorkerDashboard } from './components/worker/WorkerDashboard';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';

type AuthView = 'login' | 'worker-register' | 'staff-register' | 'forgot-password';

const MainContent: React.FC = () => {
  const { currentUser, isConfigModalOpen, setConfigModalOpen, isFirebaseConnected } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isNotifOpen, setNotifOpen] = useState(false);

  // Synchronize view state with window location hash for robust mobile/browser back-button support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/worker-register') {
        setAuthView('worker-register');
      } else if (hash === '#/staff-register') {
        setAuthView('staff-register');
      } else if (hash === '#/forgot-password') {
        setAuthView('forgot-password');
      } else {
        setAuthView('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Trigger on mount to handle direct links

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateTo = (view: AuthView) => {
    if (view === 'login') {
      window.location.hash = '#/login';
    } else {
      window.location.hash = `#/${view}`;
    }
  };

  // If user is not logged in, render authentication screens
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        <Header onOpenNotifications={() => {}} />

        <main className="flex-1 flex flex-col justify-center animate-fade-in">
          {authView === 'login' && (
            <LoginScreen
              onGoToWorkerRegister={() => navigateTo('worker-register')}
              onGoToStaffRegister={() => navigateTo('staff-register')}
              onGoToForgotPassword={() => navigateTo('forgot-password')}
            />
          )}

          {authView === 'worker-register' && (
            <WorkerRegisterScreen onBackToLogin={() => navigateTo('login')} />
          )}

          {authView === 'staff-register' && (
            <StaffRegisterScreen onBackToLogin={() => navigateTo('login')} />
          )}

          {authView === 'forgot-password' && (
            <ForgotPasswordScreen onBackToLogin={() => navigateTo('login')} />
          )}
        </main>

        <FirebaseConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setConfigModalOpen(false)}
        />
      </div>
    );
  }

  // Synchronize notification drawer with browser/mobile history back button
  React.useEffect(() => {
    const handlePopState = () => {
      if (isNotifOpen && !window.location.hash.includes('notifications')) {
        setNotifOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isNotifOpen]);

  const openNotifications = () => {
    setNotifOpen(true);
    window.history.pushState({ drawer: 'notifications' }, '', '#/notifications');
  };

  const closeNotifications = () => {
    setNotifOpen(false);
    if (window.location.hash.includes('notifications')) {
      window.history.back();
    }
  };

  // User is logged in: render role-specific dashboard
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <Header onOpenNotifications={openNotifications} />

      <main className="flex-1 pb-12">
        {currentUser.role === 'super_admin' && <SuperAdminDashboard />}
        {currentUser.role === 'staff' && <StaffDashboard />}
        {currentUser.role === 'worker' && (
          <WorkerDashboard onOpenNotifications={openNotifications} />
        )}
      </main>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={closeNotifications}
      />

      {/* Firebase configuration modal */}
      <FirebaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
