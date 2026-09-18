import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendPasswordReset } from '../../services/firebase';
import { KeyRound, Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBackToLogin }) => {
  const { t, language } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      await sendPasswordReset(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || (language === 'si' ? 'ඊමේල් යැවීමට නොහැකි විය.' : 'Failed to send reset link.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111724]/90 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl blue-glow">
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToLogin')}</span>
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-2">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {t('resetPassword')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'si'
                ? 'ඔබගේ ගිණුමේ විද්‍යුත් තැපැල් ලිපිනය ඇතුලත් කරන්න. අපි මුරපදය නැවත සකසන සබැඳියක් එවන්නෙමු.'
                : 'Enter your registered email address to receive password reset instructions.'}
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs text-center space-y-3">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p>
                {language === 'si'
                  ? 'මුරපද යළි පිහිටුවීමේ සබැඳිය ඔබගේ විද්‍යුත් තැපෑලට යවා ඇත. කරුණාකර Inbox සහ Spam පරීක්ෂා කරන්න.'
                  : 'Password reset link sent to your email. Please check your inbox and spam folder.'}
              </p>
              <button
                onClick={onBackToLogin}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500"
              >
                {t('backToLogin')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

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
                    className="w-full bg-[#161c2b] border border-slate-700/80 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {loading ? <span>{t('loading')}</span> : <span>{t('sendResetLink')}</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
