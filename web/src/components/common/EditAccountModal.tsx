import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, AccountStatus, Department } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  updateUserAccount, 
  deleteUserAccount, 
  getDepartments,
  SUPER_ADMIN_EMAIL 
} from '../../services/firebase';
import { 
  X, 
  Save, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Shield, 
  UserCheck, 
  HardHat, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface EditAccountModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserProfile) => void;
  onUserDeleted?: (uid: string) => void;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated,
  onUserDeleted
}) => {
  const { currentUser, refreshUser, t, language } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('approved');
  const [departmentId, setDepartmentId] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getDepartments().then(setDepartments);
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setEmployeeId(user.employeeId || '');
        setRole(user.role || 'worker');
        setAccountStatus(user.accountStatus || 'approved');
        setDepartmentId(user.departmentId || '');
      }
      setError(null);
      setConfirmDelete(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isSelf = currentUser?.uid === user.uid;
  const currentRole = currentUser?.role || 'worker';
  const targetRole = user.role || 'worker';

  // Role-based permission check:
  // - Worker only can edit worker accounts
  // - Staff only can edit staff & worker accounts
  // - Super Admin can edit all accounts
  const canEditTargetUser = (() => {
    if (!currentUser || !user) return false;
    if (currentRole === 'super_admin') return true;
    if (currentRole === 'staff') return targetRole === 'staff' || targetRole === 'worker';
    if (currentRole === 'worker') return targetRole === 'worker';
    return false;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEditTargetUser) {
      setError('Access Denied: You do not have permission to edit this account type.');
      return;
    }

    if (!name.trim()) {
      setError(language === 'si' ? 'කරුණාකර නම ඇතුලත් කරන්න.' : 'Name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const dept = departments.find(d => d.id === departmentId);
      const deptName = dept ? (language === 'si' ? dept.nameSi : dept.name) : undefined;

      const payload: Partial<UserProfile> & { uid: string } = {
        uid: user.uid,
        name: name.trim(),
        phone: phone.trim(),
        employeeId: employeeId.trim() || undefined,
      };

      // Super Admin can edit email, role, department, and account status
      if (isSuperAdmin) {
        payload.email = email.trim().toLowerCase();
        payload.role = role;
        payload.accountStatus = accountStatus;
        if (role === 'staff') {
          payload.departmentId = departmentId || undefined;
          payload.departmentName = deptName;
        } else if (role === 'super_admin') {
          payload.departmentName = 'Executive Administration';
        }
      }

      const updated = await updateUserAccount(payload);
      
      if (isSelf) {
        await refreshUser();
      }

      onUserUpdated(updated);
      onClose();
    } catch (err: any) {
      console.error('Update account error:', err);
      setError(err?.message || (language === 'si' ? 'ගිණුම යාවත්කාලීන කිරීම අසාර්ථක විය.' : 'Failed to update account.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || isSelf) return;
    try {
      setSaving(true);
      await deleteUserAccount(user.uid);
      if (onUserDeleted) {
        onUserDeleted(user.uid);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111726] border border-blue-500/30 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#0e1422] border-b border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isSelf 
                  ? (language === 'si' ? 'මගේ ගිණුම සංස්කරණය' : 'Edit My Profile') 
                  : (language === 'si' ? 'ගිණුම් සංස්කරණය' : 'Edit User Account')}
              </h3>
              <p className="text-[11px] text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[65vh] text-xs">
          {/* Full Name */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {t('fullName')} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-3 py-2.5 text-white outline-none"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {t('email')} {isSuperAdmin ? '*' : ''}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isSuperAdmin}
                required
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 disabled:opacity-60 rounded-xl pl-10 pr-3 py-2.5 text-white outline-none"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {t('phoneNumber')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-3 py-2.5 text-white outline-none"
              />
            </div>
          </div>

          {/* Employee ID */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {t('employeeId')}
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP-104"
              className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-white outline-none"
            />
          </div>

          {/* Super Admin Advanced Privileges: Role, Status, Department */}
          {isSuperAdmin && (
            <div className="pt-3 border-t border-slate-800 space-y-3.5">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>{language === 'si' ? 'පරිපාලක පාලනය (Admin Privileges)' : 'Administrative Controls'}</span>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  {t('role')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'worker', label: t('worker'), icon: HardHat, color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40' },
                    { id: 'staff', label: t('staff'), icon: UserCheck, color: 'text-blue-300 border-blue-500/40 bg-blue-950/40' },
                    { id: 'super_admin', label: 'Super Admin', icon: Shield, color: 'text-purple-300 border-purple-500/40 bg-purple-950/40' },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setRole(r.id as UserRole)}
                        className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? `${r.color} ring-2 ring-blue-500/60 shadow-lg`
                            : 'border-slate-800 bg-[#161c2b] text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] truncate">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Department (if staff) */}
              {role === 'staff' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    {t('department')}
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-white outline-none"
                  >
                    <option value="">{t('selectDepartment')}</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {language === 'si' ? d.nameSi : d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Account Status */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  {t('status')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['approved', 'pending', 'rejected', 'disabled'] as AccountStatus[]).map((st) => {
                    const isSelected = accountStatus === st;
                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setAccountStatus(st)}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold capitalize transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30'
                            : 'bg-[#161c2b] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t(st as any)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Delete Danger Zone for Super Admin */}
          {isSuperAdmin && !isSelf && (
            <div className="pt-4 border-t border-red-900/30">
              {confirmDelete ? (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs space-y-2">
                  <p className="text-red-300 font-medium">
                    {language === 'si' ? 'මෙම ගිණුම සදහටම මකා දැමීමට ඔබට සහතිකද?' : 'Are you sure you want to permanently delete this user?'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2 rounded-xl bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-500/20 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'si' ? 'ගිණුම ඉවත් කරන්න' : 'Delete Account'}</span>
                </button>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? t('submitting') : t('save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
