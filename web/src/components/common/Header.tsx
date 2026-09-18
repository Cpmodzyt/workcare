import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserProfileModal } from './UserProfileModal';
import { EditAccountModal } from './EditAccountModal';
import { 
  Building2, 
  Bell, 
  LogOut, 
  Shield, 
  UserCheck, 
  HardHat, 
  Database,
  CheckCircle,
  AlertCircle,
  User,
  Edit3
} from 'lucide-react';
import { isFirebaseLive } from '../../services/firebase';

interface HeaderProps {
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, unreadCount = 0 }) => {
  const { currentUser, logout, t, language, setConfigModalOpen, refreshUser } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Synchronize profile and edit drawers with back button
  React.useEffect(() => {
    const handlePopState = () => {
      if (profileModalOpen && !window.location.hash.includes('profile')) {
        setProfileModalOpen(false);
      }
      if (editModalOpen && !window.location.hash.includes('edit-account')) {
        setEditModalOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [profileModalOpen, editModalOpen]);

  const openProfile = () => {
    setProfileModalOpen(true);
    window.history.pushState({ drawer: 'profile' }, '', '#/profile');
  };

  const closeProfile = () => {
    setProfileModalOpen(false);
    if (window.location.hash.includes('profile')) {
      window.history.back();
    }
  };

  const openEdit = () => {
    setEditModalOpen(true);
    window.history.pushState({ drawer: 'edit-account' }, '', '#/edit-account');
  };

  const closeEdit = () => {
    setEditModalOpen(false);
    if (window.location.hash.includes('edit-account')) {
      window.history.back();
    }
  };

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/30 whitespace-nowrap shrink-0">
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
            <span className="hidden xs:inline sm:inline">{t('superAdmin')}</span>
            <span className="inline xs:hidden sm:hidden">Admin</span>
          </span>
        );
      case 'staff':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/30 whitespace-nowrap shrink-0">
            <UserCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
            <span>{t('staff')}</span>
          </span>
        );
      case 'worker':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 whitespace-nowrap shrink-0">
            <HardHat className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
            <span>{t('worker')}</span>
          </span>
        );
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d121e]/95 backdrop-blur-md border-b border-blue-900/30 px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black border border-blue-500/20 flex items-center justify-center shadow-md sm:shadow-lg shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="c_gradient" x1="26" y1="82" x2="82" y2="26" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <path d="M 76,32 A 28,28 0 1,0 76,76" stroke="url(#c_gradient)" strokeWidth="10" strokeLinecap="round"/>
              <path d="M 40,44 L 54,60 L 68,44" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-bold text-sm sm:text-base tracking-tight text-white truncate">
                Work Care
              </h1>
              {getRoleBadge()}
            </div>
            <p className="text-[10px] sm:text-[11px] text-blue-300/80 truncate hidden sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Firebase Status pill */}
          <button
            onClick={() => setConfigModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131927] border border-slate-800 text-[11px] text-slate-300 hover:border-blue-500/50 transition-all shrink-0"
            title="Configure Firebase"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Firebase</span>
            {isFirebaseLive() ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {currentUser && (
            <>
              {/* User Profile / Edit Button */}
              <button
                onClick={openProfile}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-[#131927] hover:bg-[#182133] border border-blue-500/20 text-slate-200 text-xs font-medium transition-all shrink-0 group"
                title="View Profile / Account Settings"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  {getInitials(currentUser.name)}
                </div>
                <span className="hidden sm:inline text-[11px] max-w-[90px] truncate group-hover:text-blue-300">
                  {currentUser.name}
                </span>
              </button>

              {/* Notification button */}
              <button
                onClick={onOpenNotifications}
                className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[#121826] border border-blue-500/20 text-slate-300 hover:text-white hover:border-blue-500/50 transition-all shrink-0"
                title={t('notifications')}
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-500 text-[9px] sm:text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[#121826] border border-red-500/20 text-slate-400 hover:text-red-300 hover:border-red-500/50 transition-all shrink-0"
                title={t('logout')}
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile & Edit Account Modals */}
      <UserProfileModal
        user={currentUser}
        isOpen={profileModalOpen}
        onClose={closeProfile}
        onEditUser={openEdit}
      />

      <EditAccountModal
        user={currentUser}
        isOpen={editModalOpen}
        onClose={closeEdit}
        onUserUpdated={() => refreshUser()}
      />
    </header>
  );
};

