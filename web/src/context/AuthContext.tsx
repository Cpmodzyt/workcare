import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import { translations, getTranslation } from '../i18n';
import { 
  loginWithEmail, 
  registerWorker, 
  submitStaffRequest, 
  getUserProfile, 
  isFirebaseConfigured,
  SUPER_ADMIN_EMAIL,
  checkCompanyExists
} from '../services/firebase';
import { requestNotificationPermissionAndGetToken } from '../services/fcm';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  login: (email: string, pass: string) => Promise<void>;
  registerWorkerAccount: (name: string, email: string, pass: string, phone: string, companyName: string, companyId: string) => Promise<void>;
  submitStaffRegistration: (name: string, email: string, pass: string, employeeId: string, phone: string, deptId: string, deptName: string, companyName: string, companyId: string) => Promise<void>;
  checkCompanyExists: (companyId: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isFirebaseConnected: boolean;
  isConfigModalOpen: boolean;
  setConfigModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'facility_hub_session_user';
const LANGUAGE_KEY = 'facility_hub_lang';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(LANGUAGE_KEY) as Language) || 'si'; // Default to Sinhala per user instruction
  });
  const [isConfigModalOpen, setConfigModalOpen] = useState(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  const t = (key: keyof typeof translations['en']) => {
    return getTranslation(language, key);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUid = localStorage.getItem(CURRENT_USER_KEY);
        if (storedUid) {
          const profile = await getUserProfile(storedUid);
          if (profile) {
            setCurrentUser(profile);
          } else {
            localStorage.removeItem(CURRENT_USER_KEY);
          }
        }
      } catch (err) {
        console.warn('Auth init failed:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const user = await loginWithEmail(email, pass);
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, user.uid);
    requestNotificationPermissionAndGetToken();
  };

  const registerWorkerAccount = async (name: string, email: string, pass: string, phone: string, companyName: string, companyId: string) => {
    const user = await registerWorker(name, email, pass, phone, companyName, companyId);
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, user.uid);
    requestNotificationPermissionAndGetToken();
  };

  const submitStaffRegistration = async (
    name: string, 
    email: string, 
    pass: string, 
    employeeId: string, 
    phone: string, 
    deptId: string, 
    deptName: string,
    companyName: string,
    companyId: string
  ) => {
    const user = await submitStaffRequest(name, email, pass, employeeId, phone, deptId, deptName, companyName, companyId);
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, user.uid);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const refreshUser = async () => {
    if (currentUser?.uid) {
      const refreshed = await getUserProfile(currentUser.uid);
      if (refreshed) {
        setCurrentUser(refreshed);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        language,
        setLanguage,
        t,
        login,
        registerWorkerAccount,
        submitStaffRegistration,
        checkCompanyExists,
        logout,
        refreshUser,
        isFirebaseConnected: isFirebaseConfigured(),
        isConfigModalOpen,
        setConfigModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
