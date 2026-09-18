import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SUPER_ADMIN_EMAIL } from '../../services/firebase';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  HardHat, 
  UserCheck, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface LoginScreenProps {
  onGoToWorkerRegister: () => void;
  onGoToStaffRegister: () => void;
  onGoToForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoToWorkerRegister,
  onGoToStaffRegister,
  onGoToForgotPassword
}) => {
  const { login, t, language } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Secret unhide for Supervisor Registration
  const [clickCount, setClickCount] = useState(0);
  const [showSupervisor, setShowSupervisor] = useState(() => {
    return window.location.href.includes('supervisor') || window.location.search.includes('supervisor') || window.location.hash.includes('supervisor');
  });

  const handleTitleClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount >= 5) {
      setShowSupervisor(true);
      setError(language === 'si' ? 'අධීක්ෂක ලියාපදිංචි කිරීමේ ක්‍රමය සක්‍රිය කරන ලදී!' : 'Supervisor registration enabled!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(language === 'si' ? 'කරුණාකර විද්‍යුත් තැපෑල සහ මුරපදය ඇතුලත් කරන්න.' : 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || (language === 'si' ? 'ඇතුල්වීම අසාර්ථක විය.' : 'Login failed. Please check credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (targetEmail: string, targetPass: string = 'password123') => {
    setEmail(targetEmail);
    setPassword(targetPass);
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-[#111724]/90 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl blue-glow">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-blue-500/20 mb-3 shadow-lg shadow-blue-900/30">
              <svg className="w-8 h-8" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="c_gradient_login" x1="26" y1="82" x2="82" y2="26" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <path d="M 76,32 A 28,28 0 1,0 76,76" stroke="url(#c_gradient_login)" strokeWidth="10" strokeLinecap="round"/>
                <path d="M 40,44 L 54,60 L 68,44" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 onClick={handleTitleClick} className="text-2xl font-bold tracking-tight text-white cursor-pointer select-none hover:text-blue-400 transition-colors">
              Work Care
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t('appSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {t('password')}
                </label>
                <button
                  type="button"
                  onClick={onGoToForgotPassword}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {t('forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>{t('loading')}</span>
              ) : (
                <>
                  <span>{t('loginButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Options */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5">
            {localStorage.getItem('sys_reg_restriction') !== 'supervisor_only' ? (
              <button
                onClick={onGoToWorkerRegister}
                className="w-full py-2.5 px-3 rounded-xl bg-[#141b2b] hover:bg-[#1a2338] border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                <HardHat className="w-4 h-4" />
                <span>{t('workerRegister')}</span>
              </button>
            ) : (
              <p className="text-[11px] text-center text-amber-500/80 font-medium py-1">
                ⚠️ Worker self-registration is disabled by Administrator.
              </p>
            )}

            <button
              onClick={onGoToStaffRegister}
              className="w-full py-2.5 px-3 rounded-xl bg-[#141b2b] hover:bg-[#1a2338] border border-blue-500/20 hover:border-blue-500/40 text-blue-300 text-xs font-medium flex items-center justify-center gap-2 transition-all animate-fade-in"
            >
              <UserCheck className="w-4 h-4" />
              <span>{t('staffRegister')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
