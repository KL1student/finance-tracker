import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SupplierView from './components/SupplierView';
import TransactionForm from './components/TransactionForm';
import ExpenseForm from './components/ExpenseForm';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const handleSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setCurrentView('supplier');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="view-grid">
            <Dashboard onSelectSupplier={handleSelectSupplier} />
            <div className="side-forms">
              <TransactionForm />
              <ExpenseForm />
            </div>
          </div>
        );
      case 'supplier':
        return (
          <SupplierView
            supplier={selectedSupplier}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'expenses':
        return (
          <div className="view-grid single-column">
            <div className="expenses-view-wrap">
              <ExpenseManagement />
            </div>
          </div>
        );
      default:
        return <div>Page Not Found</div>;
    }
  };

  return (
    <FinanceProvider>
      <div className="app-container">
        <Header setView={setCurrentView} currentView={currentView} />
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </FinanceProvider>
  );
}

const ExpenseManagement = () => {
  const context = useFinance();

  // Fallback if context is not available yet
  const monthlyExpenses = context?.getGlobalStats?.().monthlyExpenses || [];
  const deleteExpense = context?.deleteExpense || (() => { });

  return (
    <div className="expense-management">
      <div className="dashboard-header">
        <h2>Expenses Overview</h2>
      </div>
      <div className="transaction-history">
        {monthlyExpenses.length === 0 ? (
          <p className="empty-msg">No expenses recorded for this month.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Category</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {monthlyExpenses.map(e => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.name}</td>
                  <td><span className="badge expense">{e.category}</span></td>
                  <td className="expense">-₹{e.amount.toLocaleString()}</td>
                  <td>
                    <button className="delete-btn-icon" onClick={() => deleteExpense(e.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default App;
