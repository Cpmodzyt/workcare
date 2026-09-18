import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  Firestore 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { 
  UserProfile, 
  ProblemReport, 
  ChatMessage, 
  Facility, 
  Department, 
  ProblemCategory, 
  AppNotification, 
  UserRole, 
  AccountStatus 
} from '../types';

export const SUPER_ADMIN_EMAILS = ["itzmecp@gmail.com", "thenuralakshan36@gmail.com"];
export const SUPER_ADMIN_EMAIL = "itzmecp@gmail.com";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBqyRXV-Q3T60CmEG7pGVmIFHZMlg2TfmI",
  authDomain: "work-care-caf39.firebaseapp.com",
  projectId: "work-care-caf39",
  storageBucket: "work-care-caf39.firebasestorage.app",
  messagingSenderId: "217095469052",
  appId: "1:217095469052:web:5b01de93f07679a4b9e479"
};

// Check stored or environment config
export function getSavedFirebaseConfig(): FirebaseConfig | null {
  try {
    const stored = localStorage.getItem('facility_hub_firebase_config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading saved firebase config', e);
  }

  const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envKey && envProjectId) {
    return {
      apiKey: envKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

export function initializeFirebaseServices(customConfig?: FirebaseConfig): boolean {
  try {
    const config = customConfig || getSavedFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) {
      return false;
    }

    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }

    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
    try {
      firebaseStorage = getStorage(firebaseApp);
    } catch {
      // Storage optional
    }
    return true;
  } catch (error) {
    console.warn('Firebase init warning:', error);
    return false;
  }
}

// Try auto-init
initializeFirebaseServices();

export const isFirebaseLive = () => Boolean(firestoreDb && firebaseAuth);
export const isFirebaseConfigured = isFirebaseLive;

/* =========================================================================
   LOCAL OFFLINE / FALLBACK MOCK DATA ENGINE (Ensures 100% offline & seamless demo)
   ========================================================================= */

const LOCAL_STORAGE_USERS = 'facility_hub_mock_users';
const LOCAL_STORAGE_REPORTS = 'facility_hub_mock_reports';
const LOCAL_STORAGE_MESSAGES = 'facility_hub_mock_messages';
const LOCAL_STORAGE_FACILITIES = 'facility_hub_mock_facilities';
const LOCAL_STORAGE_DEPARTMENTS = 'facility_hub_mock_departments';
const LOCAL_STORAGE_CATEGORIES = 'facility_hub_mock_categories';
const LOCAL_STORAGE_NOTIFICATIONS = 'facility_hub_mock_notifications';

