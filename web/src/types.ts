export type UserRole = 'worker' | 'staff' | 'super_admin';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'disabled';
export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ReportStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  employeeId?: string;
  phone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  departmentId?: string;
  departmentName?: string;
  companyName?: string;
  companyId?: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  fcmToken?: string;
}

export interface Facility {
  id: string;
  name: string;
  nameSi: string;
  description?: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  nameSi: string;
  code: string;
  description?: string;
}

export interface ProblemCategory {
  id: string;
  name: string;
  nameSi: string;
  departmentId: string;
  departmentName?: string;
  icon?: string;
}

export interface ProblemReport {
  id: string;
  ticketId: string; // e.g. "PROB-2026-0001"
  workerId: string;
  workerName: string;
  workerEmail: string;
  workerPhone?: string;
  facilityId: string;
  facilityName: string;
  categoryId: string;
  categoryName: string;
  departmentId?: string;
  departmentName?: string;
  description: string;
  priority: ReportPriority;
  status: ReportStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  photoUrls: string[];
  videoUrls: string[];
  internalNotes?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ChatMessage {
  id: string;
  reportId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  titleSi: string;
  body: string;
  bodySi: string;
  type: 'new_report' | 'status_change' | 'new_message' | 'staff_request' | 'staff_approved' | 'staff_rejected';
  reportId?: string;
  read: boolean;
  createdAt: string;
}

export type Language = 'si' | 'en';
