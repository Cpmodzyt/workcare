import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppNotification } from '../../types';
import { getUserNotifications, markNotificationRead } from '../../services/firebase';
import { X, Bell, CheckCircle2, MessageSquare, AlertTriangle, UserCheck, Clock } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport?: (reportId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectReport
}) => {
  const { currentUser, t, language } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadNotifs();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen) return;

    // Push temporary state so back button closes drawer
    window.history.pushState({ drawer: 'notifications' }, '');

    const handlePopState = (e: PopStateEvent) => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.drawer === 'notifications') {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  const loadNotifs = async () => {
    if (!currentUser) return;
    const notifs = await getUserNotifications(currentUser.uid);
    setNotifications(notifs);
  };

  if (!isOpen || !currentUser) return null;

  const handleNotificationClick = async (notif: AppNotification) => {
    await markNotificationRead(notif.id);
    await loadNotifs();
    if (notif.reportId && onSelectReport) {
      onSelectReport(notif.reportId);
      onClose();
    }
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'new_message':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'status_change':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'staff_request':
      case 'staff_approved':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#101522] border-l border-blue-500/20 h-full flex flex-col shadow-2xl text-slate-100">
        <div className="p-4 border-b border-blue-900/40 bg-[#0d121e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm text-white">{t('notifications')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{language === 'si' ? 'නව දැනුම්දීම් නොමැත' : 'No notifications yet'}</p>
            </div>
          ) : (
            notifications.map((n) => {
              const title = language === 'si' && n.titleSi ? n.titleSi : n.title;
              const body = language === 'si' && n.bodySi ? n.bodySi : n.body;
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    !n.read
                      ? 'bg-blue-950/30 border-blue-500/40 shadow-sm shadow-blue-500/10'
                      : 'bg-[#141b2a] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-[#182133] shrink-0 mt-0.5">
                      {getNotifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {title}
                        </h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                        {body}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
