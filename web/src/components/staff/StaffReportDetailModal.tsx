import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProblemReport, ReportStatus, ReportPriority, UserProfile } from '../../types';
import { 
  updateReportStatus, 
  updateReportPriority, 
  assignReportStaff, 
  saveInternalNotes, 
  getAllUsers 
} from '../../services/firebase';
import { 
  X, 
  MessageSquare, 
  Clock, 
  User, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  Lock,
  Save
} from 'lucide-react';

interface StaffReportDetailModalProps {
  report: ProblemReport | null;
  isOpen: boolean;
  onClose: () => void;
  onReportUpdated: (updated: ProblemReport) => void;
  onOpenChat: (report: ProblemReport) => void;
}

export const StaffReportDetailModal: React.FC<StaffReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  onReportUpdated,
  onOpenChat
}) => {
  const { currentUser, t, language } = useAuth();
  const [status, setStatus] = useState<ReportStatus>('new');
  const [priority, setPriority] = useState<ReportPriority>('medium');
  const [internalNotes, setInternalNotes] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    if (report) {
      setStatus(report.status);
      setPriority(report.priority);
      setInternalNotes(report.internalNotes || '');
      setAssignedStaffId(report.assignedStaffId || '');
      loadStaff();
    }
  }, [report?.id]);

  const loadStaff = async () => {
    const users = await getAllUsers();
    setStaffList(users.filter(u => (u.role === 'staff' || u.role === 'super_admin') && u.accountStatus === 'approved'));
  };

  if (!isOpen || !report || !currentUser) return null;

  const handleStatusChange = async (newStatus: ReportStatus) => {
    setStatus(newStatus);
    await updateReportStatus(report.id, newStatus);
    onReportUpdated({ ...report, status: newStatus });
  };

  const handlePriorityChange = async (newPriority: ReportPriority) => {
    setPriority(newPriority);
    await updateReportPriority(report.id, newPriority);
    onReportUpdated({ ...report, priority: newPriority });
  };

  const handleAssignStaff = async (staffId: string) => {
    setAssignedStaffId(staffId);
    const staff = staffList.find(s => s.uid === staffId);
    const staffName = staff?.name || 'Assigned Staff';
    await assignReportStaff(report.id, staffId, staffName);
    onReportUpdated({ ...report, assignedStaffId: staffId, assignedStaffName: staffName });
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await saveInternalNotes(report.id, internalNotes);
    onReportUpdated({ ...report, internalNotes });
    setSavingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#111724] border border-blue-500/30 rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl blue-glow text-slate-100 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-500/30">
                {report.ticketId}
              </span>
              <span className="text-xs text-slate-400">
                {report.departmentName || 'General Facility'}
              </span>
            </div>
            <h3 className="font-bold text-lg text-white mt-1">
              {report.facilityName} - {report.categoryName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls: Status, Priority, Staff Assignment */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#141b2a] border border-blue-500/20">
          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              {t('changeStatus')}
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as ReportStatus)}
              className="w-full bg-[#182133] border border-blue-500/30 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
            >
              <option value="new">{t('status_new')}</option>
              <option value="in_progress">{t('status_in_progress')}</option>
              <option value="resolved">{t('status_resolved')}</option>
              <option value="closed">{t('status_closed')}</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              {t('setPriority')}
            </label>
            <select
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value as ReportPriority)}
              className="w-full bg-[#182133] border border-blue-500/30 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
            >
              <option value="low">{t('priority_low')}</option>
              <option value="medium">{t('priority_medium')}</option>
              <option value="high">{t('priority_high')}</option>
              <option value="urgent">{t('priority_urgent')}</option>
            </select>
          </div>

          {/* Staff Assignment */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              {t('assignStaff')}
            </label>
            <select
              value={assignedStaffId}
              onChange={(e) => handleAssignStaff(e.target.value)}
              className="w-full bg-[#182133] border border-blue-500/30 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
            >
              <option value="">{t('unassigned')}</option>
              {staffList.map((st) => (
                <option key={st.uid} value={st.uid}>
                  {st.name} ({st.departmentName || 'Staff'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Worker Details Card */}
        <div className="p-3.5 rounded-2xl bg-[#141b2a] border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              {report.workerName}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3" />
              {new Date(report.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              {report.workerEmail}
            </span>
            {report.workerPhone && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Phone className="w-3 h-3" />
                {report.workerPhone}
              </span>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800">
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>
        </div>

        {/* Photos & Videos Section */}
        {((report.photoUrls && report.photoUrls.length > 0) || (report.videoUrls && report.videoUrls.length > 0)) && (
          <div className="mt-4 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              {language === 'si' ? 'සේවකයා ඉදිරිපත් කළ ඡායාරූප / වීඩියෝ' : 'Worker Uploaded Photos / Media'}
            </span>
            <div className="flex flex-wrap gap-2.5">
              {report.photoUrls?.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noreferrer" className="block">
                  <img
                    src={url}
                    alt="Problem attachment"
                    className="w-24 h-24 rounded-2xl object-cover border border-blue-500/30 hover:scale-105 transition-transform"
                  />
                </a>
              ))}
              {report.videoUrls?.map((url, idx) => (
                <div key={idx} className="w-48 rounded-2xl overflow-hidden border border-blue-500/30 bg-black">
                  <video src={url} controls className="w-full max-h-24" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Internal Notes Section */}
        <div className="mt-4 p-4 rounded-2xl bg-[#141b2a] border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              {t('internalNotes')}
            </span>
            <span className="text-[10px] text-slate-500">
              {language === 'si' ? 'කාර්යමණ්ඩලයට පමණක් පෙනේ' : 'Staff & Admin only'}
            </span>
          </div>

          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder={t('internalNotesPlaceholder')}
            rows={3}
            className="w-full bg-[#182133] border border-slate-700/80 focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none leading-relaxed"
          />

          <div className="flex items-center justify-end gap-2">
            {notesSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('saveNotes')}
              </span>
            )}
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3 h-3" />
              <span>{t('saveNotes')}</span>
            </button>
          </div>
        </div>

        {/* Bottom CTA: Message Worker */}
        <div className="mt-5 pt-3 border-t border-blue-900/40 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenChat(report);
            }}
            className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('replyToWorker')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
