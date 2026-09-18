import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useAuth();

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-[#121826] p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-blue-500/20 text-xs shrink-0">
      <button
        onClick={() => setLanguage('si')}
        className={`px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-medium transition-all flex items-center justify-center text-[11px] sm:text-xs ${
          language === 'si'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
            : 'text-slate-400 hover:text-white'
        }`}
        title="සිංහල"
      >
        <span>සිං</span>
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-medium transition-all flex items-center justify-center text-[11px] sm:text-xs ${
          language === 'en'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
            : 'text-slate-400 hover:text-white'
        }`}
        title="English"
      >
        <span>EN</span>
      </button>
    </div>
  );
};
