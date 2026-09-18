import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HardHat, User, Mail, Lock, Phone, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Building2, Badge } from 'lucide-react';

interface WorkerRegisterScreenProps {
  onBackToLogin: () => void;
}

export const WorkerRegisterScreen: React.FC<WorkerRegisterScreenProps> = ({ onBackToLogin }) => {
  const { registerWorkerAccount, t, language, checkCompanyExists } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError(language === 'si' ? 'කරුණාකර අවශ්‍ය සියලු තොරතුරු පුරවන්න.' : 'Please fill all required fields.');
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

    try {
      setLoading(true);
      setError(null);
      const exists = await checkCompanyExists(companyId);
      if (!exists) {
        setError(language === 'si' ? 'අවලංගු සමාගම් හැඳුනුම්පතකි.' : 'Invalid Company ID.');
        setLoading(false);
        return;
      }
      await registerWorkerAccount(name, email, password, phone, companyName, companyId);
    } catch (err: any) {
      setError(err?.message || (language === 'si' ? 'ලියාපදිංචි වීම අසාර්ථක විය.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111724]/90 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl blue-glow">
          {/* Back button */}
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToLogin')}</span>
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 mb-2">
              <HardHat className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {t('workerRegister')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'si'
                ? 'පහසුකම් හා යන්ත්‍රෝපකරණ ගැටළු ක්ෂණිකව වාර්තා කිරීමට සේවක ගිණුමක් සාදන්න'
                : 'Create a worker account to report facility problems quickly'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  required
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Company ID *
              </label>
              <div className="relative">
                <Badge className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="ID-12345"
                  required
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('fullName')} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kavindu Perera"
                  required
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('email')} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kavindu@company.com"
                  required
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('phoneNumber')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="077 123 4567"
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('password')} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'si' ? 'මුරපදය තහවුරු කරන්න' : 'Confirm Password'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>{t('loading')}</span>
              ) : (
                <>
                  <span>{t('registerWorker')}</span>
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
