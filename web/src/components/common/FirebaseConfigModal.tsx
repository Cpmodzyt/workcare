import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getSavedFirebaseConfig, 
  initializeFirebaseServices, 
  isFirebaseLive,
  seedDefaultMasterData 
} from '../../services/firebase';
import { Database, CheckCircle, AlertCircle, X, Shield, Key, Copy, RefreshCw } from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { isConfigModalOpen: ctxOpen, setConfigModalOpen, t, language } = useAuth();
  const isVisible = isOpen !== undefined ? isOpen : ctxOpen;
  const handleClose = onClose || (() => setConfigModalOpen(false));

  const currentConfig = getSavedFirebaseConfig();

  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [projectId, setProjectId] = useState(currentConfig?.projectId || '');
  const [authDomain, setAuthDomain] = useState(currentConfig?.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig?.appId || '');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isVisible) return null;

  const handleSave = () => {
    if (!apiKey || !projectId) {
      setStatusMessage(language === 'si' ? 'කරුණාකර අවම වශයෙන් API Key සහ Project ID ඇතුලත් කරන්න.' : 'Please provide at least API Key and Project ID.');
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    localStorage.setItem('facility_hub_firebase_config', JSON.stringify(config));
    const success = initializeFirebaseServices(config);

    if (success) {
      setStatusMessage(language === 'si' ? 'Firebase සාර්ථකව සම්බන්ධ විය!' : 'Connected to Firebase successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setStatusMessage(language === 'si' ? 'Firebase වෙත සම්බන්ධ වීමට නොහැකි විය. අගයන් පරීක්ෂා කරන්න.' : 'Could not initialize Firebase with given parameters.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#101522] border border-blue-500/30 rounded-2xl w-full max-w-xl p-6 shadow-2xl blue-glow text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">
                {language === 'si' ? 'Firebase වින්‍යාසය සහ සම්බන්ධතාවය' : 'Firebase Configuration & Status'}
              </h3>
              <p className="text-xs text-slate-400">
                {isFirebaseLive() ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {language === 'si' ? 'Firebase Cloud සක්‍රීයයි' : 'Firebase Live Cloud Active'}
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {language === 'si' ? 'Firebase සම්බන්ධතාවය අවශ්‍යයි' : 'Firebase Connection Required'}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4 text-sm">
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'si'
              ? 'ඔබගේ Firebase Console වෙතින් ලබාගත් වෙබ් වින්‍යාසය මෙහි ඇතුලත් කිරීමෙන් සජීවී Firebase Authentication, Firestore, Storage සහ Cloud Messaging සක්‍රිය කරගත හැක.'
              : 'Enter your web configuration from Firebase Console to connect live Firebase Authentication, Firestore, Storage, and Cloud Messaging.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="facility-hub-123"
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="facility-hub.firebaseapp.com"
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Storage Bucket</label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="facility-hub.appspot.com"
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Messaging Sender ID</label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                placeholder="1029384756"
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">App ID</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:1029384756:web:abcd123"
                className="w-full bg-[#161c2b] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/30 text-xs text-blue-300">
              {statusMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setConfigModalOpen(false)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              {language === 'si' ? 'වසන්න' : 'Close'}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
            >
              {language === 'si' ? 'සම්බන්ධ කරන්න' : 'Connect Firebase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
