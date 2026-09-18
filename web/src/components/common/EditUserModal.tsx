import React, { useState, useEffect } from 'react';
import { UserProfile, Department, UserRole, AccountStatus } from '../../types';
import { updateUserProfileDetails } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { X, User, Mail, Phone, Briefcase, Badge, Shield, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface EditUserModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  departments?: Department[];
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaved,
  departments = []
}) => {
  const { currentUser, t, language } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('approved');
  const [departmentId, setDepartmentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentRole = currentUser?.role || 'worker';
  const targetRole = user?.role || 'worker';

  // Strict role-based editing rule:
  // - Worker only can edit Worker accounts
  // - Staff only can edit Staff & Worker accounts
  // - Super Admin can edit all accounts
  const canEditTargetUser = (() => {
    if (!currentUser || !user) return false;
    if (currentRole === 'super_admin') return true;
    if (currentRole === 'staff') return targetRole === 'staff' || targetRole === 'worker';
    if (currentRole === 'worker') return targetRole === 'worker';
    return false;
  })();

  // Allowed role selection options based on logged in user's role:
  const allowedRoleOptions = (() => {
    if (currentRole === 'super_admin') {
      return [
        { value: 'worker', label: t('worker') },
        { value: 'staff', label: t('staff') },
        { value: 'super_admin', label: t('superAdmin') }
      ];
    }
    if (currentRole === 'staff') {
      return [
        { value: 'worker', label: t('worker') },
        { value: 'staff', label: t('staff') }
      ];
    }
    // Worker
    return [
      { value: 'worker', label: t('worker') }
    ];
  })();

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setEmployeeId(user.employeeId || '');
      setRole(user.role || 'worker');
      setAccountStatus(user.accountStatus || 'approved');
      setDepartmentId(user.departmentId || '');
      setError(null);
      setSuccess(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEditTargetUser) {
      setError(
        language === 'si'
          ? 'ඔබට මෙම ගිණුම සංස්කරණය කිරීමට අවසර නොමැත.'
          : 'Access Denied: You do not have permission to edit this account.'
      );
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError(language === 'si' ? 'නම සහ විද්‍යුත් තැපෑල ඇතුළත් කිරීම අනිවාර්ය වේ.' : 'Name and email are required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const dept = departments.find(d => d.id === departmentId);
      const departmentName = dept ? (language === 'si' ? dept.nameSi : dept.name) : user.departmentName;

      await updateUserProfileDetails(user.uid, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        employeeId: employeeId.trim(),
        role: currentRole === 'worker' ? 'worker' : role, // Workers cannot change roles
        accountStatus: currentRole === 'worker' ? user.accountStatus : accountStatus,
        departmentId,
        departmentName
      });

      setSuccess(language === 'si' ? 'ගිණුමේ තොරතුරු සාර්ථකව යාවත්කාලීන කරන ලදී!' : 'Account details updated successfully!');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err?.message || (language === 'si' ? 'ගිණුම යාවත්කාලීන කිරීම අසාර්ථක විය.' : 'Failed to update account.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#111724] border border-blue-500/30 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {language === 'si' ? 'ගිණුම සංස්කරණය' : 'Edit Account'}
              </h3>
              <p className="text-xs text-slate-400">
                Editing: <span className="font-semibold text-blue-300">{user.name}</span> ({targetRole})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!canEditTargetUser ? (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Lock className="w-4 h-4 text-red-400" />
              <span>Permission Restricted</span>
            </div>
            <p>
              {currentRole === 'worker'
                ? 'Workers can only edit Worker accounts.'
                : currentRole === 'staff'
                ? 'Staff members can only edit Staff and Worker accounts.'
                : 'You do not have permission to edit this user.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('fullName')} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#182133] border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('email')} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#182133] border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Role & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('role')}
                </label>
                <select
                  value={role}
                  disabled={currentRole === 'worker'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[#182133] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none disabled:opacity-50"
                >
                  {allowedRoleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('status')}
                </label>
                <select
                  value={accountStatus}
                  disabled={currentRole === 'worker'}
                  onChange={(e) => setAccountStatus(e.target.value as AccountStatus)}
                  className="w-full bg-[#182133] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none disabled:opacity-50"
                >
                  <option value="approved">{t('approved')}</option>
                  <option value="pending">{t('pending')}</option>
                  <option value="rejected">{t('rejected')}</option>
                  <option value="disabled">{t('disabled')}</option>
                </select>
              </div>
            </div>

            {/* Employee ID & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('employeeId')}
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-[#182133] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('phoneNumber')}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#182133] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Department */}
            {departments.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('department')}
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-[#182133] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                >
                  <option value="">-- {language === 'si' ? 'තෝරන්න' : 'Select Department'} --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {language === 'si' ? d.nameSi : d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {saving ? (language === 'si' ? 'සුරකිමින්...' : 'Saving...') : t('save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
