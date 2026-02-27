import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

const Dashboard = ({ onSelectSupplier }) => {
    const {
        suppliers,
        getSupplierStats,
        renameSupplier,
        addSupplier,
        deleteSupplier,
        updateSupplierAllottedAmount,
        getGlobalStats
    } = useFinance();
    const globalStats = getGlobalStats();
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [newName, setNewName] = useState('');
    const [showAddSupplier, setShowAddSupplier] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');

    const handleStartEdit = (e, supplierName) => {
        e.stopPropagation();
        setEditingSupplier(supplierName);
        setNewName(supplierName);
    };

    const handleSaveRename = (e) => {
        e.stopPropagation();
        if (newName && newName !== editingSupplier) {
            renameSupplier(editingSupplier, newName);
        }
        setEditingSupplier(null);
    };

    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setEditingSupplier(null);
    };

    const handleAddSupplier = () => {
        if (addSupplier(newSupplierName)) {
            setNewSupplierName('');
            setShowAddSupplier(false);
        }
    };

    const handleDeleteSupplier = (e, supplierName) => {
        e.stopPropagation();
        if (deleteSupplier(supplierName)) {
            // Supplier deleted successfully
        }
    };

    const handleBudgetChange = (e, supplierName) => {
        e.stopPropagation();
        updateSupplierAllottedAmount(supplierName, e.target.value);
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Finance Overview</h2>
                <button
                    className="add-btn"
                    onClick={() => setShowAddSupplier(true)}
                    title="Add New Supplier"
                >
                    + Add Supplier
                </button>
            </div>

            <div className="summary-banner">
                <div className="summary-card main-profit">
                    <label>Monthly Profit</label>
                    <div className={`value ${globalStats.monthlyProfit >= 0 ? 'positive' : 'negative'}`}>
                        ₹{globalStats.monthlyProfit.toLocaleString()}
                    </div>
                </div>
                <div className="summary-card">
                    <label>Collections</label>
                    <div className="value credit">₹{globalStats.monthlyCredit.toLocaleString()}</div>
                </div>
                <div className="summary-card">
                    <label>Supplier Costs</label>
                    <div className="value debit">₹{(globalStats.monthlyCredit - globalStats.monthlyProfit - globalStats.monthlyExpense).toLocaleString()}</div>
                </div>
                <div className="summary-card accent">
                    <label>Total Expenses</label>
                    <div className="value expense">₹{globalStats.monthlyExpense.toLocaleString()}</div>
                </div>
            </div>

            <h3 className="section-title">Suppliers Overview</h3>

            {showAddSupplier && (
                <div className="add-supplier-modal">
                    <div className="modal-content">
                        <h3>Add New Supplier</h3>
                        <input
                            type="text"
                            placeholder="Enter supplier name"
                            value={newSupplierName}
                            onChange={(e) => setNewSupplierName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSupplier()}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button onClick={handleAddSupplier} className="save-btn">Add</button>
                            <button onClick={() => { setShowAddSupplier(false); setNewSupplierName(''); }} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="supplier-grid">
                {suppliers.map((s) => {
                    const stats = getSupplierStats(s.name);
                    const isAllottedDone = s.allottedAmount > 0;

                    return (
                        <div
                            key={s.name}
                            className="supplier-card"
                            onClick={() => onSelectSupplier(s.name)}
                        >
                            <div className="supplier-header">
                                {editingSupplier === s.name ? (
                                    <div className="rename-controls" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            autoFocus
                                        />
                                        <button onClick={handleSaveRename} className="save-btn">✓</button>
                                        <button onClick={handleCancelEdit} className="cancel-btn">✕</button>
                                    </div>
                                ) : (
                                    <div className="supplier-title-row">
                                        <h3>{s.name}</h3>
                                        <div className="supplier-actions">
                                            <button
                                                className="edit-btn"
                                                onClick={(e) => handleStartEdit(e, s.name)}
                                                title="Rename Supplier"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => handleDeleteSupplier(e, s.name)}
                                                title="Delete Supplier"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="supplier-stats">
                                <div className="budget-section" onClick={e => e.stopPropagation()}>
                                    <label>Allotted Amount:</label>
                                    <input
                                        type="number"
                                        value={s.allottedAmount}
                                        onChange={(e) => handleBudgetChange(e, s.name)}
                                        placeholder="Set budget"
                                        className="budget-input"
                                    />
                                </div>

                                <div className="stat-row">
                                    <span>Remaining Budget</span>
                                    <span className={`budget-value ${stats.remainingBudget < 0 ? 'negative' : 'positive'}`}>
                                        ₹{stats.remainingBudget.toLocaleString()}
                                    </span>
                                </div>

                                <div className="stat-divider"></div>

                                <div className="stat-row">
                                    <span>Total Collected</span>
                                    <span className="credit">₹{stats.totalCredit.toLocaleString()}</span>
                                </div>
                                <div className="stat-row">
                                    <span>Supplier Cost</span>
                                    <span className="debit">₹{stats.totalSupplierCost.toLocaleString()}</span>
                                </div>

                                <div className="stat-row net">
                                    <span>Total Profit</span>
                                    <span className={stats.net >= 0 ? 'positive' : 'negative'}>
                                        ₹{(stats.totalCredit - stats.totalSupplierCost).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Dashboard;
