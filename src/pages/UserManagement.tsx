import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Users,
  Briefcase,
  UserPlus,
  FileText,
  Receipt,
  ScrollText,
  Check,
  X
} from 'lucide-react';
import {
  getAllPlatformData,
  getAllUserDataArray,
  getUserDataVolume,
  formatBytes,
  formatDate,
  exportUserDataAsJSON
} from '../utils/dataReader';
import { StoredUser, UserData, PlatformData } from '../types';

type SortField = 'name' | 'email' | 'company' | 'createdAt' | 'dataVolume';
type SortDirection = 'asc' | 'desc';

const UserManagement: React.FC = () => {
  const [platformData, setPlatformData] = useState<PlatformData | null>(null);
  const [userDataArray, setUserDataArray] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = (userId: string, userName: string) => {
    try {
      const jsonData = exportUserDataAsJSON(userId);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${userName.replace(/\s+/g, '_')}_data_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting user data:', error);
      alert('Failed to export user data');
    }
  };

  const toggleUserExpansion = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  if (isLoading || !platformData) {
    return (
      <div className="admin-page">
        <div className="loading-state">Loading user data...</div>
      </div>
    );
  }

  const filteredUsers = platformData.users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.company && user.company.toLowerCase().includes(query))
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let compareA: any;
    let compareB: any;

    switch (sortField) {
      case 'name':
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case 'email':
        compareA = a.email.toLowerCase();
        compareB = b.email.toLowerCase();
        break;
      case 'company':
        compareA = (a.company || '').toLowerCase();
        compareB = (b.company || '').toLowerCase();
        break;
      case 'createdAt':
        compareA = a.createdAt;
        compareB = b.createdAt;
        break;
      case 'dataVolume':
        compareA = getUserDataVolume(a.id);
        compareB = getUserDataVolume(b.id);
        break;
      default:
        return 0;
    }

    if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getUserStatus = (user: StoredUser): 'active' | 'partial' | 'inactive' => {
    const userData = platformData.userData.get(user.id);
    if (!userData) return 'inactive';

    const hasBusinessPlan = userData.planCompleted;
    const hasAnyData =
      userData.customers.length > 0 ||
      userData.employees.length > 0 ||
      userData.transactions.length > 0 ||
      userData.invoices.length > 0 ||
      userData.proposals.length > 0 ||
      userData.contracts.length > 0;

    if (hasBusinessPlan && hasAnyData) return 'active';
    if (hasAnyData) return 'partial';
    return 'inactive';
  };

  const getStatusColor = (status: 'active' | 'partial' | 'inactive') => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'partial':
        return '#f59e0b';
      case 'inactive':
        return '#6b7280';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderUserDetail = (user: StoredUser) => {
    const userData = platformData.userData.get(user.id);
    if (!userData) return null;

    const features = [
      { name: 'Customers', count: userData.customers.length, icon: UserPlus },
      { name: 'Employees', count: userData.employees.length, icon: Briefcase },
      { name: 'Transactions', count: userData.transactions.length, icon: Receipt },
      { name: 'Invoices', count: userData.invoices.length, icon: FileText },
      { name: 'Proposals', count: userData.proposals.length, icon: ScrollText },
      { name: 'Contracts', count: userData.contracts.length, icon: ScrollText }
    ];

    return (
      <tr>
        <td colSpan={7}>
          <div className="user-detail-panel">
            <div className="user-detail-header">
              <div
                className="user-avatar-large"
                style={{ backgroundColor: '#8b5cf6', color: 'white' }}
              >
                {getInitials(user.name)}
              </div>
              <div className="user-detail-info">
                <h3>{user.name}</h3>
                <p className="user-email">{user.email}</p>
                {user.company && <p className="user-company">{user.company}</p>}
                <p className="user-joined">Joined {formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="user-stats-row">
              {features.map(feature => {
                const Icon = feature.icon;
                return (
                  <div key={feature.name} className="user-stat-item">
                    <Icon size={20} className="stat-item-icon" />
                    <div>
                      <div className="stat-item-value">{feature.count}</div>
                      <div className="stat-item-label">{feature.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="user-section">
              <h4>Business Plan</h4>
              {userData.planCompleted && userData.businessPlanAnswers ? (
                <div className="business-plan-info">
                  <div className="plan-row">
                    <span className="plan-label">Business Name:</span>
                    <span className="plan-value">{(userData.businessPlanAnswers.company_name as string) || '-'}</span>
                  </div>
                  <div className="plan-row">
                    <span className="plan-label">Industry:</span>
                    <span className="plan-value">{(userData.businessPlanAnswers.industry as string) || '-'}</span>
                  </div>
                  <div className="plan-row">
                    <span className="plan-label">Stage:</span>
                    <span className="plan-value">{(userData.businessPlanAnswers.business_stage as string) || '-'}</span>
                  </div>
                </div>
              ) : (
                <p className="empty-state">No business plan completed</p>
              )}
            </div>

            <div className="user-section">
              <h4>Feature Usage</h4>
              <div className="feature-badges">
                {features.map(feature => (
                  <div
                    key={feature.name}
                    className="feature-badge"
                    style={{
                      backgroundColor: feature.count > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: feature.count > 0 ? '#10b981' : '#6b7280'
                    }}
                  >
                    {feature.count > 0 ? (
                      <Check size={14} style={{ marginRight: '4px' }} />
                    ) : (
                      <X size={14} style={{ marginRight: '4px' }} />
                    )}
                    {feature.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p className="page-subtitle">Manage and view all registered users</p>
        </div>
      </div>

      <div className="table-controls">
        <div className="table-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="user-count">
          {sortedUsers.length} {sortedUsers.length === 1 ? 'user' : 'users'}
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Status</th>
              <th onClick={() => handleSort('name')} className="sortable">
                Name <SortIcon field="name" />
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email <SortIcon field="email" />
              </th>
              <th onClick={() => handleSort('company')} className="sortable">
                Company <SortIcon field="company" />
              </th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Joined <SortIcon field="createdAt" />
              </th>
              <th onClick={() => handleSort('dataVolume')} className="sortable">
                Data Volume <SortIcon field="dataVolume" />
              </th>
              <th style={{ width: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => {
              const status = getUserStatus(user);
              const isExpanded = expandedUserId === user.id;
              const dataVolume = getUserDataVolume(user.id);

              return (
                <React.Fragment key={user.id}>
                  <tr
                    className={isExpanded ? 'expanded' : ''}
                    onClick={() => toggleUserExpansion(user.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div
                        className="status-dot"
                        style={{ backgroundColor: getStatusColor(status) }}
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.company || '-'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatBytes(dataVolume)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => toggleUserExpansion(user.id)}
                          title="View details"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <Eye size={16} />}
                          View
                        </button>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => handleExport(user.id, user.name)}
                          title="Export user data"
                        >
                          <Download size={16} />
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && renderUserDetail(user)}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {sortedUsers.length === 0 && (
          <div className="empty-state-table">
            <Users size={48} style={{ color: '#9ca3af' }} />
            <p>No users found</p>
            {searchQuery && (
              <button className="btn-secondary" onClick={() => setSearchQuery('')}>
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
