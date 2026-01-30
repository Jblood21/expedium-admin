import React, { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, Database, Activity } from 'lucide-react';
import {
  getAllPlatformData,
  getAllUserDataArray,
  getUserDataVolume,
  getTotalStorageUsed,
  formatBytes,
  formatDate,
} from '../utils/dataReader';
import { StoredUser, UserData } from '../types';

interface PlatformEvent {
  id: string;
  type: 'user_registered' | 'plan_completed' | 'feature_started';
  userId: string;
  userName: string;
  userEmail: string;
  feature?: string;
  timestamp: number;
  description: string;
}

const ActivityLog: React.FC = () => {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [platformData, setPlatformData] = useState<{ [userId: string]: UserData }>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = () => {
    const allData = getAllPlatformData();
    const allUserData = getAllUserDataArray(allData);
    setUsers(allData.users);
    const dataMap: { [userId: string]: UserData } = {};
    allData.users.forEach(u => {
      const ud = allData.userData.get(u.id);
      if (ud) dataMap[u.id] = ud;
    });
    setPlatformData(dataMap);
  };

  // Calculate storage metrics
  const totalStorageUsed = getTotalStorageUsed();
  const storageLimit = 5 * 1024 * 1024; // 5MB in bytes
  const storagePercentage = (totalStorageUsed / storageLimit) * 100;

  // Sort users by registration date (most recent first)
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => b.createdAt - a.createdAt);
  }, [users]);

  // Calculate data volume per user
  const userDataVolumes = useMemo(() => {
    return users.map((user) => {
      const userData = platformData[user.id] || {};
      const dataSize = getUserDataVolume(user.id);

      // Count total records
      const recordCount =
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
        (userData.competitors?.length || 0);

      return {
        user,
        dataSize,
        recordCount,
      };
    }).sort((a, b) => b.dataSize - a.dataSize);
  }, [users, platformData]);

  // Calculate total records and size
  const totals = useMemo(() => {
    return userDataVolumes.reduce(
      (acc, item) => ({
        records: acc.records + item.recordCount,
        size: acc.size + item.dataSize,
      }),
      { records: 0, size: 0 }
    );
  }, [userDataVolumes]);

  // Generate platform events
  const platformEvents = useMemo(() => {
    const events: PlatformEvent[] = [];

    users.forEach((user) => {
      const userData = platformData[user.id] || {} as UserData;

      // User registration event
      events.push({
        id: `reg-${user.id}`,
        type: 'user_registered',
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        timestamp: user.createdAt,
        description: `${user.name} registered an account`,
      });

      // Business plan completed event
      if (userData.planCompleted) {
        events.push({
          id: `plan-${user.id}`,
          type: 'plan_completed',
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          timestamp: user.createdAt + 3600000, // Assume 1 hour after registration
          description: `${user.name} completed their business plan`,
        });
      }

      // Feature usage events
      const features = [
        { name: 'CRM', data: userData.customers, key: 'crm' },
        { name: 'HR Management', data: userData.employees, key: 'hr' },
        { name: 'Financial Management', data: userData.transactions, key: 'finance' },
        { name: 'Sales Pipeline', data: userData.proposals, key: 'sales' },
        { name: 'Outreach Management', data: userData.outreachContacts, key: 'outreach' },
        { name: 'Strategy Planning', data: userData.strategyGoals, key: 'strategy' },
        { name: 'Competitor Analysis', data: userData.competitors, key: 'competitor' },
      ];

      features.forEach((feature) => {
        if (feature.data && feature.data.length > 0) {
          events.push({
            id: `feature-${user.id}-${feature.key}`,
            type: 'feature_started',
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            feature: feature.name,
            timestamp: user.createdAt + 1800000, // Assume 30 min after registration
            description: `${user.name} started using ${feature.name}`,
          });
        }
      });
    });

    // Sort by timestamp descending and limit to 20
    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }, [users, platformData]);

  // Get relative time
  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="activity-log-page">
      <div className="page-header">
        <h1>Activity Log</h1>
        <p>Platform events and data tracking</p>
      </div>

      {/* Storage Overview */}
      <div className="admin-card">
        <div className="card-header">
          <Database className="icon" />
          <h2>Storage Overview</h2>
        </div>
        <div className="storage-info">
          <div className="storage-stats">
            <div className="stat-item">
              <span className="stat-label">Total Storage Used</span>
              <span className="stat-value">{formatBytes(totalStorageUsed)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Storage Limit</span>
              <span className="stat-value">{formatBytes(storageLimit)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Percentage Used</span>
              <span className="stat-value">{storagePercentage.toFixed(2)}%</span>
            </div>
          </div>
          <div className="storage-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(storagePercentage, 100)}%`,
                  backgroundColor: storagePercentage > 80 ? '#ef4444' : storagePercentage > 60 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
            <span className="progress-label">
              {formatBytes(totalStorageUsed)} of {formatBytes(storageLimit)} used
            </span>
          </div>
        </div>
      </div>

      {/* User Registration Timeline */}
      <div className="admin-card">
        <div className="card-header">
          <Clock className="icon" />
          <h2>User Registration Timeline</h2>
        </div>
        <div className="timeline">
          {sortedUsers.length === 0 ? (
            <p className="empty-state">No users registered yet</p>
          ) : (
            sortedUsers.map((user) => (
              <div key={user.id} className="timeline-item">
                <div className="timeline-dot" style={{ backgroundColor: '#3b82f6' }} />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <strong>{user.name}</strong>
                    <span className="email">{user.email}</span>
                  </div>
                  {user.company && (
                    <div className="timeline-company">{user.company}</div>
                  )}
                  <div className="timeline-info">
                    <span>Registered on {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="timeline-status">
                    <span
                      className={`status-badge ${platformData[user.id]?.planCompleted ? 'completed' : 'not-started'}`}
                    >
                      {platformData[user.id]?.planCompleted ? 'Completed' : 'Not Started'}
                    </span>
                    <span className="status-label">Business Plan</span>
                  </div>
                </div>
                <div className="timeline-time">
                  {getRelativeTime(user.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Data Volume by User */}
      <div className="admin-card">
        <div className="card-header">
          <TrendingUp className="icon" />
          <h2>Data Volume by User</h2>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Data Size</th>
                <th># Records</th>
              </tr>
            </thead>
            <tbody>
              {userDataVolumes.map(({ user, dataSize, recordCount }) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{formatBytes(dataSize)}</td>
                  <td>{recordCount.toLocaleString()}</td>
                </tr>
              ))}
              {userDataVolumes.length > 0 && (
                <tr className="total-row">
                  <td colSpan={2}><strong>Total</strong></td>
                  <td><strong>{formatBytes(totals.size)}</strong></td>
                  <td><strong>{totals.records.toLocaleString()}</strong></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Events Feed */}
      <div className="admin-card">
        <div className="card-header">
          <Activity className="icon" />
          <h2>Platform Events Feed</h2>
        </div>
        <div className="events-feed">
          {platformEvents.length === 0 ? (
            <p className="empty-state">No platform events yet</p>
          ) : (
            platformEvents.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-icon">
                  {event.type === 'user_registered' && <Clock />}
                  {event.type === 'plan_completed' && <TrendingUp />}
                  {event.type === 'feature_started' && <Activity />}
                </div>
                <div className="event-content">
                  <div className="event-description">{event.description}</div>
                  <div className="event-meta">
                    <span className="event-email">{event.userEmail}</span>
                    {event.feature && (
                      <span className="event-feature">{event.feature}</span>
                    )}
                  </div>
                </div>
                <div className="event-time">
                  {formatDate(event.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
