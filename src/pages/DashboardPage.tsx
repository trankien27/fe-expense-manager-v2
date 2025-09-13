import React from 'react';
import MonthlySummary from '../components/MonthlySummary';
import RecentTransactions from '../components/RecentTransactions';
import ExpenseChart from '../components/ExpenseChart';
import Header from '../components/Header';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <Header />
          <div className="flex justify-between items-center py-6">
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Monthly Summary */}
          <MonthlySummary />

          {/* Recent Transactions and Expense Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentTransactions />
            <ExpenseChart />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;