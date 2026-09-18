import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProblemReport, ChatMessage, UserProfile } from '../../types';
import { getReportMessages, sendChatMessage, getUserProfile, getAllUsers } from '../../services/firebase';
import { uploadMediaFile } from '../../services/storage';
import { UserProfileModal } from '../common/UserProfileModal';
import { EditUserModal } from '../common/EditUserModal';
import { 
  X, 
  Send, 
  Paperclip, 
  Image, 
  Clock, 
  Shield, 
  UserCheck, 
  HardHat, 
  CheckCheck,
  Building2,
  Trash2,
  Info,
  User
} from 'lucide-react';

interface ChatDrawerProps {
  report: ProblemReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ report, isOpen, onClose }) => {
  const { currentUser, t, language } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chatter profile viewing and editing state
  const [inspectedUser, setInspectedUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isOpen && report) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Polling update
      return () => clearInterval(interval);
    }
  }, [isOpen, report?.id]);

  useEffect(() => {
    if (!isOpen) return;

    // Push temporary state so back button closes chat drawer
    window.history.pushState({ drawer: 'chat' }, '');

    const handlePopState = (e: PopStateEvent) => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.drawer === 'chat') {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!report) return;
    const msgs = await getReportMessages(report.id);
    setMessages(msgs);
  };

  const handleOpenUserProfile = async (uid: string, fallbackName: string, fallbackRole: any) => {
    try {
      const profile = await getUserProfile(uid);
      if (profile) {
        setInspectedUser(profile);
      } else {
        // Fallback reconstructed profile
        setInspectedUser({
          uid,
          name: fallbackName,
          email: uid.includes('@') ? uid : `${uid.toLowerCase()}@company.com`,
          role: fallbackRole || 'worker',
          accountStatus: 'approved',
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Failed to load user profile:', e);
    }
  };

  if (!isOpen || !report || !currentUser) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment(file);
      setAttachmentPreview(URL.createObjectURL(file));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachment) return;

    try {
      setSending(true);
      let attachmentUrl: string | undefined = undefined;
      if (attachment) {
        attachmentUrl = await uploadMediaFile(attachment, 'messages');
      }

      await sendChatMessage(report.id, currentUser, inputMessage.trim(), attachmentUrl);
      setInputMessage('');
      setAttachment(null);
      setAttachmentPreview(null);
      await loadMessages();
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setSending(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
            Admin
          </span>
        );
      case 'staff':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30">
            Staff
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            Worker
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#101522] border-l border-blue-500/20 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-blue-900/40 bg-[#0d121e] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400">
                {report.ticketId}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {report.facilityName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[260px]">
              {report.categoryName} - {report.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Initial issue summary card */}
          <div className="p-3.5 rounded-2xl bg-[#141b2a] border border-blue-500/20 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => handleOpenUserProfile(report.workerId, report.workerName, 'worker')}
                className="font-semibold text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-1.5 transition-colors"
                title="View Reporter Profile"
              >
                <User className="w-3.5 h-3.5" />
                <span>{report.workerName} ({t('worker')})</span>
                <Info className="w-3 h-3 text-blue-400 opacity-70" />
              </button>
              <span className="text-slate-400 text-[10px]">
                {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-slate-200">{report.description}</p>
            {report.photoUrls && report.photoUrls.length > 0 && (
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {report.photoUrls.map((p, idx) => (
                  <img key={idx} src={p} alt="Attached" className="w-14 h-14 rounded-lg object-cover border border-slate-700" />
                ))}
              </div>
            )}
          </div>

          {messages.map((m) => {
            const isMe = m.senderId === currentUser.uid;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                  <button
                    type="button"
                    onClick={() => handleOpenUserProfile(m.senderId, m.senderName, m.senderRole)}
                    className="font-medium hover:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
                    title="Click to view chatter info"
                  >
                    <span>{m.senderName}</span>
                    <Info className="w-2.5 h-2.5 opacity-60" />
                  </button>
                  {getRoleBadge(m.senderRole)}
                  <span>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                      : 'bg-[#182030] text-slate-200 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  <p>{m.message}</p>
                  {m.attachmentUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/20">
                      <img src={m.attachmentUrl} alt="Message attachment" className="w-full max-h-40 object-cover" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-3 border-t border-blue-900/40 bg-[#0d121e]">
          {attachmentPreview && (
            <div className="mb-2 relative inline-block">
              <img src={attachmentPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-blue-500/40" />
              <button
                type="button"
                onClick={() => { setAttachment(null); setAttachmentPreview(null); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <label className="p-2 rounded-xl bg-[#141b2a] border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-white cursor-pointer transition-colors">
              <Image className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t('replyPlaceholder')}
              className="flex-1 bg-[#141b2a] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
            />

            <button
              type="submit"
              disabled={sending || (!inputMessage.trim() && !attachment)}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Chatter About Profile Modal */}
      <UserProfileModal
        user={inspectedUser}
        isOpen={Boolean(inspectedUser)}
        onClose={() => setInspectedUser(null)}
        onEditAccount={(u) => setEditingUser(u)}
      />

      {/* Account Edit Modal if editing from Chatter view */}
      <EditUserModal
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSaved={() => {
          setInspectedUser(null);
          loadMessages();
        }}
      />
    </div>
  );
};

