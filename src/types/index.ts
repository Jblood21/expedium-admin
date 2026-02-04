// ===== User & Auth Types =====
export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  company?: string;
  createdAt: number;
  suspended?: boolean;
}

export interface Session {
  userId: string;
  createdAt: number;
  lastActivity: number;
}

// ===== Customer Management Types =====
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  lastContact: string;
  nextFollowUp: string;
  notes: string;
  status: 'lead' | 'active' | 'inactive';
  interactions: Interaction[];
}

export interface Interaction {
  id: string;
  date: string;
  type: 'call' | 'email' | 'meeting' | 'promotion';
  outcome: 'positive' | 'negative' | 'neutral' | 'no-response';
  notes: string;
}

export interface MonthlyGoal {
  month: string;
  targetOutreach: number;
  completed: number;
  responses: number;
  positiveResponses: number;
  negativeResponses: number;
}

// ===== Employee Types =====
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  startDate: string;
  payType: 'hourly' | 'salary';
  payRate: number;
  payFrequency: 'weekly' | 'biweekly' | 'monthly';
  hoursPerWeek?: number;
  satisfactionRating: number;
  performanceNotes: string;
  status: 'active' | 'on-leave' | 'terminated';
  reviews: PerformanceReview[];
}

export interface PerformanceReview {
  id: string;
  date: string;
  rating: number;
  strengths: string;
  improvements: string;
  notes: string;
}

// ===== Finance Types =====
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  recurring?: boolean;
}

export interface Budget {
  id: string;
  category: string;
  budgeted: number;
  spent: number;
}

// ===== Document Types =====
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  createdDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Proposal {
  id: string;
  title: string;
  clientName: string;
  content: string;
  createdDate: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

export interface Contract {
  id: string;
  title: string;
  clientName: string;
  content: string;
  createdDate: string;
  status: 'draft' | 'sent' | 'signed';
}

// ===== Marketing/Outreach Types =====
export interface OutreachContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  tags: string[];
  source: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'social';
  subject?: string;
  body: string;
  variables: string[];
}

export interface OutreachHistory {
  id: string;
  channel: 'email' | 'sms' | 'social';
  recipient: string;
  subject?: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: string;
  platform?: string;
}

export interface Integration {
  id: string;
  type: string;
  provider: string;
  apiKey: string;
  status: 'connected' | 'disconnected';
  lastSync: string;
}

// ===== Strategy Types =====
export interface SWOTAnalysis {
  id: string;
  name: string;
  date: string;
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
}

export interface SWOTItem {
  id: string;
  text: string;
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  strengths: string;
  weaknesses: string;
  pricing: string;
  marketShare: string;
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'quarterly' | 'yearly' | 'custom';
  deadline: string;
  progress: number;
  keyResults: KeyResult[];
  status: 'not-started' | 'in-progress' | 'completed' | 'at-risk';
}

export interface KeyResult {
  id: string;
  text: string;
  target: number;
  current: number;
  unit: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  category: string;
}

// ===== Business Plan Types =====
export interface BusinessPlanAnswers {
  [key: string]: string | string[];
}

// ===== Profile/Settings Types =====
export interface UserProfile {
  name: string;
  email: string;
  company: string;
  phone: string;
  website: string;
  address: string;
}

export interface NotificationPrefs {
  emailReminders: boolean;
  followUpAlerts: boolean;
  goalReminders: boolean;
  weeklyDigest: boolean;
}

// ===== Admin-specific Types =====
export interface UserData {
  userId: string;
  name: string;
  businessName: string;
  customers: Customer[];
  goals: MonthlyGoal[];
  monthlyGoals: MonthlyGoal[];
  employees: Employee[];
  transactions: Transaction[];
  budgets: Budget[];
  invoices: Invoice[];
  proposals: Proposal[];
  contracts: Contract[];
  outreachContacts: OutreachContact[];
  outreachTemplates: MessageTemplate[];
  outreachHistory: OutreachHistory[];
  swotAnalyses: SWOTAnalysis[];
  competitors: Competitor[];
  strategyGoals: Goal[];
  milestones: Milestone[];
  businessPlanAnswers: BusinessPlanAnswers | null;
  planCompleted: boolean;
  profile: UserProfile | null;
  notifications: NotificationPrefs | null;
}

export interface PlatformData {
  users: StoredUser[];
  userData: Map<string, UserData>;
}
