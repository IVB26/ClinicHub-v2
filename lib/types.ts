export type UserRole = 'staff' | 'manager' | 'admin';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  clinicId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface Policy {
  id: number;
  title: string;
  category: string;
  overview?: string;
  content?: unknown;
  created_at?: string;
  updated_at?: string;
}

export interface ProtocolCategory {
  id: number;
  name: string;
  color: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProtocolItem {
  id: number;
  category_id: number;
  title: string;
  description?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProtocolBlock {
  id: number;
  item_id: number;
  type: string;
  title?: string;
  content?: unknown;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface BoardingProcedure {
  id: number;
  title: string;
  category: string;
  overview?: string;
  content?: unknown;
  created_at?: string;
  updated_at?: string;
}

export type CustomTabType = 'cards' | 'form' | 'checklist';
export type CustomTabLocation = 'sidebar' | 'top';

export interface CustomTab {
  id: number;
  name: string;
  subtitle?: string;
  icon: string;
  type: CustomTabType;
  location: CustomTabLocation;
  columns?: number;
  searchBar?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Reception / Client Management Types
export interface Pet {
  id?: number;
  name: string;
  type: string; // Dog, Cat, Bird, etc.
  breed: string;
  dateOfBirth?: string;
  microchip?: string;
  notes?: string;
}

export interface Client {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  pets: Pet[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentService = 'checkup' | 'vaccination' | 'surgery' | 'grooming' | 'dental' | 'other';

export interface Appointment {
  id?: number;
  clientId: number;
  petId?: number;
  petName?: string;
  clientName?: string;
  dateTime: string;
  service: AppointmentService;
  duration?: number; // minutes
  notes?: string;
  status: AppointmentStatus;
  reminderSent?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CallType = 'incoming' | 'outgoing';
export type CallOutcome = 'note' | 'appointment' | 'follow-up' | 'question' | 'complaint' | 'other';

export interface CallLog {
  id?: number;
  clientId: number;
  clientName?: string;
  type: CallType;
  dateTime: string;
  duration?: number; // minutes
  outcome: CallOutcome;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Banking Types
export type PaymentMethod = 'cash' | 'card' | 'check' | 'bank_transfer' | 'other';
export type TransactionStatus = 'recorded' | 'reconciled';
export type ReconciliationStatus = 'pending' | 'reconciled' | 'reviewed';

export interface BankingTransaction {
  id?: number;
  date: string;
  paymentMethod: PaymentMethod;
  amount: number;
  clientName?: string;
  service?: string;
  reference?: string;
  notes?: string;
  status: TransactionStatus;
  created_at?: string;
  updated_at?: string;
}

export interface DailyReconciliation {
  id?: number;
  date: string;
  openingBalance: number;
  expectedTotal: number;
  actualTotal: number;
  variance: number;
  varianceReason?: string;
  reconciliationNotes?: string;
  status: ReconciliationStatus;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentMethodSummary {
  method: PaymentMethod;
  count: number;
  total: number;
  percentage: number;
}

export interface DailySummary {
  date: string;
  totalTransactions: number;
  totalAmount: number;
  paymentMethods: PaymentMethodSummary[];
  cashTotal: number;
  cardTotal: number;
  checkTotal: number;
  bankTransferTotal: number;
  otherTotal: number;
}