// Seed default initial master data
export function seedDefaultMasterData() {
  if (!localStorage.getItem(LOCAL_STORAGE_FACILITIES)) {
    const defaultFacilities: Facility[] = [
      { id: 'fac-1', name: 'Main Factory Complex', nameSi: 'ප්‍රධාන කර්මාන්තශාලා සංකීර්ණය', description: 'Production lines A, B, C and loading bays', active: true },
      { id: 'fac-2', name: 'Corporate Office Building', nameSi: 'ප්‍රධාන කාර්යාල ගොඩනැගිල්ල', description: 'Floors 1 to 4 and Conference suites', active: true },
      { id: 'fac-3', name: 'Staff Accommodation Village', nameSi: 'සේවක නේවාසිකාගාර සංකීර්ණය', description: 'Blocks 1-6 residential units', active: true },
      { id: 'fac-4', name: 'Logistics & Transport Depot', nameSi: 'ප්‍රවාහන හා සැපයුම් අංගනය', description: 'Fleet maintenance and vehicle bays', active: true },
      { id: 'fac-5', name: 'Central Canteen & Kitchen', nameSi: 'මධ්‍යම ආපනශාලාව හා මුළුතැන්ගෙය', description: 'Main dining hall & food prep area', active: true },
      { id: 'fac-6', name: 'Storage Warehouse A & B', nameSi: 'ගබඩා සංකීර්ණය A සහ B', description: 'Raw materials and finished goods inventory', active: true },
    ];
    localStorage.setItem(LOCAL_STORAGE_FACILITIES, JSON.stringify(defaultFacilities));
  }

  if (!localStorage.getItem(LOCAL_STORAGE_DEPARTMENTS)) {
    const defaultDepartments: Department[] = [
      { id: 'dept-maint', name: 'Electrical & Mechanical Maintenance', nameSi: 'විදුලි හා යාන්ත්‍රික නඩත්තු අංශය', code: 'MAINT', description: 'Handles power, machines, pumps, HVAC' },
      { id: 'dept-hvac', name: 'HVAC & Air Conditioning', nameSi: 'වායුසමීකරණ හා වාතාශ්‍ර අංශය', code: 'HVAC', description: 'Air conditioning, chillers and cooling towers' },
      { id: 'dept-facility', name: 'Civil & Facilities / Cleaning', nameSi: 'සිවිල් හා සනීපාරක්ෂක නඩත්තු අංශය', code: 'CIVIL', description: 'Plumbing, toilets, cleaning, civil repairs' },
      { id: 'dept-safety', name: 'Health, Safety & Environment (HSE)', nameSi: 'සෞඛ්‍ය, ආරක්ෂාව හා පරිසර අංශය (HSE)', code: 'HSE', description: 'Fire alarms, chemical safety, workplace hazards' },
      { id: 'dept-it', name: 'IT Infrastructure & Telecom', nameSi: 'තොරතුරු තාක්ෂණ හා සන්නිවේදන අංශය', code: 'IT', description: 'Internet, Wi-Fi, CCTV, office equipment' },
      { id: 'dept-hr', name: 'Human Resources & Welfare', nameSi: 'මානව සම්පත් හා සුභසාධන අංශය', code: 'HR', description: 'Accommodation, transport, meals, general welfare' },
    ];
    localStorage.setItem(LOCAL_STORAGE_DEPARTMENTS, JSON.stringify(defaultDepartments));
  }

  if (!localStorage.getItem(LOCAL_STORAGE_CATEGORIES)) {
    const defaultCategories: ProblemCategory[] = [
      { id: 'cat-1', name: 'Electricity & Lighting', nameSi: 'විදුලිය හා ආලෝකකරණය', departmentId: 'dept-maint', departmentName: 'Electrical & Mechanical Maintenance', icon: 'zap' },
      { id: 'cat-2', name: 'Water & Plumbing', nameSi: 'ජල සැපයුම හා නළ පද්ධති', departmentId: 'dept-facility', departmentName: 'Civil & Facilities / Cleaning', icon: 'droplet' },
      { id: 'cat-3', name: 'Air Conditioning & Cooling', nameSi: 'වායුසමීකරණ යන්ත්‍ර (AC)', departmentId: 'dept-hvac', departmentName: 'HVAC & Air Conditioning', icon: 'fan' },
      { id: 'cat-4', name: 'Equipment / Machinery Breakdown', nameSi: 'යන්ත්‍රෝපකරණ ක්‍රියා විරහිතවීම්', departmentId: 'dept-maint', departmentName: 'Electrical & Mechanical Maintenance', icon: 'wrench' },
      { id: 'cat-5', name: 'Cleaning & Janitorial', nameSi: 'පිරිසිදු කිරීම් හා කසළ බැහැර කිරීම', departmentId: 'dept-facility', departmentName: 'Civil & Facilities / Cleaning', icon: 'trash-2' },
      { id: 'cat-6', name: 'Toilet & Restroom Facilities', nameSi: 'වැසිකිලි හා සනීපාරක්ෂක පහසුකම්', departmentId: 'dept-facility', departmentName: 'Civil & Facilities / Cleaning', icon: 'bath' },
      { id: 'cat-7', name: 'Safety Hazard / Emergency', nameSi: 'ආරක්ෂක අනතුරු හා හදිසි ආපදා', departmentId: 'dept-safety', departmentName: 'Health, Safety & Environment (HSE)', icon: 'shield-alert' },
      { id: 'cat-8', name: 'Internet / Wi-Fi / CCTV', nameSi: 'අන්තර්ජාලය / Wi-Fi / CCTV', departmentId: 'dept-it', departmentName: 'IT Infrastructure & Telecom', icon: 'wifi' },
      { id: 'cat-9', name: 'Transport / Vehicle', nameSi: 'ප්‍රවාහන හා වාහන ගැටළු', departmentId: 'dept-hr', departmentName: 'Human Resources & Welfare', icon: 'truck' },
      { id: 'cat-10', name: 'Other Facility Issues', nameSi: 'වෙනත් පහසුකම් ගැටළු', departmentId: 'dept-facility', departmentName: 'Civil & Facilities / Cleaning', icon: 'help-circle' },
    ];
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(defaultCategories));
  }

  // Pre-seed default accounts if not present
  const usersStr = localStorage.getItem(LOCAL_STORAGE_USERS);
  let users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
  
  SUPER_ADMIN_EMAILS.forEach((adminEmail, idx) => {
    if (!users.some(u => u.email.toLowerCase() === adminEmail.toLowerCase())) {
      users.push({
        uid: `admin-${idx}`,
        name: idx === 0 ? 'Itzmecp (Super Admin)' : 'Thenuralakshan (Super Admin)',
        email: adminEmail,
        role: 'super_admin',
        accountStatus: 'approved',
        employeeId: `ADMIN-00${idx + 1}`,
        phone: '+94 77 123 4567',
        departmentName: 'Executive Administration',
        createdAt: new Date().toISOString(),
        approvedBy: 'SYSTEM',
        approvedAt: new Date().toISOString()
      });
    }
  });

  localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));

  // Pre-seed sample problem reports if empty
  if (!localStorage.getItem(LOCAL_STORAGE_REPORTS)) {
    localStorage.setItem(LOCAL_STORAGE_REPORTS, JSON.stringify([]));
  }

  // Pre-seed sample chat messages if empty
  if (!localStorage.getItem(LOCAL_STORAGE_MESSAGES)) {
    localStorage.setItem(LOCAL_STORAGE_MESSAGES, JSON.stringify([]));
  }
}

