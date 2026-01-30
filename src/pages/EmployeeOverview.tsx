import React, { useMemo } from 'react';
import { getAllPlatformData, getAllUserDataArray, getTotalEmployees, formatCurrency } from '../utils/dataReader';
import { StoredUser, UserData, Employee } from '../types';

const EmployeeOverview: React.FC = () => {
  const platformData = getAllPlatformData();
  const allUserData = getAllUserDataArray(platformData);

  const stats = useMemo(() => {
    const totalEmployees = getTotalEmployees(allUserData);
    let activeEmployees = 0;
    let totalSatisfaction = 0;
    let satisfactionCount = 0;
    let totalMonthlyPayroll = 0;

    allUserData.forEach((userData) => {
      if (userData.employees && userData.employees.length > 0) {
        userData.employees.forEach((employee) => {
          if (employee.status === 'active') {
            activeEmployees++;
          }

          if (employee.satisfactionRating) {
            totalSatisfaction += employee.satisfactionRating;
            satisfactionCount++;
          }

          // Calculate monthly payroll
          if (employee.payType === 'salary') {
            totalMonthlyPayroll += employee.payRate / 12;
          } else if (employee.payType === 'hourly') {
            totalMonthlyPayroll += employee.payRate * (employee.hoursPerWeek || 0) * 4.33;
          }
        });
      }
    });

    const avgSatisfaction = satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0;

    return {
      totalEmployees,
      activeEmployees,
      avgSatisfaction,
      totalMonthlyPayroll,
    };
  }, [allUserData]);

  const departmentDistribution = useMemo(() => {
    const deptCounts: Record<string, number> = {};

    allUserData.forEach((userData) => {
      if (userData.employees && userData.employees.length > 0) {
        userData.employees.forEach((employee) => {
          const dept = employee.department || 'Unknown';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
      }
    });

    return Object.entries(deptCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
  }, [allUserData]);

  const satisfactionDistribution = useMemo(() => {
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    allUserData.forEach((userData) => {
      if (userData.employees && userData.employees.length > 0) {
        userData.employees.forEach((employee) => {
          if (employee.satisfactionRating) {
            ratingCounts[employee.satisfactionRating]++;
          }
        });
      }
    });

    return [
      { rating: 5, label: '5 Stars', count: ratingCounts[5], color: 'bg-green-500' },
      { rating: 4, label: '4 Stars', count: ratingCounts[4], color: 'bg-blue-500' },
      { rating: 3, label: '3 Stars', count: ratingCounts[3], color: 'bg-amber-500' },
      { rating: 2, label: '2 Stars', count: ratingCounts[2], color: 'bg-orange-500' },
      { rating: 1, label: '1 Star', count: ratingCounts[1], color: 'bg-red-500' },
    ];
  }, [allUserData]);

  const payTypeAndStatus = useMemo(() => {
    let salaryCount = 0;
    let hourlyCount = 0;
    let activeCount = 0;
    let onLeaveCount = 0;
    let terminatedCount = 0;

    allUserData.forEach((userData) => {
      if (userData.employees && userData.employees.length > 0) {
        userData.employees.forEach((employee) => {
          if (employee.payType === 'salary') salaryCount++;
          else if (employee.payType === 'hourly') hourlyCount++;

          if (employee.status === 'active') activeCount++;
          else if (employee.status === 'on-leave') onLeaveCount++;
          else if (employee.status === 'terminated') terminatedCount++;
        });
      }
    });

    return {
      payType: { salary: salaryCount, hourly: hourlyCount },
      status: { active: activeCount, onLeave: onLeaveCount, terminated: terminatedCount },
    };
  }, [allUserData]);

  const perUserData = useMemo(() => {
    return allUserData
      .filter((userData) => userData.employees && userData.employees.length > 0)
      .map((userData) => {
        const employees = userData.employees || [];
        const totalEmployees = employees.length;
        const activeEmployees = employees.filter((e) => e.status === 'active').length;
        const activePercentage = totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0;

        let totalSatisfaction = 0;
        let satisfactionCount = 0;
        let monthlyPayroll = 0;

        employees.forEach((employee) => {
          if (employee.satisfactionRating) {
            totalSatisfaction += employee.satisfactionRating;
            satisfactionCount++;
          }

          if (employee.payType === 'salary') {
            monthlyPayroll += employee.payRate / 12;
          } else if (employee.payType === 'hourly') {
            monthlyPayroll += employee.payRate * (employee.hoursPerWeek || 0) * 4.33;
          }
        });

        const avgSatisfaction = satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0;

        return {
          userId: userData.userId,
          businessName: userData.businessName || userData.userId,
          totalEmployees,
          avgSatisfaction,
          monthlyPayroll,
          activePercentage,
        };
      })
      .sort((a, b) => b.totalEmployees - a.totalEmployees);
  }, [allUserData]);

  const maxDeptCount = Math.max(...departmentDistribution.map((d) => d.count), 1);
  const maxRatingCount = Math.max(...satisfactionDistribution.map((s) => s.count), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">HR Overview</h1>
        <p className="text-gray-600 mt-1">Employee data across all businesses</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card p-6">
          <div className="text-sm font-medium text-gray-600">Total Employees</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEmployees}</div>
        </div>
        <div className="admin-card p-6">
          <div className="text-sm font-medium text-gray-600">Active Employees</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.activeEmployees}</div>
        </div>
        <div className="admin-card p-6">
          <div className="text-sm font-medium text-gray-600">Avg Satisfaction</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {stats.avgSatisfaction.toFixed(1)}/5
          </div>
        </div>
        <div className="admin-card p-6">
          <div className="text-sm font-medium text-gray-600">Total Monthly Payroll</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {formatCurrency(stats.totalMonthlyPayroll)}
          </div>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Distribution</h2>
        <div className="space-y-3">
          {departmentDistribution.map((dept, index) => (
            <div key={dept.department} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{dept.department}</span>
                <span className="text-gray-600">{dept.count} employees</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full bg-blue-${Math.min(900 - index * 100, 600)}`}
                  style={{ width: `${(dept.count / maxDeptCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Satisfaction Score Distribution */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Satisfaction Score Distribution</h2>
        <div className="space-y-3">
          {satisfactionDistribution.map((item) => (
            <div key={item.rating} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-gray-600">{item.count} employees</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${item.color}`}
                  style={{ width: `${(item.count / maxRatingCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pay Type & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pay Type Distribution</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Salary</span>
                <span className="text-gray-600">{payTypeAndStatus.payType.salary} employees</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-blue-500"
                  style={{
                    width: `${
                      (payTypeAndStatus.payType.salary /
                        (payTypeAndStatus.payType.salary + payTypeAndStatus.payType.hourly || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Hourly</span>
                <span className="text-gray-600">{payTypeAndStatus.payType.hourly} employees</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{
                    width: `${
                      (payTypeAndStatus.payType.hourly /
                        (payTypeAndStatus.payType.salary + payTypeAndStatus.payType.hourly || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Distribution</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <span className="text-gray-900 font-semibold">{payTypeAndStatus.status.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                  On Leave
                </span>
              </div>
              <span className="text-gray-900 font-semibold">{payTypeAndStatus.status.onLeave}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  Terminated
                </span>
              </div>
              <span className="text-gray-900 font-semibold">{payTypeAndStatus.status.terminated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-User HR Table */}
      <div className="admin-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">HR Data by User</h2>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  User/Business
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Avg Satisfaction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Monthly Payroll
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Active %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {perUserData.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.businessName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.totalEmployees}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.avgSatisfaction > 0 ? `${user.avgSatisfaction.toFixed(1)}/5` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(user.monthlyPayroll)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.activePercentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOverview;
