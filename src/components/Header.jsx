import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { generateMonthlyReport } from '../utils/ReportGenerator';
import Settings from './Settings';

const Header = ({ setView, currentView }) => {
    const { getGlobalStats, selectedMonth, setSelectedMonth, darkMode, setDarkMode } = useFinance();
    const {
        monthlyCredit,
        monthlyDebit,
        monthlyExpense,
        monthlyProfit,
        allTimeNet,
        allTimeProfit,
        monthlyTransactions
    } = getGlobalStats();
    const [showSettings, setShowSettings] = useState(false);

    const handleExport = () => {
        generateMonthlyReport(monthlyTransactions, selectedMonth);
    };

    // Generate last 12 months for selector
    const months = [];
    for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push(d.toISOString().slice(0, 7));
    }

    return (
        <header className="header">
            <div className="header-top">
                <div className="logo-group">
                    <div className="logo" onClick={() => setView('dashboard')}>
                        TravelFinance
                    </div>
                    <nav className="nav-links">
                        <button
                            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setView('dashboard')}
                        >
                            Transactions
                        </button>
                        <button
                            className={`nav-link ${currentView === 'expenses' ? 'active' : ''}`}
                            onClick={() => setView('expenses')}
                        >
                            Expenses
                        </button>
                    </nav>
                </div>

                <div className="header-controls">
                    <button
                        className="theme-toggle"
                        onClick={() => setDarkMode(!darkMode)}
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="month-selector"
                    >
                        <option value="all">All Time</option>
                        {months.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>

                    <button className="export-btn" onClick={handleExport}>
                        Export XLSX
                    </button>

                    <button
                        className="settings-toggle"
                        onClick={() => setShowSettings(true)}
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            {showSettings && <Settings onClose={() => setShowSettings(false)} />}

            <div className="global-stats">
                <div className="stat-item main">
                    <span className="label">Total Profit (All Time)</span>
                    <span className={`value ${allTimeProfit >= 0 ? 'positive' : 'negative'}`}>
                        ₹{allTimeProfit.toLocaleString()}
                    </span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="label">Monthly Profit</span>
                    <span className={`value ${monthlyProfit >= 0 ? 'positive' : 'negative'}`}>
                        ₹{monthlyProfit.toLocaleString()}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="label">Monthly Credit</span>
                    <span className="value credit">+₹{monthlyCredit.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                    <span className="label">Monthly Debit</span>
                    <span className="value debit">-₹{monthlyDebit.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                    <span className="label">Monthly Expense</span>
                    <span className="value expense">-₹{monthlyExpense.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                    <span className="label">Total Net</span>
                    <span className={`value ${allTimeNet >= 0 ? 'positive' : 'negative'}`}>
                        ₹{allTimeNet.toLocaleString()}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Header;
