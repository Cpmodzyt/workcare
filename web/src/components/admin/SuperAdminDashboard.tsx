import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  UserProfile, 
  ProblemReport, 
  Facility, 
  Department, 
  ProblemCategory,
  AccountStatus 
} from '../../types';
import { 
  getAllUsers, 
  getReports, 
  getFacilities, 
  saveFacility, 
  getDepartments, 
  saveDepartment, 
  getProblemCategories, 
  saveProblemCategory,
  approveStaffAccount, 
  rejectStaffAccount, 
  setStaffAccountStatus, 
  changeStaffDepartment,
  updateReportStatus,
  SUPER_ADMIN_EMAIL,
  registerCompany
} from '../../services/firebase';
import { StaffReportDetailModal } from '../staff/StaffReportDetailModal';
import { ChatDrawer } from '../messaging/ChatDrawer';
import { UserProfileModal } from '../common/UserProfileModal';
import { EditUserModal } from '../common/EditUserModal';
import { 
  Shield, 
  Users, 
  UserCheck, 
  HardHat, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Settings, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Briefcase, 
  Calendar, 
  Lock, 
  Unlock,
  ShieldAlert,
  ChevronRight,
  Database,
  User,
  Info
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { currentUser, t, language, setConfigModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'staff' | 'workers' | 'reports' | 'facilities' | 'departments' | 'categories' | 'settings'>('overview');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [selectedReport, setSelectedReport] = useState<ProblemReport | null>(null);
  const [chatReport, setChatReport] = useState<ProblemReport | null>(null);
  const [inspectedUser, setInspectedUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Forms for adding facility, department, category
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityNameSi, setNewFacilityNameSi] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptNameSi, setNewDeptNameSi] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameSi, setNewCatNameSi] = useState('');
  const [newCatDeptId, setNewCatDeptId] = useState('');
  const [newCompName, setNewCompName] = useState('');
  const [newCompId, setNewCompId] = useState('');

  // Department change dialog
  const [changingStaff, setChangingStaff] = useState<UserProfile | null>(null);
  const [targetDeptId, setTargetDeptId] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [u, r, f, d, c] = await Promise.all([
        getAllUsers(),
        getReports(),
        getFacilities(),
        getDepartments(),
        getProblemCategories()
      ]);
      setUsers(u);
      setReports(r);
      setFacilities(f);
      setDepartments(d);
      setCategories(c);
      if (d.length > 0) {
        setNewCatDeptId(d[0].id);
        setTargetDeptId(d[0].id);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingStaff = users.filter(u => u.role === 'staff' && u.accountStatus === 'pending');
  const allStaff = users.filter(u => u.role === 'staff' || u.role === 'super_admin');
  const allWorkers = users.filter(u => u.role === 'worker');

  const newReportsCount = reports.filter(r => r.status === 'new').length;
  const inProgressCount = reports.filter(r => r.status === 'in_progress').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const urgentCount = reports.filter(r => r.priority === 'urgent' && r.status !== 'closed' && r.status !== 'resolved').length;

  // Actions
  const handleApprove = async (staffUid: string) => {
    if (!currentUser) return;
    await approveStaffAccount(staffUid, currentUser.name);
    await loadAllAdminData();
  };

  const handleReject = async (staffUid: string) => {
    if (!currentUser) return;
    await rejectStaffAccount(staffUid, currentUser.name);
    await loadAllAdminData();
  };

  const handleToggleStaffStatus = async (staff: UserProfile) => {
    const newStatus: AccountStatus = staff.accountStatus === 'approved' ? 'disabled' : 'approved';
    await setStaffAccountStatus(staff.uid, newStatus);
    await loadAllAdminData();
  };

  const handleRemoveStaff = async (staffUid: string) => {
    await setStaffAccountStatus(staffUid, 'disabled');
    await loadAllAdminData();
  };

  const handleConfirmDeptChange = async () => {
    if (!changingStaff || !targetDeptId) return;
    const dept = departments.find(d => d.id === targetDeptId);
    const deptName = dept ? (language === 'si' ? dept.nameSi : dept.name) : 'Department';
    await changeStaffDepartment(changingStaff.uid, targetDeptId, deptName);
    setChangingStaff(null);
    await loadAllAdminData();
  };

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacilityName) return;
    const fac: Facility = {
      id: 'fac-' + Date.now().toString(36),
      name: newFacilityName.trim(),
      nameSi: newFacilityNameSi.trim() || newFacilityName.trim(),
      active: true
    };
    await saveFacility(fac);
    setNewFacilityName('');
    setNewFacilityNameSi('');
    await loadAllAdminData();
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;
    const dept: Department = {
      id: 'dept-' + Date.now().toString(36),
      name: newDeptName.trim(),
      nameSi: newDeptNameSi.trim() || newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase()
    };
    await saveDepartment(dept);
    setNewDeptName('');
    setNewDeptNameSi('');
    setNewDeptCode('');
    await loadAllAdminData();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatDeptId) return;
    const dept = departments.find(d => d.id === newCatDeptId);
    const cat: ProblemCategory = {
      id: 'cat-' + Date.now().toString(36),
      name: newCatName.trim(),
      nameSi: newCatNameSi.trim() || newCatName.trim(),
      departmentId: newCatDeptId,
      departmentName: dept?.name
    };
    await saveProblemCategory(cat);
    setNewCatName('');
    setNewCatNameSi('');
    await loadAllAdminData();
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName || !newCompId) return;
    try {
      await registerCompany(newCompName, newCompId);
      setNewCompName('');
      setNewCompId('');
      alert('Company registered successfully!');
    } catch (e) {
      alert('Error registering company: ' + e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Admin Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#141224] via-[#101426] to-[#0d1220] p-6 rounded-3xl border border-purple-500/30 shadow-2xl blue-glow">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Shield className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('adminDashboard')}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {language === 'si'
              ? 'සමස්ත පද්ධතිය, කාර්යමණ්ඩල අනුමැතිය, දෙපාර්තමේන්තු, ස්ථාන සහ ගැටළු වාර්තා පාලනය කරන්න.'
              : 'Full administrative control over staff approvals, workers, facilities, problem routing, and ticketing.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingStaff.length > 0 && (
            <button
              onClick={() => setActiveTab('approvals')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{pendingStaff.length} {t('pendingStaffApprovals')}</span>
            </button>
          )}
          <button
            onClick={() => setConfigModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Firebase</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
        <div className="p-3.5 rounded-2xl bg-[#111724] border border-blue-500/20 shadow-md">
          <span className="text-[11px] text-slate-400 block mb-1">{t('totalWorkers')}</span>
          <span className="text-xl font-bold text-white">{allWorkers.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111724] border border-blue-500/20 shadow-md">
          <span className="text-[11px] text-slate-400 block mb-1">{t('totalStaff')}</span>
          <span className="text-xl font-bold text-blue-300">{allStaff.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111724] border border-amber-500/30 shadow-md">
          <span className="text-[11px] text-amber-400 font-medium block mb-1">{t('pendingStaffApprovals')}</span>
          <span className="text-xl font-bold text-amber-300">{pendingStaff.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111724] border border-blue-500/20 shadow-md">
          <span className="text-[11px] text-slate-400 block mb-1">{t('newReports')}</span>
          <span className="text-xl font-bold text-blue-400">{newReportsCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111724] border border-amber-500/20 shadow-md">
          <span className="text-[11px] text-slate-400 block mb-1">{t('inProgressReports')}</span>
          <span className="text-xl font-bold text-amber-300">{inProgressCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111724] border border-emerald-500/20 shadow-md">
          <span className="text-[11px] text-slate-400 block mb-1">{t('resolvedReports')}</span>
          <span className="text-xl font-bold text-emerald-300">{resolvedCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111724] border border-rose-500/30 shadow-md col-span-2 sm:col-span-1">
          <span className="text-[11px] text-rose-400 font-medium block mb-1">{t('urgentReports')}</span>
          <span className="text-xl font-bold text-rose-400">{urgentCount}</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-blue-900/30 text-xs">
        {[
          { id: 'overview', label: language === 'si' ? 'සාරාංශය' : 'Overview', icon: Shield },
          { id: 'approvals', label: `${t('staffApprovalSection')} (${pendingStaff.length})`, icon: UserCheck, alert: pendingStaff.length > 0 },
          { id: 'staff', label: t('staffManagement'), icon: Users },
          { id: 'workers', label: t('workerManagement'), icon: HardHat },
          { id: 'reports', label: t('allReports'), icon: AlertTriangle },
          { id: 'facilities', label: t('facilitiesManagement'), icon: Building2 },
          { id: 'departments', label: t('departmentsManagement'), icon: Briefcase },
          { id: 'categories', label: t('problemCategories'), icon: Settings },
          { id: 'settings', label: language === 'si' ? 'පද්ධති පාලනය' : 'System Control', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-2xl font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-[#121826] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.alert && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. STAFF APPROVAL TAB */}
      {(activeTab === 'approvals' || activeTab === 'overview') && (
        <div className="bg-[#111724]/90 rounded-3xl border border-blue-500/20 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-base text-white">
                {t('staffApprovalSection')}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {pendingStaff.length} {language === 'si' ? 'අනුමැතිය අපේක්ෂාවෙන්' : 'pending'}
            </span>
          </div>

          {pendingStaff.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
              <p>{t('noPendingStaff')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingStaff.map((staff) => (
                <div
                  key={staff.uid}
                  className="p-4 rounded-2xl bg-[#141b2a] border border-amber-500/30 shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{staff.name}</h4>
                      <p className="text-xs text-blue-300">{staff.email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-500/40">
                      {t('pending')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="p-2 rounded-xl bg-[#182133]">
                      <span className="text-[10px] text-slate-400 block">{t('employeeId')}</span>
                      <span className="font-medium">{staff.employeeId || 'N/A'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#182133]">
                      <span className="text-[10px] text-slate-400 block">{t('department')}</span>
                      <span className="font-medium">{staff.departmentName || 'General'}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{staff.phone || 'No phone'}</span>
                    <span>{new Date(staff.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleReject(staff.uid)}
                      className="flex-1 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t('reject')}</span>
                    </button>
                    <button
                      onClick={() => handleApprove(staff.uid)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('approve')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. STAFF MANAGEMENT TAB */}
      {activeTab === 'staff' && (
        <div className="bg-[#111724]/90 rounded-3xl border border-blue-500/20 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">{t('staffManagement')}</h3>
            <span className="text-xs text-slate-400">{allStaff.length} staff members</span>
          </div>

          <div className="space-y-3">
            {allStaff.map((staff) => (
              <div
                key={staff.uid}
                className="p-4 rounded-2xl bg-[#141b2a] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectedUser(staff)}
                      className="font-semibold text-sm text-white hover:text-blue-300 text-left transition-colors flex items-center gap-1.5"
                    >
                      <span>{staff.name}</span>
                      <Info className="w-3.5 h-3.5 text-blue-400 opacity-60" />
                    </button>
                    {staff.role === 'super_admin' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
                        Super Admin
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        staff.accountStatus === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : staff.accountStatus === 'pending'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : 'bg-red-950 text-red-300 border border-red-500/30'
                      }`}>
                        {t(staff.accountStatus as any)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>{staff.email}</span>
                    <span>• {staff.employeeId || 'No ID'}</span>
                    <span className="text-blue-300 font-medium">• {staff.departmentName || 'Operations'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingUser(staff)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    title="Edit User Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{language === 'si' ? 'සංස්කරණය' : 'Edit'}</span>
                  </button>

                  {staff.role !== 'super_admin' && (
                    <>
                      <button
                        onClick={() => setChangingStaff(staff)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        {t('changeDepartment')}
                      </button>
                      <button
                        onClick={() => handleToggleStaffStatus(staff)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 ${
                          staff.accountStatus === 'approved'
                            ? 'bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/30'
                            : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {staff.accountStatus === 'approved' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{staff.accountStatus === 'approved' ? t('disable') : t('reactivate')}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WORKER MANAGEMENT TAB */}
      {activeTab === 'workers' && (
        <div className="bg-[#111724]/90 rounded-3xl border border-blue-500/20 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">{t('workerManagement')}</h3>
            <span className="text-xs text-slate-400">{allWorkers.length} workers registered</span>
          </div>

          <div className="space-y-2.5">
            {allWorkers.map((w) => (
              <div
                key={w.uid}
                className="p-3.5 rounded-2xl bg-[#141b2a] border border-slate-800 hover:border-blue-500/40 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => setInspectedUser(w)}
                    className="font-semibold text-white hover:text-blue-300 text-left flex items-center gap-1.5 transition-colors"
                  >
                    <span>{w.name}</span>
                    <Info className="w-3.5 h-3.5 text-blue-400 opacity-60" />
                  </button>
                  <p className="text-slate-400 text-[11px] mt-0.5">{w.email} {w.phone && `• ${w.phone}`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-slate-400 hidden sm:block">
                    <span className="text-emerald-400 font-medium block">Approved</span>
                    <span className="text-[10px]">{new Date(w.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => setEditingUser(w)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{language === 'si' ? 'සංස්කරණය' : 'Edit'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ALL REPORTS TAB */}
      {(activeTab === 'reports' || activeTab === 'overview') && (
        <div className="bg-[#111724]/90 rounded-3xl border border-blue-500/20 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">{t('allReports')}</h3>
            <span className="text-xs text-slate-400">{reports.length} total reports</span>
          </div>

          <div className="space-y-2.5">
            {reports.slice(0, 10).map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className="p-3.5 rounded-2xl bg-[#141b2a] border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400 font-bold">{rep.ticketId}</span>
                    <span className="text-white font-medium">{rep.facilityName} - {rep.categoryName}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{rep.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="capitalize px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                    {rep.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatReport(rep);
                    }}
                    className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FACILITIES TAB */}
      {activeTab === 'facilities' && (
        <div className="bg-[#111724]/90 rounded-3xl border border-blue-500/20 p-5 sm:p-6 shadow-xl space-y-5">
          <h3 className="font-bold text-base text-white">{t('facilitiesManagement')}</h3>

          {/* Add form */}
          <form onSubmit={handleAddFacility} className="p-4 rounded-2xl bg-[#141b2a] border border-blue-500/20 space-y-3">
            <h4 className="text-xs font-semibold text-blue-300">{t('addFacility')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newFacilityName}
                onChange={(e) => setNewFacilityName(e.target.value)}
                placeholder={t('facilityName')}
                required
                className="bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <input
                type="text"
                value={newFacilityNameSi}
                onChange={(e) => setNewFacilityNameSi(e.target.value)}
                placeholder={t('facilityNameSi')}
                className="bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addFacility')}</span>
            </button>
          </form>

          {/* List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {facilities.map((f) => (
              <div key={f.id} className="p-3 rounded-2xl bg-[#141b2a] border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">{f.name}</h4>
                  <p className="text-[11px] text-slate-400">{f.nameSi}</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. DEPARTMENTS TAB */}
      {activeTab === 'departments' && (
        <div className="bg-[#111724]/90 rounded-3xl border border-blue-500/20 p-5 sm:p-6 shadow-xl space-y-5">
          <h3 className="font-bold text-base text-white">{t('departmentsManagement')}</h3>

          <form onSubmit={handleAddDepartment} className="p-4 rounded-2xl bg-[#141b2a] border border-blue-500/20 space-y-3">
            <h4 className="text-xs font-semibold text-blue-300">{t('addDepartment')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder={t('departmentName')}
                required
                className="bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <input
                type="text"
                value={newDeptNameSi}
                onChange={(e) => setNewDeptNameSi(e.target.value)}
                placeholder={t('departmentNameSi')}
                className="bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <input
                type="text"
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
                placeholder={t('deptCode')}
                required
                className="bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addDepartment')}</span>
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {departments.map((d) => (
              <div key={d.id} className="p-3 rounded-2xl bg-[#141b2a] border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">{d.name} ({d.code})</h4>
                  <p className="text-[11px] text-slate-400">{d.nameSi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. PROBLEM CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="bg-[#111724]/90 rounded-3xl border border-blue-500/20 p-5 sm:p-6 shadow-xl space-y-5">
          <h3 className="font-bold text-base text-white">{t('problemCategories')}</h3>

          <form onSubmit={handleAddCategory} className="p-4 rounded-2xl bg-[#141b2a] border border-blue-500/20 space-y-3">
            <h4 className="text-xs font-semibold text-blue-300">{t('addCategory')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder={t('categoryName')}
                required
                className="bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <input
                type="text"
                value={newCatNameSi}
                onChange={(e) => setNewCatNameSi(e.target.value)}
                placeholder={t('categoryNameSi')}
                className="bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <select
                value={newCatDeptId}
                onChange={(e) => setNewCatDeptId(e.target.value)}
                className="bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addCategory')}</span>
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categories.map((c) => (
              <div key={c.id} className="p-3 rounded-2xl bg-[#141b2a] border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">{c.name}</h4>
                  <p className="text-[11px] text-slate-400">{c.nameSi}</p>
                </div>
                <span className="text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-500/30">
                  {c.departmentName || 'Dept'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. SYSTEM SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-[#111724]/90 rounded-3xl border border-blue-500/20 p-5 sm:p-6 shadow-xl space-y-6">
          <div>
            <h3 className="font-bold text-base text-white">System Settings & Controls</h3>
            <p className="text-xs text-slate-400 mt-1">Configure global application security policies and registration rules.</p>
          </div>

          <form onSubmit={handleAddCompany} className="p-5 rounded-2xl bg-[#141b2a] border border-blue-500/20 space-y-3">
             <h4 className="text-sm font-semibold text-blue-300">Register New Company</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <input type="text" value={newCompName} onChange={(e) => setNewCompName(e.target.value)} placeholder="Company Name" required className="bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
               <input type="text" value={newCompId} onChange={(e) => setNewCompId(e.target.value)} placeholder="Company ID" required className="bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
             </div>
             <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs">Register Company</button>
          </form>

          <div className="p-5 rounded-2xl bg-[#141b2a] border border-blue-500/20 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Restrict Registration Flow
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-md leading-relaxed">
                  Enable this policy to strictly permit Supervisor/Staff registrations only. When enabled, new Worker registrations from the login screen are disabled.
                </p>
              </div>
              
              <button
                onClick={() => {
                  const current = localStorage.getItem('sys_reg_restriction') || 'all';
                  const next = current === 'supervisor_only' ? 'all' : 'supervisor_only';
                  localStorage.setItem('sys_reg_restriction', next);
                  // Force re-render of component
                  setReports([...reports]); 
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  localStorage.getItem('sys_reg_restriction') === 'supervisor_only'
                    ? 'bg-amber-950/45 text-amber-300 border-amber-500/40 hover:bg-amber-900/50'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {localStorage.getItem('sys_reg_restriction') === 'supervisor_only' ? 'Supervisor Only Enabled' : 'Allow All Registrations'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Change Modal */}
      {changingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111724] border border-blue-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-white">
              {t('changeDepartment')} - {changingStaff.name}
            </h3>
            <select
              value={targetDeptId}
              onChange={(e) => setTargetDeptId(e.target.value)}
              className="w-full bg-[#182133] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setChangingStaff(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmDeptChange}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
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

      {/* User Profile Inspector Modal */}
      <UserProfileModal
        user={inspectedUser}
        isOpen={Boolean(inspectedUser)}
        onClose={() => setInspectedUser(null)}
        onEditAccount={(u) => setEditingUser(u)}
      />

      {/* Account Edit Modal */}
      <EditUserModal
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSaved={() => loadAllAdminData()}
        departments={departments}
      />
    </div>
  );
};
