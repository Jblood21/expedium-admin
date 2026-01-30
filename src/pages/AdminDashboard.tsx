import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  DollarSign,
  Briefcase,
  UserPlus,
  Database,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  getAllPlatformData,
  getAllUserDataArray,
  getFeatureAdoptionRates,
  calculateTotalRevenue,
  calculateTotalExpenses,
  getTotalEmployees,
  getTotalCustomers,
  getActiveUsers,
  getTotalStorageUsed,
  formatBytes,
  formatCurrency,
  formatDate
} from '../utils/dataReader';
import { PlatformData, UserData } from '../types';

const AdminDashboard: React.FC = () => {
  const [platformData, setPlatformData] = useState<PlatformData | null>(null);
  const [userDataArray, setUserDataArray] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    try {
      const data = getAllPlatformData();
      setPlatformData(data);
      const userArray = getAllUserDataArray(data);
      setUserDataArray(userArray);
    } catch (error) {
      console.error('Error loading platform data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !platformData) {
    return (
      <div className="admin-page">
        <div className="loading-state">Loading dashboard data...</div>
      </div>
    );
  }

  const stats = {
    totalUsers: platformData.users.length,
    activeUsers: getActiveUsers(userDataArray),
    totalRevenue: calculateTotalRevenue(userDataArray),
    totalEmployees: getTotalEmployees(userDataArray),
    totalCustomers: getTotalCustomers(userDataArray),
    storageUsed: getTotalStorageUsed()
  };

  const featureAdoption = getFeatureAdoptionRates(userDataArray);
  const totalExpenses = calculateTotalExpenses(userDataArray);
  const netIncome = stats.totalRevenue - totalExpenses;

  const recentUsers = [...platformData.users]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  const completedPlans = userDataArray.filter(u => u.planCompleted).length;

  const featureColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#14b8a6'  // teal
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Platform overview and key metrics</p>
        </div>
        <button className="btn-primary" onClick={loadData}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
          >
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
          >
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.activeUsers}</span>
            <span className="stat-label">Active Users</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
          >
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
          >
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalEmployees}</span>
            <span className="stat-label">Total Employees</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}
          >
            <UserPlus size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalCustomers}</span>
            <span className="stat-label">Total Customers</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}
          >
            <Database size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatBytes(stats.storageUsed)}</span>
            <span className="stat-label">Storage Used</span>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h2>Feature Adoption</h2>
        </div>
        <div className="card-body">
          {Object.keys(featureAdoption).length === 0 ? (
            <p className="empty-state">No feature data available</p>
          ) : (
            <div className="bar-chart">
              {Object.entries(featureAdoption).map(([feature, percentage], index) => (
                <div key={feature} className="bar-row">
                  <span className="bar-label">{feature}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: featureColors[index % featureColors.length]
                      }}
                    />
                  </div>
                  <span className="bar-value">{percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h2>Recent Users</h2>
        </div>
        <div className="card-body">
          {recentUsers.length === 0 ? (
            <p className="empty-state">No users registered yet</p>
          ) : (
            <div className="table-responsive">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.company || '-'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="admin-card">
          <div className="card-header">
            <h2>Business Plans</h2>
          </div>
          <div className="card-body">
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-text">
                  {completedPlans} of {stats.totalUsers} users completed
                </span>
                <span className="progress-percentage">
                  {stats.totalUsers > 0
                    ? ((completedPlans / stats.totalUsers) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${stats.totalUsers > 0 ? (completedPlans / stats.totalUsers) * 100 : 0}%`,
                    backgroundColor: '#8b5cf6'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <h2>Financial Summary</h2>
          </div>
          <div className="card-body">
            <div className="financial-summary">
              <div className="financial-row">
                <span className="financial-label">Total Revenue</span>
                <span className="financial-value positive">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              <div className="financial-row">
                <span className="financial-label">Total Expenses</span>
                <span className="financial-value negative">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="financial-divider" />
              <div className="financial-row">
                <span className="financial-label strong">Net Income</span>
                <span className={`financial-value strong ${netIncome >= 0 ? 'positive' : 'negative'}`}>
                  {netIncome >= 0 ? (
                    <TrendingUp size={16} style={{ marginRight: '4px' }} />
                  ) : (
                    <TrendingDown size={16} style={{ marginRight: '4px' }} />
                  )}
                  {formatCurrency(Math.abs(netIncome))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