seedDefaultMasterData();

/* =========================================================================
   USER AUTHENTICATION & PROFILE METHODS
   ========================================================================= */

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseLive() && firestoreDb) {
    try {
      const snap = await getDoc(doc(firestoreDb, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn('Error reading from Firestore, checking fallback:', e);
    }
  }

  const users: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS) || '[]');
  return users.find(u => u.uid === uid) || null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (SUPER_ADMIN_EMAILS.includes(profile.email.toLowerCase())) {
    profile.role = 'super_admin';
    profile.accountStatus = 'approved';
  }

  if (isFirebaseLive() && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'users', profile.uid), profile, { merge: true });
    } catch (e) {
      console.warn('Firestore setDoc failed, saving to local fallback:', e);
    }
  }

  const users: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS) || '[]');
  const idx = users.findIndex(u => u.uid === profile.uid || u.email.toLowerCase() === profile.email.toLowerCase());
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...profile };
  } else {
    users.push(profile);
  }
  localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));
}

export async function updateUserProfileDetails(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const users: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS) || '[]');
  const idx = users.findIndex(u => u.uid === uid);
  
  if (idx < 0) {
    throw new Error('User not found');
  }

  const updatedUser = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
  users[idx] = updatedUser;
  localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));

  if (isFirebaseLive() && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'users', uid), updatedUser, { merge: true });
    } catch (e) {
      console.warn('Firestore setDoc failed for updateUserProfileDetails, saved locally:', e);
    }
  }

  return updatedUser;
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = SUPER_ADMIN_EMAILS.includes(cleanEmail);
  
  // Verify correct admin passwords
  if (cleanEmail === "itzmecp@gmail.com" && pass !== "Itzmecp@2007") {
    throw new Error("Invalid password for Super Admin.");
  }
  if (cleanEmail === "thenuralakshan36@gmail.com" && pass !== "thenuralakshan36") {
    throw new Error("Invalid password for Super Admin.");
  }

  if (isFirebaseLive() && firebaseAuth) {
    try {
      let cred;
      try {
        cred = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, pass);
      } catch (authError: any) {
        // If user-not-found or doesn't exist, auto-create the super admin in firebase auth!
        if (isAdmin && (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password')) {
          try {
            cred = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, pass);
          } catch (createErr) {
            throw authError; // throw original if create fails
          }
        } else {
          throw authError;
        }
      }

      if (cred) {
        let profile = await getUserProfile(cred.user.uid);
        if (!profile || isAdmin) {
          profile = {
            uid: cred.user.uid,
            name: cleanEmail === "itzmecp@gmail.com" ? "Itzmecp (Super Admin)" : "Thenuralakshan (Super Admin)",
            email: cleanEmail,
            role: isAdmin ? 'super_admin' : 'worker',
            accountStatus: 'approved',
            employeeId: isAdmin ? 'ADMIN-001' : 'WRK-' + cred.user.uid.substring(0, 5).toUpperCase(),
            phone: '+94 77 123 4567',
            departmentName: isAdmin ? 'Executive Administration' : 'Operations',
            createdAt: new Date().toISOString(),
          };
          await saveUserProfile(profile);
        }
        return profile;
      }
    } catch (e: any) {
      console.warn('Firebase login warning, checking local database:', e);
    }
  }

  // Local fallback auth
  const users: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS) || '[]');
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (user) {
    if (isAdmin) {
      user.role = 'super_admin';
      user.accountStatus = 'approved';
    }
    return user;
  }

  if (isAdmin) {
    const adminProfile: UserProfile = {
      uid: cleanEmail === "itzmecp@gmail.com" ? 'admin-itzmecp' : 'admin-thenuralakshan',
      name: cleanEmail === "itzmecp@gmail.com" ? "Itzmecp (Super Admin)" : "Thenuralakshan (Super Admin)",
      email: cleanEmail,
      role: 'super_admin',
      accountStatus: 'approved',
      employeeId: cleanEmail === "itzmecp@gmail.com" ? 'ADMIN-001' : 'ADMIN-002',
      phone: '+94 77 123 4567',
      departmentName: 'Executive Administration',
      createdAt: new Date().toISOString(),
      approvedBy: 'SYSTEM',
      approvedAt: new Date().toISOString()
    };
    await saveUserProfile(adminProfile);
    return adminProfile;
  }

  throw new Error('Invalid email or password. Please verify your credentials or register an account.');
}

