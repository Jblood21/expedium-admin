import {
  StoredUser, UserData, PlatformData, Customer, MonthlyGoal,
  Employee, Transaction, Budget, Invoice, Proposal, Contract,
  OutreachContact, MessageTemplate, OutreachHistory,
  SWOTAnalysis, Competitor, Goal, Milestone,
  BusinessPlanAnswers, UserProfile, NotificationPrefs
} from '../types';

function safeParseJSON<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function getAllUsers(): StoredUser[] {
  return safeParseJSON<StoredUser[]>('expedium_users', []);
}

export function getUserData(userId: string): UserData {
  const goals = safeParseJSON<MonthlyGoal[]>(`expedium_goals_${userId}`, []);
  return {
    userId,
    name: '',
    businessName: '',
    customers: safeParseJSON<Customer[]>(`expedium_customers_${userId}`, []),
    goals,
    monthlyGoals: goals,
    employees: safeParseJSON<Employee[]>(`expedium_employees_${userId}`, []),
    transactions: safeParseJSON<Transaction[]>(`expedium_transactions_${userId}`, []),
    budgets: safeParseJSON<Budget[]>(`expedium_budgets_${userId}`, []),
    invoices: safeParseJSON<Invoice[]>(`expedium_invoices_${userId}`, []),
    proposals: safeParseJSON<Proposal[]>(`expedium_proposals_${userId}`, []),
    contracts: safeParseJSON<Contract[]>(`expedium_contracts_${userId}`, []),
    outreachContacts: safeParseJSON<OutreachContact[]>(`expedium_outreach_contacts_${userId}`, []),
    outreachTemplates: safeParseJSON<MessageTemplate[]>(`expedium_outreach_templates_${userId}`, []),
    outreachHistory: safeParseJSON<OutreachHistory[]>(`expedium_outreach_history_${userId}`, []),
    swotAnalyses: safeParseJSON<SWOTAnalysis[]>(`expedium_swot_${userId}`, []),
    competitors: safeParseJSON<Competitor[]>(`expedium_competitors_${userId}`, []),
    strategyGoals: safeParseJSON<Goal[]>(`expedium_goals_strategy_${userId}`, []),
    milestones: safeParseJSON<Milestone[]>(`expedium_milestones_${userId}`, []),
    businessPlanAnswers: safeParseJSON<BusinessPlanAnswers | null>(`expedium_answers_${userId}`, null),
    planCompleted: safeParseJSON<boolean>(`expedium_plan_completed_${userId}`, false),
    profile: safeParseJSON<UserProfile | null>(`expedium_profile_${userId}`, null),
    notifications: safeParseJSON<NotificationPrefs | null>(`expedium_notifications_${userId}`, null),
  };
}

export function getAllPlatformData(): PlatformData {
  const users = getAllUsers();
  const userData = new Map<string, UserData>();
  for (const user of users) {
    const ud = getUserData(user.id);
    ud.name = user.name;
    ud.businessName = user.company || (ud.businessPlanAnswers?.company_name as string) || user.name;
    userData.set(user.id, ud);
  }
  return { users, userData };
}

export function getAllUserDataArray(platformData: PlatformData): UserData[] {
  return Array.from(platformData.userData.values());
}

export function getFeatureAdoptionRates(allUserData: UserData[]): Record<string, number> {
  const total = allUserData.length || 1;
  return {
    'Business Plan': Math.round(allUserData.filter(u => u.planCompleted).length / total * 100),
    'Customers': Math.round(allUserData.filter(u => u.customers.length > 0).length / total * 100),
    'Employees': Math.round(allUserData.filter(u => u.employees.length > 0).length / total * 100),
    'Finances': Math.round(allUserData.filter(u => u.transactions.length > 0).length / total * 100),
    'Documents': Math.round(allUserData.filter(u => u.invoices.length > 0 || u.proposals.length > 0 || u.contracts.length > 0).length / total * 100),
    'Marketing': Math.round(allUserData.filter(u => u.outreachContacts.length > 0 || u.outreachHistory.length > 0).length / total * 100),
    'Strategy': Math.round(allUserData.filter(u => u.swotAnalyses.length > 0 || u.strategyGoals.length > 0).length / total * 100),
  };
}

export function calculateTotalRevenue(allUserData: UserData[]): number {
  return allUserData.reduce((sum, u) =>
    sum + u.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), 0);
}

export function calculateTotalExpenses(allUserData: UserData[]): number {
  return allUserData.reduce((sum, u) =>
    sum + u.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), 0);
}

export function getTotalEmployees(allUserData: UserData[]): number {
  return allUserData.reduce((sum, u) => sum + u.employees.length, 0);
}

export function getTotalCustomers(allUserData: UserData[]): number {
  return allUserData.reduce((sum, u) => sum + u.customers.length, 0);
}

export function getActiveUsers(allUserData: UserData[]): number {
  return allUserData.filter(u =>
    u.customers.length > 0 || u.employees.length > 0 ||
    u.transactions.length > 0 || u.planCompleted
  ).length;
}

export function getUserDataVolume(userId: string): number {
  let bytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(userId)) {
      bytes += (localStorage.getItem(key) || '').length * 2;
    }
  }
  return bytes;
}

export function getTotalStorageUsed(): number {
  let bytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('expedium_')) {
      const value = localStorage.getItem(key) || '';
      bytes += (key.length + value.length) * 2;
    }
  }
  return bytes;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function exportAllPlatformData(): string {
  const data: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('expedium_') && !key.startsWith('expedium_admin_')) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) || '');
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
  }
  return JSON.stringify(data, null, 2);
}

export function exportUserDataAsJSON(userId: string): string {
  const data = getUserData(userId);
  return JSON.stringify(data, null, 2);
}
