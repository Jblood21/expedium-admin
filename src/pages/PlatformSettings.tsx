import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Database,
  Download,
  RefreshCw,
  Trash2,
  ExternalLink,
  Github,
  Monitor,
  BarChart3,
} from 'lucide-react';
import {
  getAllPlatformData,
  getTotalStorageUsed,
  formatBytes,
  formatDate,
  exportAllPlatformData,
} from '../utils/dataReader';
import { StoredUser, UserData } from '../types';

interface AdminSession {
  username: string;
  loginTime: number;
  expiresAt: number;
}

const PlatformSettings: React.FC = () => {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [platformData, setPlatformData] = useState<{ [userId: string]: UserData }>({});
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
    loadAdminSession();
  }, [refreshKey]);

  const loadData = () => {
    const allData = getAllPlatformData();
    setUsers(allData.users);
    const dataMap: { [userId: string]: UserData } = {};
    allData.users.forEach(u => {
      const ud = allData.userData.get(u.id);
      if (ud) dataMap[u.id] = ud;
    });
    setPlatformData(dataMap);
  };

  const loadAdminSession = () => {
    const sessionData = localStorage.getItem('expedium_admin_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const expiresAt = session.loginTime + 8 * 60 * 60 * 1000; // 8 hours
        setAdminSession({
          username: session.username || 'Admin',
          loginTime: session.loginTime,
          expiresAt,
        });
      } catch (error) {
        console.error('Error parsing admin session:', error);
      }
    }
  };

  // Calculate platform statistics
  const totalUsers = users.length;

  const totalDataItems = users.reduce((sum, user) => {
    const userData = platformData[user.id] || {};
    return (
      sum +
      (userData.customers?.length || 0) +
      (userData.employees?.length || 0) +
      (userData.transactions?.length || 0) +
      (userData.invoices?.length || 0) +
      (userData.proposals?.length || 0) +
      (userData.contracts?.length || 0) +
      (userData.outreachContacts?.length || 0) +
      (userData.outreachHistory?.length || 0) +
      (userData.strategyGoals?.length || 0) +
      (userData.milestones?.length || 0) +
      (userData.swotAnalyses?.length || 0) +
      (userData.competitors?.length || 0)
    );
  }, 0);

  const totalStorageUsed = getTotalStorageUsed();

  const platformRunningSince = users.length > 0
    ? formatDate(Math.min(...users.map((u) => u.createdAt)))
    : 'No users yet';

  const uniqueActiveFeatures = new Set<string>();
  users.forEach((user) => {
    const userData = platformData[user.id] || {};
    if (userData.customers && userData.customers.length > 0) uniqueActiveFeatures.add('crm');
    if (userData.employees && userData.employees.length > 0) uniqueActiveFeatures.add('hr');
    if (userData.transactions && userData.transactions.length > 0) uniqueActiveFeatures.add('finance');
    if (userData.proposals && userData.proposals.length > 0) uniqueActiveFeatures.add('sales');
    if (userData.outreachContacts && userData.outreachContacts.length > 0) uniqueActiveFeatures.add('outreach');
    if (userData.strategyGoals && userData.strategyGoals.length > 0) uniqueActiveFeatures.add('strategy');
    if (userData.competitors && userData.competitors.length > 0) uniqueActiveFeatures.add('competitor');
  });

  // Handlers
  const handleExportData = () => {
    try {
      const data = exportAllPlatformData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'expedium-platform-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('Platform data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export platform data.');
    }
  };

  const handleRefreshData = () => {
    setRefreshKey((prev) => prev + 1);
    alert('Data refreshed successfully!');
  };

  const handleClearSession = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear the admin session? You will be logged out.'
    );
    if (confirmed) {
      localStorage.removeItem('expedium_admin_session');
      alert('Admin session cleared. Redirecting to login...');
      window.location.href = '/';
    }
  };

  const storageLimit = 5 * 1024 * 1024; // 5MB
  const storagePercentage = ((totalStorageUsed / storageLimit) * 100).toFixed(2);

  return (
    <div className="platform-settings-page">
      <div className="page-header">
        <h1>Platform Settings</h1>
        <p>Admin configuration and data management</p>
      </div>

      {/* Admin Info Card */}
      <div className="admin-card">
        <div className="card-header">
          <User className="icon" />
          <h2>Admin Information</h2>
        </div>
        <div className="admin-info">
          {adminSession ? (
            <>
              <div className="info-row">
                <span className="info-label">Username:</span>
                <span className="info-value">{adminSession.username}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Session Started:</span>
                <span className="info-value">{formatDate(adminSession.loginTime)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Session Expires:</span>
                <span className="info-value">{formatDate(adminSession.expiresAt)}</span>
              </div>
            </>
          ) : (
            <p className="empty-state">No active admin session found</p>
          )}
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="admin-card">
        <div className="card-header">
          <BarChart3 className="icon" />
          <h2>Platform Statistics</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <User />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalUsers}</div>
              <div className="stat-label">Total Registered Users</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Database />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalDataItems.toLocaleString()}</div>
              <div className="stat-label">Total Data Items</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Database />
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatBytes(totalStorageUsed)}</div>
              <div className="stat-label">Total Storage Used</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Monitor />
            </div>
            <div className="stat-content">
              <div className="stat-value">{platformRunningSince}</div>
              <div className="stat-label">Platform Running Since</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Settings />
            </div>
            <div className="stat-content">
              <div className="stat-value">{uniqueActiveFeatures.size} / 7</div>
              <div className="stat-label">Features Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="admin-card">
        <div className="card-header">
          <Database className="icon" />
          <h2>Data Management</h2>
        </div>
        <div className="data-management">
          <button className="action-button export" onClick={handleExportData}>
            <Download className="icon" />
            <span>Export All Platform Data</span>
          </button>
          <button className="action-button refresh" onClick={handleRefreshData}>
            <RefreshCw className="icon" />
            <span>Refresh Data</span>
          </button>
          <button className="action-button danger" onClick={handleClearSession}>
            <Trash2 className="icon" />
            <span>Clear Admin Session</span>
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="admin-card">
        <div className="card-header">
          <Monitor className="icon" />
          <h2>System Information</h2>
        </div>
        <div className="system-info">
          <div className="info-row">
            <span className="info-label">Browser:</span>
            <span className="info-value" title={navigator.userAgent}>
              {navigator.userAgent.substring(0, 80)}...
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Platform:</span>
            <span className="info-value">{navigator.platform}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Screen:</span>
            <span className="info-value">
              {window.innerWidth} x {window.innerHeight}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">localStorage Capacity:</span>
            <span className="info-value">
              {formatBytes(totalStorageUsed)} / {formatBytes(storageLimit)} ({storagePercentage}%)
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">App Version:</span>
            <span className="info-value">1.0.0</span>
          </div>
          <div className="info-row">
            <span className="info-label">React Version:</span>
            <span className="info-value">{React.version}</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="admin-card">
        <div className="card-header">
          <ExternalLink className="icon" />
          <h2>Quick Links</h2>
        </div>
        <div className="quick-links">
          <a
            href="/expedium/"
            target="_blank"
            rel="noopener noreferrer"
            className="link-button"
          >
            <ExternalLink className="icon" />
            <span>Open Expedium App</span>
          </a>
          <a
            href="https://github.com/Jblood21/expedium-admin"
            target="_blank"
            rel="noopener noreferrer"
            className="link-button"
          >
            <Github className="icon" />
            <span>View on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