export async function registerWorker(name: string, email: string, pass: string, phone: string, companyName: string, companyId: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = SUPER_ADMIN_EMAILS.includes(cleanEmail);
  const uid = 'worker-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

  if (isFirebaseLive() && firebaseAuth) {
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, pass);
      const profile: UserProfile = {
        uid: cred.user.uid,
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        companyName: companyName.trim(),
        companyId: companyId.trim(),
        role: isAdmin ? 'super_admin' : 'worker',
        accountStatus: 'approved',
        createdAt: new Date().toISOString(),
      };
      await saveUserProfile(profile);
      return profile;
    } catch (e: any) {
      console.warn('Firebase registration failed, using local fallback:', e);
    }
  }

  const profile: UserProfile = {
    uid,
    name: name.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    companyName: companyName.trim(),
    companyId: companyId.trim(),
    role: isAdmin ? 'super_admin' : 'worker',
    accountStatus: 'approved',
    createdAt: new Date().toISOString(),
  };
  await saveUserProfile(profile);
  return profile;
}

export async function submitStaffRequest(
  name: string, 
  email: string, 
  pass: string, 
  employeeId: string, 
  phone: string, 
  departmentId: string,
  departmentName: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const uid = 'staff-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

  const isAdmin = SUPER_ADMIN_EMAILS.includes(cleanEmail);

  const profile: UserProfile = {
    uid,
    name: name.trim(),
    email: cleanEmail,
    employeeId: employeeId.trim(),
    phone: phone.trim(),
    departmentId,
    departmentName,
    role: isAdmin ? 'super_admin' : 'staff',
    accountStatus: isAdmin ? 'approved' : 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseLive() && firebaseAuth) {
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, pass);
      profile.uid = cred.user.uid;
    } catch (e) {
      console.warn('Firebase staff creation warning:', e);
    }
  }

  await saveUserProfile(profile);

  // Notify Super Admin of staff registration request
  await notifySuperAdminStaffRequest(profile);

  return profile;
}

export async function registerCompany(companyName: string, companyId: string): Promise<void> {
  if (isFirebaseLive() && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'companies', companyId.trim()), {
        name: companyName.trim(),
        id: companyId.trim(),
        registeredAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error registering company', e);
      throw e;
    }
  }
}

