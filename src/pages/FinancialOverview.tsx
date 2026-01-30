import React, { useMemo, useState } from 'react';
import {
  getAllPlatformData,
  getAllUserDataArray,
  calculateTotalRevenue,
  calculateTotalExpenses,
  formatCurrency
} from '../utils/dataReader';
import type { UserData, Transaction, Invoice } from '../types';

type SortColumn = 'name' | 'company' | 'income' | 'expenses' | 'net' | 'invoices' | 'transactions';
type SortDirection = 'asc' | 'desc';

export default function FinancialOverview() {
  const platformData = useMemo(() => getAllPlatformData(), []);
  const allUserData = useMemo(() => getAllUserDataArray(platformData), [platformData]);

  const [sortColumn, setSortColumn] = useState<SortColumn>('net');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Calculate total revenue and expenses across all users
  const totalRevenue = useMemo(() => {
    return calculateTotalRevenue(allUserData);
  }, [allUserData]);

  const totalExpenses = useMemo(() => {
    return calculateTotalExpenses(allUserData);
  }, [allUserData]);

  const netCashFlow = totalRevenue - totalExpenses;

  // Count all transactions
  const totalTransactions = useMemo(() => {
    return allUserData.reduce((sum, user) => {
      return sum + (user.transactions?.length || 0);
    }, 0);
  }, [allUserData]);

  // Aggregate income by category
  const incomeByCategory = useMemo(() => {
    const categories: Record<string, number> = {
      Sales: 0,
      Services: 0,
      Consulting: 0,
      Investments: 0,
      Refunds: 0,
      Other: 0,
    };

    allUserData.forEach(user => {
      user.transactions?.forEach(txn => {
        if (txn.type === 'income' && txn.category) {
          const category = txn.category;
          if (category in categories) {
            categories[category] += txn.amount;
          } else {
            categories.Other += txn.amount;
          }
        }
      });
    });

    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [allUserData]);

  // Aggregate expenses by category
  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {
      Rent: 0,
      Utilities: 0,
      Payroll: 0,
      Marketing: 0,
      Software: 0,
      Supplies: 0,
      Insurance: 0,
      Travel: 0,
      Meals: 0,
      'Professional Services': 0,
      Equipment: 0,
      Other: 0,
    };

    allUserData.forEach(user => {
      user.transactions?.forEach(txn => {
        if (txn.type === 'expense' && txn.category) {
          const category = txn.category;
          if (category in categories) {
            categories[category] += txn.amount;
          } else {
            categories.Other += txn.amount;
          }
        }
      });
    });

    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [allUserData]);

  // Invoice statistics
  const invoiceStats = useMemo(() => {
    const stats = {
      total: 0,
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      totalAmount: 0,
    };

    allUserData.forEach(user => {
      user.invoices?.forEach(invoice => {
        stats.total++;
        stats.totalAmount += invoice.total || 0;

        const status = invoice.status || 'draft';
        if (status === 'draft') stats.draft++;
        else if (status === 'sent') stats.sent++;
        else if (status === 'paid') stats.paid++;
        else if (status === 'overdue') stats.overdue++;
      });
    });

    return stats;
  }, [allUserData]);

  // Per-user financial data
  const userFinancialData = useMemo(() => {
    return allUserData
      .map(user => {
        const income = user.transactions
          ?.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) || 0;

        const expenses = user.transactions
          ?.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0) || 0;

        const net = income - expenses;
        const invoiceCount = user.invoices?.length || 0;
        const transactionCount = user.transactions?.length || 0;

        return {
          name: user.name || 'Unknown',
          company: (user.businessPlanAnswers?.company_name as string) || 'N/A',
          income,
          expenses,
          net,
          invoices: invoiceCount,
          transactions: transactionCount,
        };
      })
      .filter(user => user.transactions > 0 || user.invoices > 0);
  }, [allUserData]);

  // Sort user financial data
  const sortedUserData = useMemo(() => {
    const sorted = [...userFinancialData];
    sorted.sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [userFinancialData, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getMaxAmount = (data: { amount: number }[]) => {
    return Math.max(...data.map(d => d.amount), 1);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Financial Overview</h1>
        <p className="page-description">Aggregate financial data across all businesses</p>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card stat-card-green">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(totalRevenue)}</div>
          <div className="stat-detail">across all users</div>
        </div>
        <div className="stat-card stat-card-red">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{formatCurrency(totalExpenses)}</div>
          <div className="stat-detail">across all users</div>
        </div>
        <div className="stat-card stat-card-blue">
          <div className="stat-label">Net Cash Flow</div>
          <div className="stat-value">{formatCurrency(netCashFlow)}</div>
          <div className="stat-detail">{netCashFlow >= 0 ? 'positive' : 'negative'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{totalTransactions}</div>
          <div className="stat-detail">all time</div>
        </div>
      </div>

      {/* Income Categories Breakdown */}
      {incomeByCategory.length > 0 && (
        <div className="admin-card">
          <h2>Income Categories Breakdown</h2>
          <div className="bar-chart">
            {incomeByCategory.map((item, index) => {
              const maxAmount = getMaxAmount(incomeByCategory);
              const percentage = (item.amount / maxAmount) * 100;
              return (
                <div key={item.category} className="bar-row">
                  <div className="bar-label">{item.category}</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill bar-fill-green"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: `hsl(140, 60%, ${40 - index * 3}%)`
                      }}
                    />
                  </div>
                  <div className="bar-value">{formatCurrency(item.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense Categories Breakdown */}
      {expensesByCategory.length > 0 && (
        <div className="admin-card">
          <h2>Expense Categories Breakdown</h2>
          <div className="bar-chart">
            {expensesByCategory.map((item, index) => {
              const maxAmount = getMaxAmount(expensesByCategory);
              const percentage = (item.amount / maxAmount) * 100;
              return (
                <div key={item.category} className="bar-row">
                  <div className="bar-label">{item.category}</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill bar-fill-red"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: `hsl(${index % 2 === 0 ? '0' : '20'}, 70%, ${50 - index * 2}%)`
                      }}
                    />
                  </div>
                  <div className="bar-value">{formatCurrency(item.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoice Statistics */}
      <div className="admin-card">
        <h2>Invoice Statistics</h2>
        <div className="invoice-stats-grid">
          <div className="invoice-stat">
            <div className="invoice-stat-label">Total Invoices</div>
            <div className="invoice-stat-value">{invoiceStats.total}</div>
          </div>
          <div className="invoice-stat">
            <div className="invoice-stat-label">Total Invoiced Amount</div>
            <div className="invoice-stat-value">{formatCurrency(invoiceStats.totalAmount)}</div>
          </div>
          <div className="invoice-status-badges">
            <div className="invoice-badge invoice-badge-draft">
              <span className="badge-label">Draft</span>
              <span className="badge-count">{invoiceStats.draft}</span>
            </div>
            <div className="invoice-badge invoice-badge-sent">
              <span className="badge-label">Sent</span>
              <span className="badge-count">{invoiceStats.sent}</span>
            </div>
            <div className="invoice-badge invoice-badge-paid">
              <span className="badge-label">Paid</span>
              <span className="badge-count">{invoiceStats.paid}</span>
            </div>
            <div className="invoice-badge invoice-badge-overdue">
              <span className="badge-label">Overdue</span>
              <span className="badge-count">{invoiceStats.overdue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-User Financial Table */}
      {sortedUserData.length > 0 && (
        <div className="admin-card">
          <h2>Per-User Financial Breakdown</h2>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable">
                    User Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('company')} className="sortable">
                    Company {sortColumn === 'company' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('income')} className="sortable">
                    Income {sortColumn === 'income' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('expenses')} className="sortable">
                    Expenses {sortColumn === 'expenses' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('net')} className="sortable">
                    Net {sortColumn === 'net' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('invoices')} className="sortable">
                    Invoices {sortColumn === 'invoices' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('transactions')} className="sortable">
                    Transactions {sortColumn === 'transactions' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedUserData.map((user, index) => (
                  <tr key={index}>
                    <td>{user.name}</td>
                    <td>{user.company}</td>
                    <td className="amount-cell amount-green">{formatCurrency(user.income)}</td>
                    <td className="amount-cell amount-red">{formatCurrency(user.expenses)}</td>
                    <td className={`amount-cell ${user.net >= 0 ? 'amount-green' : 'amount-red'}`}>
                      {formatCurrency(user.net)}
                    </td>
                    <td className="count-cell">{user.invoices}</td>
                    <td className="count-cell">{user.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
