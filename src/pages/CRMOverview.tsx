import React, { useMemo } from 'react';
import { getAllPlatformData, getAllUserDataArray } from '../utils/dataReader';
const CRMOverview: React.FC = () => {
  const platformData = getAllPlatformData();
  const allUserData = getAllUserDataArray(platformData);

  const stats = useMemo(() => {
    let totalCustomers = 0;
    let totalOutreachContacts = 0;
    let totalInteractions = 0;
    let totalMessagesSent = 0;

    allUserData.forEach((userData) => {
      if (userData.customers) {
        totalCustomers += userData.customers.length;
        userData.customers.forEach((customer) => {
          if (customer.interactions) {
            totalInteractions += customer.interactions.length;
          }
        });
      }

      if (userData.outreachContacts) {
        totalOutreachContacts += userData.outreachContacts.length;
      }

      if (userData.outreachHistory) {
        totalMessagesSent += userData.outreachHistory.length;
      }
    });

    return {
      totalCustomers,
      totalOutreachContacts,
      totalInteractions,
      totalMessagesSent,
    };
  }, [allUserData]);

  const customerStatusDistribution = useMemo(() => {
    let leadCount = 0;
    let activeCount = 0;
    let inactiveCount = 0;

    allUserData.forEach((userData) => {
      if (userData.customers) {
        userData.customers.forEach((customer) => {
          if (customer.status === 'lead') leadCount++;
          else if (customer.status === 'active') activeCount++;
          else if (customer.status === 'inactive') inactiveCount++;
        });
      }
    });

    const total = leadCount + activeCount + inactiveCount || 1;

    return [
      { status: 'Lead', count: leadCount, percentage: (leadCount / total) * 100, color: 'bg-blue-500' },
      { status: 'Active', count: activeCount, percentage: (activeCount / total) * 100, color: 'bg-green-500' },
      { status: 'Inactive', count: inactiveCount, percentage: (inactiveCount / total) * 100, color: 'bg-gray-400' },
    ];
  }, [allUserData]);

  const interactionOutcomes = useMemo(() => {
    const outcomeCounts: Record<string, number> = {
      positive: 0,
      negative: 0,
      neutral: 0,
      'no-response': 0,
    };

    allUserData.forEach((userData) => {
      if (userData.customers) {
        userData.customers.forEach((customer) => {
          if (customer.interactions) {
            customer.interactions.forEach((interaction) => {
              const outcome = interaction.outcome || 'no-response';
              if (outcomeCounts.hasOwnProperty(outcome)) {
                outcomeCounts[outcome]++;
              } else {
                outcomeCounts[outcome] = 1;
              }
            });
          }
        });
      }
    });

    return [
      { outcome: 'Positive', count: outcomeCounts.positive, color: 'bg-green-500' },
      { outcome: 'Neutral', count: outcomeCounts.neutral, color: 'bg-blue-500' },
      { outcome: 'Negative', count: outcomeCounts.negative, color: 'bg-red-500' },
      { outcome: 'No Response', count: outcomeCounts['no-response'], color: 'bg-amber-500' },
    ];
  }, [allUserData]);

  const marketingChannelUsage = useMemo(() => {
    let emailCount = 0;
    let smsCount = 0;
    let socialCount = 0;
    let emailTemplates = 0;
    let smsTemplates = 0;
    let socialTemplates = 0;

    allUserData.forEach((userData) => {
      if (userData.outreachHistory) {
        userData.outreachHistory.forEach((history) => {
          if (history.channel === 'email') emailCount++;
          else if (history.channel === 'sms') smsCount++;
          else if (history.channel === 'social') socialCount++;
        });
      }

      if (userData.outreachTemplates) {
        userData.outreachTemplates.forEach((template) => {
          if (template.channel === 'email') emailTemplates++;
          else if (template.channel === 'sms') smsTemplates++;
          else if (template.channel === 'social') socialTemplates++;
        });
      }
    });

    return {
      email: { count: emailCount, templates: emailTemplates },
      sms: { count: smsCount, templates: smsTemplates },
      social: { count: socialCount, templates: socialTemplates },
    };
  }, [allUserData]);

  const outreachGoalPerformance = useMemo(() => {
    let totalTarget = 0;
    let totalCompleted = 0;
    let totalResponses = 0;

    allUserData.forEach((userData) => {
      if (userData.monthlyGoals) {
        userData.monthlyGoals.forEach((goal) => {
          totalTarget += goal.targetOutreach || 0;
          totalCompleted += goal.completed || 0;
          totalResponses += goal.responses || 0;
        });
      }
    });

    const completionRate = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;

    return {
      totalTarget,
      totalCompleted,
      totalResponses,
      completionRate,
    };
  }, [allUserData]);

  const perUserCRMData = useMemo(() => {
    return allUserData
      .filter(
        (userData) =>
          (userData.customers && userData.customers.length > 0) ||
          (userData.outreachContacts && userData.outreachContacts.length > 0)
      )
      .map((userData) => {
        const customers = userData.customers?.length || 0;
        const contacts = userData.outreachContacts?.length || 0;
        const messagesSent = userData.outreachHistory?.length || 0;

        let interactions = 0;
        if (userData.customers) {
          userData.customers.forEach((customer) => {
            if (customer.interactions) {
              interactions += customer.interactions.length;
            }
          });
        }

        return {
          userId: userData.userId,
          businessName: userData.businessName || userData.userId,
          customers,
          contacts,
          interactions,
          messagesSent,
        };
      })
      .sort((a, b) => b.customers - a.customers);
  }, [allUserData]);

  const maxOutcomeCount = Math.max(...interactionOutcomes.map((o) => o.count), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">CRM & Marketing</h1>
        <p className="text-gray-600 mt-1">Customer and outreach data across all businesses</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card p-6">
          <div className="text-sm font-medium text-gray-600">Total CRM Customers</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCustomers}</div>
        </div>
        <div className="admin-card p-6">
          <div className="text-sm font-medium text-gray-600">Total Outreach Contacts</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats.totalOutreachContacts}</div>
        </div>
        <div className="admin-card p-6">
          <div className="text-sm font-medium text-gray-600">Total Interactions</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.totalInteractions}</div>
        </div>
        <div className="admin-card p-6">
          <div className="text-sm font-medium text-gray-600">Messages Sent</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">{stats.totalMessagesSent}</div>
        </div>
      </div>

      {/* Customer Status Distribution */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Status Distribution</h2>
        <div className="space-y-4">
          {customerStatusDistribution.map((item) => (
            <div key={item.status} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{item.status}</span>
                <span className="text-gray-600">
                  {item.count} customers ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interaction Outcomes */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Interaction Outcomes</h2>
        <div className="space-y-3">
          {interactionOutcomes.map((outcome) => (
            <div key={outcome.outcome} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{outcome.outcome}</span>
                <span className="text-gray-600">{outcome.count} interactions</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${outcome.color}`}
                  style={{ width: `${(outcome.count / maxOutcomeCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marketing Channel Usage */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Marketing Channel Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <div className="text-4xl mb-2">📧</div>
            <div className="text-2xl font-bold text-blue-600">{marketingChannelUsage.email.count}</div>
            <div className="text-sm text-gray-700 font-medium">Email Messages</div>
            <div className="text-xs text-gray-600 mt-1">{marketingChannelUsage.email.templates} templates</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
            <div className="text-4xl mb-2">💬</div>
            <div className="text-2xl font-bold text-green-600">{marketingChannelUsage.sms.count}</div>
            <div className="text-sm text-gray-700 font-medium">SMS Messages</div>
            <div className="text-xs text-gray-600 mt-1">{marketingChannelUsage.sms.templates} templates</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
            <div className="text-4xl mb-2">📱</div>
            <div className="text-2xl font-bold text-purple-600">{marketingChannelUsage.social.count}</div>
            <div className="text-sm text-gray-700 font-medium">Social Messages</div>
            <div className="text-xs text-gray-600 mt-1">{marketingChannelUsage.social.templates} templates</div>
          </div>
        </div>
      </div>

      {/* Outreach Goal Performance */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Outreach Goal Performance</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{outreachGoalPerformance.totalTarget}</div>
              <div className="text-sm text-gray-600 mt-1">Target Outreach</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{outreachGoalPerformance.totalCompleted}</div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{outreachGoalPerformance.totalResponses}</div>
              <div className="text-sm text-gray-600 mt-1">Responses</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Completion Rate</span>
              <span className="text-gray-600">{outreachGoalPerformance.completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                style={{ width: `${Math.min(outreachGoalPerformance.completionRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-User CRM Table */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">CRM Data by User</h2>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  User/Business
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Customers
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Contacts
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Interactions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Messages Sent
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {perUserCRMData.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.businessName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.customers}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.contacts}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.interactions}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.messagesSent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CRMOverview;