export async function checkCompanyExists(companyId: string): Promise<boolean> {
  if (isFirebaseLive() && firestoreDb) {
    try {
      const snap = await getDoc(doc(firestoreDb, 'companies', companyId.trim()));
      return snap.exists();
    } catch (e) {
      console.error('Error checking company', e);
      return false;
    }
  }
  return true; // Fallback to true if not live
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (isFirebaseLive() && firebaseAuth) {
    await sendPasswordResetEmail(firebaseAuth, email.trim().toLowerCase());
  }
}

/* =========================================================================
   REPORTS & TICKETING
   ========================================================================= */

export async function generateTicketId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const reports = await getReports();
  const thisYearReports = reports.filter(r => r.ticketId && r.ticketId.includes(`PROB-${currentYear}`));
  const seq = (thisYearReports.length + 1).toString().padStart(4, '0');
  return `PROB-${currentYear}-${seq}`;
}

export async function createReport(reportData: Omit<ProblemReport, 'id' | 'ticketId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ProblemReport> {
  const ticketId = await generateTicketId();
  const now = new Date().toISOString();
  const newReport: ProblemReport = {
    ...reportData,
    id: 'rep-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    ticketId,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseLive() && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'reports', newReport.id), newReport);
    } catch (e) {
      console.warn('Firestore report write error:', e);
    }
  }

  const reports: ProblemReport[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS) || '[]');
  reports.unshift(newReport);
  localStorage.setItem(LOCAL_STORAGE_REPORTS, JSON.stringify(reports));

  // Trigger notification to relevant staff & admin
  await notifyNewReportCreated(newReport);

  return newReport;
}

export async function getReports(): Promise<ProblemReport[]> {
  if (isFirebaseLive() && firestoreDb) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'reports'));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as ProblemReport).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (e) {
      console.warn('Firestore read error:', e);
    }
  }

  const reports: ProblemReport[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS) || '[]');
  return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateReportStatus(reportId: string, status: ProblemReport['status']): Promise<void> {
  const now = new Date().toISOString();
  const updates: Partial<ProblemReport> = { status, updatedAt: now };
  if (status === 'resolved' || status === 'closed') {
    updates.resolvedAt = now;
  }

  if (isFirebaseLive() && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'reports', reportId), updates);
    } catch (e) {
      console.warn('Firestore update status failed:', e);
    }
  }

  const reports: ProblemReport[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS) || '[]');
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx >= 0) {
    reports[idx] = { ...reports[idx], ...updates };
    localStorage.setItem(LOCAL_STORAGE_REPORTS, JSON.stringify(reports));
    
    // Notify worker that status changed
    await notifyStatusChange(reports[idx]);
  }
}

export async function updateReportPriority(reportId: string, priority: ProblemReport['priority']): Promise<void> {
  const now = new Date().toISOString();
  const updates = { priority, updatedAt: now };

  if (isFirebaseLive() && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'reports', reportId), updates);
    } catch (e) {
      console.warn('Firestore priority update failed:', e);
    }
  }

  const reports: ProblemReport[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS) || '[]');
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx >= 0) {
    reports[idx] = { ...reports[idx], ...updates };
    localStorage.setItem(LOCAL_STORAGE_REPORTS, JSON.stringify(reports));
  }
}

export async function assignReportStaff(reportId: string, staffId: string, staffName: string): Promise<void> {
  const now = new Date().toISOString();
  const updates = { assignedStaffId: staffId, assignedStaffName: staffName, updatedAt: now };

  if (isFirebaseLive() && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'reports', reportId), updates);
    } catch (e) {
      console.warn('Firestore assign failed:', e);
    }
  }

  const reports: ProblemReport[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS) || '[]');
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx >= 0) {
    reports[idx] = { ...reports[idx], ...updates };
    localStorage.setItem(LOCAL_STORAGE_REPORTS, JSON.stringify(reports));
  }
}

