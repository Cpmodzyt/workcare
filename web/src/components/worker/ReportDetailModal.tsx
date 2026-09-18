import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProblemReport } from '../../types';
import { 
  X, 
  MessageSquare, 
  Clock, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  User, 
  ShieldAlert,
  ChevronRight,
  Phone
} from 'lucide-react';

interface ReportDetailModalProps {
  report: ProblemReport | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (report: ProblemReport) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  onOpenChat
}) => {
  const { t, language } = useAuth();

  if (!isOpen || !report) return null;

  const getStatusBadge = (status: ProblemReport['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-500/40">{t('status_new')}</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-500/40">{t('status_in_progress')}</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40">{t('status_resolved')}</span>;
      case 'closed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">{t('status_closed')}</span>;
    }
  };

  const getPriorityBadge = (priority: ProblemReport['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">{t('priority_urgent')}</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-500/40">{t('priority_high')}</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950 text-blue-300 border border-blue-500/40">{t('priority_medium')}</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-500/40">{t('priority_low')}</span>;
    }
  };

  const steps = ['new', 'in_progress', 'resolved', 'closed'];
  const currentStepIdx = steps.indexOf(report.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#111724] border border-blue-500/30 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl blue-glow text-slate-100 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
          <div>
            <span className="font-mono text-xs font-bold text-blue-400">
              {report.ticketId}
            </span>
            <h3 className="font-bold text-base text-white mt-0.5">
              {report.facilityName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status progress bar */}
        <div className="my-4 p-3.5 rounded-2xl bg-[#141b2b] border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">{t('status')}</span>
            {getStatusBadge(report.status)}
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-2">
            {steps.map((st, idx) => {
              const isPastOrCurrent = idx <= currentStepIdx;
              return (
                <div key={st} className="flex flex-col items-center">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all ${
                      isPastOrCurrent ? 'bg-blue-500 shadow-sm shadow-blue-500/50' : 'bg-slate-800'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 capitalize text-center truncate w-full">
                    {t(`status_${st}` as any)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-[#161c2b] border border-slate-800">
              <span className="text-slate-400 text-[10px] block mb-0.5">{t('problemCategory')}</span>
              <span className="font-medium text-white">{report.categoryName}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#161c2b] border border-slate-800">
              <span className="text-slate-400 text-[10px] block mb-0.5">{t('priority')}</span>
              {getPriorityBadge(report.priority)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#161c2b] border border-slate-800">
            <span className="text-slate-400 text-[10px] block mb-1">{t('description')}</span>
            <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Photos */}
          {report.photoUrls && report.photoUrls.length > 0 && (
            <div>
              <span className="text-slate-400 text-[10px] block mb-1.5">
                {language === 'si' ? 'අමුණා ඇති ඡායාරූප' : 'Attached Photos'}
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {report.photoUrls.map((p, idx) => (
                  <a key={idx} href={p} target="_blank" rel="noreferrer" className="block shrink-0">
                    <img
                      src={p}
                      alt="Report attachment"
                      className="w-20 h-20 rounded-xl object-cover border border-blue-500/30 hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {report.videoUrls && report.videoUrls.length > 0 && (
            <div>
              <span className="text-slate-400 text-[10px] block mb-1.5">
                {language === 'si' ? 'අමුණා ඇති වීඩියෝ' : 'Attached Video'}
              </span>
              <div className="rounded-xl overflow-hidden border border-blue-500/30 bg-black">
                <video src={report.videoUrls[0]} controls className="w-full max-h-40" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
            {report.assignedStaffName && (
              <span className="flex items-center gap-1 text-blue-300 font-medium">
                <User className="w-3.5 h-3.5" />
                {report.assignedStaffName}
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Chat with staff */}
        <div className="mt-5 pt-3 border-t border-blue-900/40">
          <button
            onClick={() => {
              onClose();
              onOpenChat(report);
            }}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>
              {language === 'si' ? 'කාර්යමණ්ඩලය සමඟ සාකච්ඡා කරන්න (Chat)' : 'Message Maintenance Staff'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
