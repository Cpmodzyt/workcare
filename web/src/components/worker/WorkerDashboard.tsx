import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProblemReport } from '../../types';
import { getReports } from '../../services/firebase';
import { ReportProblemModal } from './ReportProblemModal';
import { ReportDetailModal } from './ReportDetailModal';
import { ChatDrawer } from '../messaging/ChatDrawer';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  ChevronRight, 
  Calendar,
  Building2,
  HardHat,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface WorkerDashboardProps {
  onOpenNotifications: () => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ onOpenNotifications }) => {
  const { currentUser, t, language } = useAuth();
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProblemReport | null>(null);
  const [chatReport, setChatReport] = useState<ProblemReport | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved' | 'closed'>('all');

  useEffect(() => {
    loadWorkerReports();
  }, [currentUser?.uid]);

  const loadWorkerReports = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const all = await getReports();
      // Only show current worker's reports per security specifications
      const myReports = all.filter(r => r.workerId === currentUser.uid);
      setReports(myReports);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportCreated = (newReport: ProblemReport) => {
    setReports(prev => [newReport, ...prev]);
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = reports.filter(r => r.status === 'new' || r.status === 'in_progress').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved' || r.status === 'closed').length;

  const getStatusBadge = (status: ProblemReport['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/40">{t('status_new')}</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40">{t('status_in_progress')}</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">{t('status_resolved')}</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">{t('status_closed')}</span>;
    }
  };

  const getPriorityBadge = (priority: ProblemReport['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-bold text-rose-400">● {t('priority_urgent')}</span>;
      case 'high':
        return <span className="text-[10px] font-semibold text-amber-400">● {t('priority_high')}</span>;
      case 'medium':
        return <span className="text-[10px] text-blue-400">● {t('priority_medium')}</span>;
      default:
        return <span className="text-[10px] text-emerald-400">● {t('priority_low')}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Welcome Banner with Quick Report CTA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121929] via-[#101726] to-[#0c121e] border border-blue-500/30 p-6 sm:p-7 shadow-2xl blue-glow">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-medium border border-blue-500/30 mb-2">
              <HardHat className="w-3.5 h-3.5" />
              <span>{t('worker')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {t('welcome')}, {currentUser?.name}!
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
              {language === 'si'
                ? 'ඔබගේ සේවා ස්ථානයේ යම් පහසුකමක් හෝ යන්ත්‍රයක් අක්‍රිය වී ඇත්නම් වහාම නඩත්තු අංශයට දැනුම් දෙන්න.'
                : 'Report facility breakdowns, AC faults, electrical or plumbing issues directly to maintenance.'}
            </p>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/40 blue-glow transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('reportProblem')}</span>
          </button>
        </div>

        {/* Subtle decorative glow circle */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#111724] border border-blue-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('myReports')}</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">{reports.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111724] border border-amber-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('activeTickets')}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-amber-300 tracking-tight">{activeCount}</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#111724] border border-emerald-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('resolvedTickets')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-300 tracking-tight">{resolvedCount}</span>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-[#111724]/90 rounded-3xl border border-blue-500/20 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white">
              {t('myReports')}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-500/30">
              {reports.length}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${t('ticketNumber')}, ${t('facility')}...`}
              className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {(['all', 'new', 'in_progress', 'resolved', 'closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#151b2a] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? (language === 'si' ? 'සියල්ල' : 'All') : t(`status_${st}` as any)}
            </button>
          ))}
        </div>

        {/* List of Reports */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <span className="animate-pulse">{t('loading')}</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-3">
              <Building2 className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-slate-400 font-medium">{t('noReportsYet')}</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                {t('noReportsHint')}
              </p>
              <button
                onClick={() => setReportModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold border border-blue-500/30 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('reportProblem')}</span>
              </button>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="p-4 rounded-2xl bg-[#141b2a] border border-slate-800/80 hover:border-blue-500/40 cursor-pointer transition-all hover:bg-[#161e2f] group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {report.ticketId}
                      </span>
                      {getStatusBadge(report.status)}
                      {getPriorityBadge(report.priority)}
                    </div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {report.facilityName} - {report.categoryName}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 mt-3 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatReport(report);
                    }}
                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-600/10 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('messages')}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals & Drawers */}
      <ReportProblemModal
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onReportCreated={handleReportCreated}
      />

      <ReportDetailModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onOpenChat={(rep) => setChatReport(rep)}
      />

      <ChatDrawer
        report={chatReport}
        isOpen={Boolean(chatReport)}
        onClose={() => setChatReport(null)}
      />
    </div>
  );
};