export async function saveInternalNotes(reportId: string, notes: string): Promise<void> {
  const now = new Date().toISOString();
  const updates = { internalNotes: notes, updatedAt: now };

  if (isFirebaseLive() && firestoreDb) {
    try {
      await updateDoc(doc(firestoreDb, 'reports', reportId), updates);
    } catch (e) {
      console.warn('Firestore notes update failed:', e);
    }
  }

  const reports: ProblemReport[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS) || '[]');
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx >= 0) {
    reports[idx] = { ...reports[idx], ...updates };
    localStorage.setItem(LOCAL_STORAGE_REPORTS, JSON.stringify(reports));
  }
}

/* =========================================================================
   MESSAGING (PER PROBLEM REPORT CONVERSATION)
   ========================================================================= */

export async function getReportMessages(reportId: string): Promise<ChatMessage[]> {
  if (isFirebaseLive() && firestoreDb) {
    try {
      const q = query(
        collection(firestoreDb, 'messages'),
        where('reportId', '==', reportId),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as ChatMessage);
      }
    } catch (e) {
      console.warn('Firestore messages read failed:', e);
    }
  }

  const allMessages: ChatMessage[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MESSAGES) || '[]');
  return allMessages.filter(m => m.reportId === reportId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function sendChatMessage(
  reportId: string,
  sender: UserProfile,
  messageText: string,
  attachmentUrl?: string
): Promise<ChatMessage> {
  const msg: ChatMessage = {
    id: 'msg-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    reportId,
    senderId: sender.uid,
    senderName: sender.name,
    senderRole: sender.role,
    message: messageText.trim(),
    attachmentUrl,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseLive() && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'messages', msg.id), msg);
    } catch (e) {
      console.warn('Firestore msg write failed:', e);
    }
  }

  const allMessages: ChatMessage[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MESSAGES) || '[]');
  allMessages.push(msg);
  localStorage.setItem(LOCAL_STORAGE_MESSAGES, JSON.stringify(allMessages));

  // Notify counterpart
  const reports = await getReports();
  const report = reports.find(r => r.id === reportId);
  if (report) {
    if (sender.role === 'worker') {
      // Notify staff
      await createNotification({
        recipientId: report.assignedStaffId || 'all_staff',
        title: `New message on ${report.ticketId}`,
        titleSi: `${report.ticketId} සඳහා සේවකයාගෙන් නව පණිවිඩයක්`,
        body: `${sender.name}: ${msg.message.substring(0, 80)}`,
        bodySi: `${sender.name}: ${msg.message.substring(0, 80)}`,
        type: 'new_message',
        reportId: report.id,
      });
    } else {
      // Notify worker
      await createNotification({
        recipientId: report.workerId,
        title: `Staff replied to ${report.ticketId}`,
        titleSi: `${report.ticketId} වාර්තාවට කාර්යමණ්ඩලයෙන් පිළිතුරක්`,
        body: `${sender.name} (${sender.role}): ${msg.message.substring(0, 80)}`,
        bodySi: `${sender.name}: ${msg.message.substring(0, 80)}`,
        type: 'new_message',
        reportId: report.id,
      });
    }
  }

  return msg;
}

/* =========================================================================
   MASTER DATA (FACILITIES, DEPARTMENTS, CATEGORIES)
   ========================================================================= */

export async function getFacilities(): Promise<Facility[]> {
  const facs: Facility[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_FACILITIES) || '[]');
  return facs;
}

export async function saveFacility(facility: Facility): Promise<void> {
  const facs = await getFacilities();
  const idx = facs.findIndex(f => f.id === facility.id);
  if (idx >= 0) {
    facs[idx] = facility;
  } else {
    facs.push(facility);
  }
  localStorage.setItem(LOCAL_STORAGE_FACILITIES, JSON.stringify(facs));
}

export async function getDepartments(): Promise<Department[]> {
  const depts: Department[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DEPARTMENTS) || '[]');
  return depts;
}

export async function saveDepartment(department: Department): Promise<void> {
  const depts = await getDepartments();
  const idx = depts.findIndex(d => d.id === department.id);
  if (idx >= 0) {
    depts[idx] = department;
  } else {
    depts.push(department);
  }
  localStorage.setItem(LOCAL_STORAGE_DEPARTMENTS, JSON.stringify(depts));
}

