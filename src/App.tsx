import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation
} from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  UserCog,
  Megaphone,
  Activity,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Eye,
  EyeOff,
  Lock,
  User
} from 'lucide-react';
import './App.css';

import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import BusinessIntelligence from './pages/BusinessIntelligence';
import FinancialOverview from './pages/FinancialOverview';
import EmployeeOverview from './pages/EmployeeOverview';
import CRMOverview from './pages/CRMOverview';
import ActivityLog from './pages/ActivityLog';
import PlatformSettings from './pages/PlatformSettings';

const SESSION_KEY = 'expedium_admin_session';
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

interface Session {
  username: string;
  timestamp: number;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/business', label: 'Business Intel', icon: Building2 },
  { path: '/finances', label: 'Finances', icon: DollarSign },
  { path: '/employees', label: 'HR Overview', icon: UserCog },
  { path: '/crm', label: 'CRM & Marketing', icon: Megaphone },
  { path: '/activity', label: 'Activity Log', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const session: Session = {
        username: ADMIN_USERNAME,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="login-header">
          <Shield size={48} />
          <h1>Expedium Admin</h1>
          <p>Secure access to admin panel</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <User size={18} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

const HeaderBar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const location = useLocation();

  const getPageName = () => {
    const item = navItems.find((item) => item.path === location.pathname);
    return item ? item.label : 'Dashboard';
  };

  return (
    <header className="admin-header">
      <h2 className="page-title">{getPageName()}</h2>
      <div className="header-actions">
        <button className="notification-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <div className="user-avatar">A</div>
        <button className="logout-btn" onClick={onLogout} aria-label="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

const AdminLayout: React.FC<{
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}> = ({ sidebarCollapsed, setSidebarCollapsed, onLogout }) => {
  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <Shield size={32} />
          {!sidebarCollapsed && (
            <div className="brand-text">
              <h1>Expedium</h1>
              <span>Admin Panel</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </aside>

      <main className="admin-main">
        <HeaderBar onLogout={onLogout} />
        <div className="admin-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/business" element={<BusinessIntelligence />} />
            <Route path="/finances" element={<FinancialOverview />} />
            <Route path="/employees" element={<EmployeeOverview />} />
            <Route path="/crm" element={<CRMOverview />} />
            <Route path="/activity" element={<ActivityLog />} />
            <Route path="/settings" element={<PlatformSettings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const sessionData = localStorage.getItem(SESSION_KEY);

      if (sessionData) {
        try {
          const session: Session = JSON.parse(sessionData);
          const now = Date.now();
          const sessionAge = now - session.timestamp;

          if (sessionAge < SESSION_TIMEOUT && session.username === ADMIN_USERNAME) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem(SESSION_KEY);
            setIsAuthenticated(false);
          }
        } catch (error) {
          localStorage.removeItem(SESSION_KEY);
          setIsAuthenticated(false);
        }
      }

      setIsLoading(false);
    };

    checkSession();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <Shield size={48} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter basename="/expedium-admin">
      {isAuthenticated ? (
        <AdminLayout
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
        />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </BrowserRouter>
  );
};

export default App;
