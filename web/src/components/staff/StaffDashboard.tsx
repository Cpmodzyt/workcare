import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProblemReport, UserProfile } from '../../types';
import { getReports } from '../../services/firebase';
import { StaffReportDetailModal } from './StaffReportDetailModal';
import { ChatDrawer } from '../messaging/ChatDrawer';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  MessageSquare, 
  ChevronRight, 
  Calendar, 
  UserCheck, 
  ShieldAlert, 
  User, 
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { currentUser, t, language } = useAuth();
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ProblemReport | null>(null);
  const [chatReport, setChatReport] = useState<ProblemReport | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'me' | 'unassigned'>('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const all = await getReports();
      setReports(all);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // CHECK PENDING STATUS
  if (currentUser?.accountStatus === 'pending') {
    return (
      <div className="max-w-xl mx-auto p-6 my-12 text-center">
        <div className="bg-[#111724] border border-amber-500/30 rounded-3xl p-8 shadow-2xl blue-glow space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t('pendingApprovalTitle')}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t('pendingApprovalMsg')}
          </p>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 text-left">
            <div><strong>{t('fullName')}:</strong> {currentUser.name}</div>
            <div><strong>{t('email')}:</strong> {currentUser.email}</div>
            <div><strong>{t('employeeId')}:</strong> {currentUser.employeeId || 'N/A'}</div>
            <div><strong>{t('department')}:</strong> {currentUser.departmentName || 'Operations'}</div>
          </div>
        </div>
      </div>
    );
  }

  // CHECK REJECTED STATUS
  if (currentUser?.accountStatus === 'rejected') {
    return (
      <div className="max-w-xl mx-auto p-6 my-12 text-center">
        <div className="bg-[#111724] border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t('accountRejectedTitle')}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t('accountRejectedMsg')}
          </p>
        </div>
      </div>
    );
  }

  const newCount = reports.filter(r => r.status === 'new').length;
  const inProgressCount = reports.filter(r => r.status === 'in_progress').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const urgentCount = reports.filter(r => r.priority === 'urgent' && r.status !== 'closed' && r.status !== 'resolved').length;

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
    
    let matchesAssignment = true;
    if (assignmentFilter === 'me') {
      matchesAssignment = r.assignedStaffId === currentUser?.uid;
    } else if (assignmentFilter === 'unassigned') {
      matchesAssignment = !r.assignedStaffId;
    }

    return matchesSearch && matchesStatus && matchesAssignment;
  });

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
        return <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40">● {t('priority_urgent')}</span>;
      case 'high':
        return <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">● {t('priority_high')}</span>;
      case 'medium':
        return <span className="text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/40">● {t('priority_medium')}</span>;
      default:
        return <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">● {t('priority_low')}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {t('staffDashboard')}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30">
              {currentUser?.departmentName || 'Maintenance'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'si'
              ? 'ලැබෙන වාර්තා සමාලෝචනය කරන්න, තත්ත්වය වෙනස් කරන්න සහ සේවකයින්ට සෘජුවම පිළිතුරු දෙන්න.'
              : 'Review incoming reports, manage status workflows, and communicate directly with workers.'}
          </p>
        </div>
      </div>

      {/* KPI Cards: New, In Progress, Resolved, Urgent */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#111724] border border-blue-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('newReports')}</span>
            <AlertTriangle className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-blue-400 tracking-tight">{newCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111724] border border-amber-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('inProgressReports')}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-amber-300 tracking-tight">{inProgressCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111724] border border-emerald-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('resolvedReports')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-300 tracking-tight">{resolvedCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111724] border border-rose-500/30 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t('urgentReports')}</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold text-rose-400 tracking-tight">{urgentCount}</span>
        </div>
      </div>

      {/* Reports Management Table / List */}
      <div className="bg-[#111724]/90 rounded-3xl border border-blue-500/20 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white">
              {t('recentReports')}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-500/30">
              {filteredReports.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, facility, worker..."
                className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            {/* Assignment filter */}
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value as any)}
              className="bg-[#161c2b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            >
              <option value="all">{language === 'si' ? 'සියලු පැවරුම්' : 'All Assignments'}</option>
              <option value="me">{t('assignedToMe')}</option>
              <option value="unassigned">{t('unassigned')}</option>
            </select>
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

        {/* Reports List */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <span className="animate-pulse">{t('loading')}</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-slate-400">{language === 'si' ? 'ගැලපෙන වාර්තා නොමැත' : 'No matching reports found'}</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="p-4 rounded-2xl bg-[#141b2a] border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all hover:bg-[#161f31] group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {report.ticketId}
                      </span>
                      {getStatusBadge(report.status)}
                      {getPriorityBadge(report.priority)}
                      <span className="text-[11px] text-slate-400">
                        • {report.facilityName}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {report.categoryName}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        {report.workerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      {report.assignedStaffName ? (
                        <span className="text-emerald-400 font-medium">
                          Assigned: {report.assignedStaffName}
                        </span>
                      ) : (
                        <span className="text-amber-400/80 font-medium">
                          {t('unassigned')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatReport(report);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium border border-blue-500/30 flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t('messages')}</span>
                    </button>

                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-all"
                    >
                      <span>{t('openReport')}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <StaffReportDetailModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onReportUpdated={(updated) => {
          setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
          setSelectedReport(updated);
        }}
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