export async function getProblemCategories(): Promise<ProblemCategory[]> {
  const cats: ProblemCategory[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES) || '[]');
  return cats;
}

export async function saveProblemCategory(cat: ProblemCategory): Promise<void> {
  const cats = await getProblemCategories();
  const idx = cats.findIndex(c => c.id === cat.id);
  if (idx >= 0) {
    cats[idx] = cat;
  } else {
    cats.push(cat);
  }
  localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(cats));
}

/* =========================================================================
   SUPER ADMIN STAFF APPROVAL & STAFF MANAGEMENT
   ========================================================================= */

export async function getAllUsers(): Promise<UserProfile[]> {
  const users: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS) || '[]');
  return users;
}

export async function approveStaffAccount(uid: string, adminName: string): Promise<void> {
  const users = await getAllUsers();
  const idx = users.findIndex(u => u.uid === uid);
  if (idx >= 0) {
    users[idx].accountStatus = 'approved';
    users[idx].approvedBy = adminName;
    users[idx].approvedAt = new Date().toISOString();
    localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));

    if (isFirebaseLive() && firestoreDb) {
      try {
        await updateDoc(doc(firestoreDb, 'users', uid), {
          accountStatus: 'approved',
          approvedBy: adminName,
          approvedAt: users[idx].approvedAt
        });
      } catch (e) {
        console.warn('Firestore approve user error:', e);
      }
    }

    // Notify staff member
    await createNotification({
      recipientId: uid,
      title: 'Staff Registration Approved!',
      titleSi: 'කාර්යමණ්ඩල ගිණුම අනුමත කරන ලදී!',
      body: 'Your staff account has been approved by Super Admin. You now have full access to the Staff Dashboard.',
      bodySi: 'ඔබගේ කාර්යමණ්ඩල ගිණුම ප්‍රධාන පරිපාලක විසින් අනුමත කර ඇත. දැන් ඔබට මෙහෙයුම් පුවරුවට ප්‍රවේශ විය හැක.',
      type: 'staff_approved'
    });
  }
}

export async function rejectStaffAccount(uid: string, adminName: string): Promise<void> {
  const users = await getAllUsers();
  const idx = users.findIndex(u => u.uid === uid);
  if (idx >= 0) {
    users[idx].accountStatus = 'rejected';
    users[idx].approvedBy = adminName;
    users[idx].approvedAt = new Date().toISOString();
    localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));

    if (isFirebaseLive() && firestoreDb) {
      try {
        await updateDoc(doc(firestoreDb, 'users', uid), {
          accountStatus: 'rejected',
          approvedBy: adminName,
          approvedAt: users[idx].approvedAt
        });
      } catch (e) {
        console.warn('Firestore reject user error:', e);
      }
    }

    await createNotification({
      recipientId: uid,
      title: 'Staff Registration Update',
      titleSi: 'කාර්යමණ්ඩල අයදුම්පත පිළිබඳ දැනුම්දීම',
      body: 'Your staff registration request was not approved by the administrator.',
      bodySi: 'ඔබගේ කාර්යමණ්ඩල අයදුම්පත පරිපාලක විසින් ප්‍රතික්ෂේප කර ඇත.',
      type: 'staff_rejected'
    });
  }
}

export async function setStaffAccountStatus(uid: string, status: AccountStatus): Promise<void> {
  const users = await getAllUsers();
  const idx = users.findIndex(u => u.uid === uid);
  if (idx >= 0) {
    users[idx].accountStatus = status;
    localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));

    if (isFirebaseLive() && firestoreDb) {
      try {
        await updateDoc(doc(firestoreDb, 'users', uid), { accountStatus: status });
      } catch (e) {
        console.warn('Firestore status update error:', e);
      }
    }
  }
}

export async function changeStaffDepartment(uid: string, deptId: string, deptName: string): Promise<void> {
  const users = await getAllUsers();
  const idx = users.findIndex(u => u.uid === uid);
  if (idx >= 0) {
    users[idx].departmentId = deptId;
    users[idx].departmentName = deptName;
    localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));

    if (isFirebaseLive() && firestoreDb) {
      try {
        await updateDoc(doc(firestoreDb, 'users', uid), { departmentId: deptId, departmentName: deptName });
      } catch (e) {
        console.warn('Firestore dept update error:', e);
      }
    }
  }
}

