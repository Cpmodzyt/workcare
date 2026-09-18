import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDepartments } from '../../services/firebase';
import { Department } from '../../types';
import { UserCheck, User, Mail, Lock, Phone, Briefcase, ArrowLeft, ArrowRight, AlertCircle, Info } from 'lucide-react';

interface StaffRegisterScreenProps {
  onBackToLogin: () => void;
}

export const StaffRegisterScreen: React.FC<StaffRegisterScreenProps> = ({ onBackToLogin }) => {
  const { submitStaffRegistration, t, language, checkCompanyExists } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDepts = async () => {
      const depts = await getDepartments();
      setDepartments(depts);
      if (depts.length > 0) {
        setSelectedDeptId(depts[0].id);
      }
    };
    loadDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !employeeId || !password || !selectedDeptId || !companyName || !companyId) {
      setError(language === 'si' ? 'කරුණාකර සියලුම අනිවාර්ය තොරතුරු සපයන්න.' : 'Please provide all required fields.');
      return;
    }

    if (password.length < 6) {
      setError(language === 'si' ? 'මුරපදය අවම වශයෙන් අක්ෂර 6ක් විය යුතුය.' : 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'si' ? 'මුරපද දෙක නොගැලපේ.' : 'Passwords do not match.');
      return;
    }

    const dept = departments.find(d => d.id === selectedDeptId);
    const deptName = dept ? (language === 'si' ? dept.nameSi : dept.name) : 'Operations';

    try {
      setLoading(true);
      setError(null);
      const exists = await checkCompanyExists(companyId);
      if (!exists) {
        setError(language === 'si' ? 'අවලංගු සමාගම් හැඳුනුම්පතකි.' : 'Invalid Company ID.');
        setLoading(false);
        return;
      }
      await submitStaffRegistration(name, email, password, employeeId, phone, selectedDeptId, deptName, companyName, companyId);
    } catch (err: any) {
      setError(err?.message || (language === 'si' ? 'ඉල්ලීම යොමු කිරීම අසාර්ථක විය.' : 'Submission failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111724]/90 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl blue-glow">
          {/* Back button */}
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToLogin')}</span>
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-2">
              <UserCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {t('staffRegister')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'si'
                ? 'කාර්යමණ්ඩල අයදුම්පත යොමු කිරීමෙන් පසු ප්‍රධාන පරිපාලක (Super Admin) අනුමැතිය අවශ්‍ය වේ'
                : 'Staff registration requires Super Admin approval before access is granted'}
            </p>
          </div>

          <div className="mb-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <span>
              {language === 'si'
                ? 'අනුමැතිය ලැබෙන තෙක් ඔබගේ තත්ත්වය "Pending Approval" ලෙස පවතින අතර අනුමත වූ වහාම පිවිසුම් අවසරය හිමිවේ.'
                : 'Your account will be in "Pending" status until approved by Super Admin. You cannot access dashboard until approved.'}
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('fullName')} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sunil Dissanayake"
                  required
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('employeeId')} *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="EMP-1084"
                    required
                    className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('phoneNumber')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="071 987 6543"
                    className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('companyEmail')} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff.name@company.com"
                  required
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('department')} *
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                required
                className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-[#101522]">
                    {language === 'si' ? dept.nameSi : dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('password')} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    required
                    className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'si' ? 'තහවුරු කරන්න' : 'Confirm'} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    required
                    className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>{t('loading')}</span>
              ) : (
                <>
                  <span>{t('submitStaffRequest')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
