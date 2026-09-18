import React from 'react';
import { UserProfile, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Badge, 
  Shield, 
  UserCheck, 
  HardHat, 
  Calendar, 
  Edit3, 
  Clock,
  Sparkles,
  ChevronRight,
  LogOut,
  Sliders,
  TrendingUp,
  Activity
} from 'lucide-react';

interface UserProfileModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onEditUser?: () => void;
  onEditAccount?: (user: UserProfile) => void;
  canEdit?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onEditUser,
  onEditAccount,
  canEdit = true
}) => {
  const { currentUser, t, language, logout } = useAuth();

  React.useEffect(() => {
    if (!isOpen) return;

    // Push state so mobile back button closes the profile drawer
    window.history.pushState({ drawer: 'profile' }, '');

    const handlePopState = (e: PopStateEvent) => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.drawer === 'profile') {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  if (!user) return null;

  const currentRole = currentUser?.role || 'worker';
  const targetRole = user.role || 'worker';

  const onEditTriggered = () => {
    if (onEditUser) {
      onEditUser();
    } else if (onEditAccount) {
      onEditAccount(user);
    }
  };

  const hasEditAction = Boolean(onEditUser || onEditAccount);

  // Role permissions
  const canEditThisAccount = (() => {
    if (!canEdit || !currentUser) return false;
    if (currentRole === 'super_admin') return true;
    if (currentRole === 'staff') return targetRole === 'worker';
    if (currentRole === 'worker') return currentUser.uid === user.uid;
    return false;
  })();

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/95 text-purple-300 border border-purple-500/30 shadow-md shadow-purple-950/50">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>{t('superAdmin')}</span>
          </span>
        );
      case 'staff':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-950/95 text-blue-300 border border-blue-500/30 shadow-md shadow-blue-950/50">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('staff')}</span>
          </span>
        );
      case 'worker':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/95 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-950/50">
            <HardHat className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('worker')}</span>
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/85 backdrop-blur-md transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Modern Interface Drawer (Right Side on Desktop, Bottom Sheet on Mobile) */}
      <div 
        className={`fixed z-50 transition-all duration-300 ease-out bg-[#0b0f19] border-slate-800/80 shadow-2xl flex flex-col
          ${isOpen ? 'translate-x-0 translate-y-0 opacity-100' : 'opacity-0'}
          md:inset-y-0 md:right-0 md:w-[420px] md:border-l md:translate-x-0
          inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl md:rounded-t-none
          ${isOpen ? 'md:translate-x-0 translate-y-0' : 'md:translate-x-full translate-y-full'}
        `}
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto my-3 md:hidden shrink-0" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
              {language === 'si' ? 'ගිණුම් පුවරුව' : 'Account Workspace'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Workspace */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* Hero Profile Segment */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#131b2d] to-[#0e1424] border border-blue-500/10 p-6 flex flex-col items-center text-center overflow-hidden">
            {/* Background decoration circles */}
            <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

            {/* Glowing Avatar */}
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 blur-md opacity-45 animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-black border border-blue-500/35 flex items-center justify-center text-white font-black text-2xl shadow-xl">
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100">
                  <path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="white" strokeWidth="2" />
                </svg>
                {getInitials(user.name)}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-[#0c101b] flex items-center justify-center shadow-lg" />
            </div>

            {/* Name & Role */}
            <h3 className="font-extrabold text-xl text-white tracking-tight leading-snug">{user.name}</h3>
            <p className="text-[11px] text-slate-400 tracking-wide mt-1 mb-3.5 truncate max-w-full">
              {user.email}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {getRoleBadge(user.role)}
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider uppercase ${
                user.accountStatus === 'approved'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/20'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/20'
              }`}>
                {t(user.accountStatus as any || 'approved')}
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#0f1424] border border-slate-800/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Status</span>
                <span className="text-xs font-bold text-slate-200">Active Duty</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f1424] border border-slate-800/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 flex items-center justify-center text-purple-400 border border-purple-500/20 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Priority</span>
                <span className="text-xs font-bold text-slate-200">Standard</span>
              </div>
            </div>
          </div>

          {/* Detailed Workspace Fields */}
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block px-1">
              {language === 'si' ? 'පුද්ගලික විස්තර' : 'Identity Details'}
            </span>

            {/* Email */}
            <div className="p-4 rounded-2xl bg-[#0f1424]/90 hover:bg-[#12192d] border border-slate-800/85 flex items-center gap-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 block tracking-wide uppercase font-semibold">{t('email')}</span>
                <span className="text-slate-200 text-xs font-semibold truncate block">{user.email}</span>
              </div>
            </div>

            {/* Phone */}
            <div className="p-4 rounded-2xl bg-[#0f1424]/90 hover:bg-[#12192d] border border-slate-800/85 flex items-center gap-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 block tracking-wide uppercase font-semibold">{t('phoneNumber')}</span>
                <span className="text-slate-200 text-xs font-semibold block">
                  {user.phone || (language === 'si' ? 'ලබාදී නොමැත' : 'Not Provided')}
                </span>
              </div>
            </div>

            {/* Department & Employee ID */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#0f1424]/90 hover:bg-[#12192d] border border-slate-800/85 flex items-center gap-3 transition-all">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] text-slate-400 block tracking-wide uppercase font-semibold">{t('department')}</span>
                  <span className="text-slate-200 text-xs font-semibold truncate block">
                    {user.departmentName || 'Operations'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1424]/90 hover:bg-[#12192d] border border-slate-800/85 flex items-center gap-3 transition-all">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                  <Badge className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] text-slate-400 block tracking-wide uppercase font-semibold">{t('employeeId')}</span>
                  <span className="text-slate-200 text-xs font-semibold block">
                    {user.employeeId || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Date */}
            <div className="p-4 rounded-2xl bg-[#0f1424]/90 hover:bg-[#12192d] border border-slate-800/85 flex items-center gap-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 block tracking-wide uppercase font-semibold">Registration Date</span>
                <span className="text-slate-200 text-xs font-semibold block">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'System Default'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-800/60 bg-[#080b13] shrink-0 space-y-3">
          {canEditThisAccount && hasEditAction && (
            <button
              onClick={() => {
                onClose();
                onEditTriggered();
              }}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>{language === 'si' ? 'ගිණුම සංස්කරණය කරන්න' : 'Edit Account Details'}</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[#0f1424] hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-all"
            >
              {language === 'si' ? 'වසන්න' : 'Dismiss'}
            </button>
            
            {currentUser?.uid === user.uid && (
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="px-4 py-3 rounded-xl bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 hover:border-red-500/50 transition-all flex items-center justify-center"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