export async function updateUserAccount(updatedData: Partial<UserProfile> & { uid: string }): Promise<UserProfile> {
  const users = await getAllUsers();
  const idx = users.findIndex(u => u.uid === updatedData.uid);
  let updatedProfile: UserProfile;

  if (idx >= 0) {
    updatedProfile = {
      ...users[idx],
      ...updatedData,
    };
    users[idx] = updatedProfile;
  } else {
    updatedProfile = {
      uid: updatedData.uid,
      name: updatedData.name || 'User',
      email: updatedData.email || 'user@company.com',
      role: updatedData.role || 'worker',
      accountStatus: updatedData.accountStatus || 'approved',
      createdAt: new Date().toISOString(),
      ...updatedData
    } as UserProfile;
    users.push(updatedProfile);
  }

  localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));

  if (isFirebaseLive() && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'users', updatedProfile.uid), updatedProfile, { merge: true });
    } catch (e) {
      console.warn('Firestore user update error:', e);
    }
  }

  return updatedProfile;
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const users = await getAllUsers();
  const filtered = users.filter(u => u.uid !== uid);
  localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(filtered));
}

/* =========================================================================
   NOTIFICATIONS ENGINE
   ========================================================================= */

export async function createNotification(notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): Promise<void> {
  const newNotif: AppNotification = {
    ...notif,
    id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    read: false,
    createdAt: new Date().toISOString()
  };

  const notifs: AppNotification[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_NOTIFICATIONS) || '[]');
  notifs.unshift(newNotif);
  localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS, JSON.stringify(notifs));

  // If in browser, trigger Web Notification API if granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(newNotif.title, { body: newNotif.body, icon: '/public/icon.png' });
    } catch {}
  }
}

export async function getUserNotifications(userId: string): Promise<AppNotification[]> {
  const notifs: AppNotification[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_NOTIFICATIONS) || '[]');
  return notifs.filter(n => n.recipientId === userId || n.recipientId === 'all_staff' || n.recipientId === 'super_admin');
}

export async function markNotificationRead(id: string): Promise<void> {
  const notifs: AppNotification[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_NOTIFICATIONS) || '[]');
  const idx = notifs.findIndex(n => n.id === id);
  if (idx >= 0) {
    notifs[idx].read = true;
    localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS, JSON.stringify(notifs));
  }
}

async function notifySuperAdminStaffRequest(staff: UserProfile) {
  await createNotification({
    recipientId: 'super_admin',
    title: 'New Staff Registration Request',
    titleSi: 'නව කාර්යමණ්ඩල ලියාපදිංචි අයදුම්පතක් ලැබී ඇත',
    body: `${staff.name} (${staff.departmentName || 'Staff'}) requested staff account approval.`,
    bodySi: `${staff.name} විසින් ${staff.departmentName || 'කාර්යමණ්ඩල'} අංශය සඳහා අනුමැතිය ඉල්ලා ඇත.`,
    type: 'staff_request'
  });
}

async function notifyNewReportCreated(report: ProblemReport) {
  await createNotification({
    recipientId: 'all_staff',
    title: `New Report: ${report.ticketId} (${report.priority.toUpperCase()})`,
    titleSi: `නව වාර්තාවක්: ${report.ticketId} (${report.priority})`,
    body: `${report.facilityName} - ${report.categoryName}: ${report.description.substring(0, 70)}...`,
    bodySi: `${report.facilityName} - ${report.categoryName}: ${report.description.substring(0, 70)}...`,
    type: 'new_report',
    reportId: report.id
  });
}

async function notifyStatusChange(report: ProblemReport) {
  await createNotification({
    recipientId: report.workerId,
    title: `Status Updated: ${report.ticketId}`,
    titleSi: `තත්ත්වය යාවත්කාලීන විය: ${report.ticketId}`,
    body: `Your problem report status changed to ${report.status.replace('_', ' ').toUpperCase()}`,
    bodySi: `ඔබගේ වාර්තාවේ තත්ත්වය ${report.status} ලෙස යාවත්කාලීන කරන ලදී.`,
    type: 'status_change',
    reportId: report.id
  });
}
