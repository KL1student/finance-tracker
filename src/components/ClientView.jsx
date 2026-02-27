import React from 'react';
import { useFinance } from '../context/FinanceContext';

const ClientView = ({ clientName, supplier, onBack }) => {
    const { getClientStats, deleteTransaction } = useFinance();
    const { transactions, totalCredit, totalDebit, supplierCost, net, profit } = getClientStats(clientName, supplier);

    return (
        <div className="client-view">
            <button className="back-btn" onClick={onBack}>&larr; Back to {supplier}</button>

            <div className="client-header">
                <h2>{clientName} <small>({supplier})</small></h2>
                <div className="client-summary">
                    <div className="summary-item profit-item">
                        <span>Total Profit:</span>
                        <span className={profit >= 0 ? 'positive' : 'negative'}>₹{profit.toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                        <span>Collecting:</span>
                        <span className="credit">+₹{totalCredit.toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                        <span>Supplier Cost:</span>
                        <span className="debit">-₹{supplierCost.toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                        <span>Net Balance:</span>
                        <span className={net >= 0 ? 'positive' : 'negative'}>₹{net.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="transaction-history">
                <h3>Transaction History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Collection</th>
                            <th>Cost</th>
                            <th>Profit</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => {
                            const tProfit = t.amount - (t.supplierAmount || 0);
                            return (
                                <tr key={t.id}>
                                    <td>{t.date}</td>
                                    <td>
                                        <span className={`badge ${t.type}`}>{t.type.toUpperCase()}</span>
                                    </td>
                                    <td className="credit">₹{t.amount.toLocaleString()}</td>
                                    <td className="debit">₹{(t.supplierAmount || 0).toLocaleString()}</td>
                                    <td className={tProfit >= 0 ? 'positive' : 'negative'}>
                                        ₹{tProfit.toLocaleString()}
                                    </td>
                                    <td>
                                        <button
                                            className="delete-btn-icon"
                                            onClick={() => deleteTransaction(t.id)}
                                            title="Delete Transaction"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientView;
