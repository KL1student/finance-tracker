import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';

const TransactionForm = () => {
    const { suppliers, addTransaction } = useFinance();
    const [formData, setFormData] = useState({
        supplier: suppliers[0]?.name || '',
        clientName: '',
        amount: '',
        supplierAmount: '',
        type: 'credit',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!formData.supplier && suppliers.length > 0) {
            setFormData(prev => ({ ...prev, supplier: suppliers[0].name }));
        }
    }, [suppliers, formData.supplier]);

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        addTransaction({
            ...formData,
            amount: Number(formData.amount),
            supplierAmount: Number(formData.supplierAmount)
        });
        setFormData(prev => ({ ...prev, clientName: '', amount: '', supplierAmount: '' }));

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
    };

    const profit = (Number(formData.amount) || 0) - (Number(formData.supplierAmount) || 0);

    return (
        <div className="transaction-form-container relative">
            {showSuccess && (
                <div className="toast-notification">Transaction Added!</div>
            )}
            <h3>Add Transaction</h3>
            <form onSubmit={handleSubmit} className="transaction-form">
                <div className="form-group">
                    <label>Supplier</label>
                    <select
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    >
                        {suppliers.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Client Name</label>
                    <input
                        type="text"
                        placeholder="Enter client name"
                        required
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Your Amount (Client Paid)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            required
                            min="0"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Supplier Amount (Cost)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            required
                            min="0"
                            value={formData.supplierAmount}
                            onChange={(e) => setFormData({ ...formData, supplierAmount: e.target.value })}
                        />
                    </div>
                </div>

                <div className="profit-preview">
                    <span>Estimated Profit: </span>
                    <span className={profit >= 0 ? 'positive' : 'negative'}>₹{profit.toLocaleString()}</span>
                </div>

                <div className="form-group">
                    <label>Type</label>
                    <div className="type-toggle">
                        <button
                            type="button"
                            className={formData.type === 'credit' ? 'active credit' : ''}
                            onClick={() => setFormData({ ...formData, type: 'credit' })}
                        >Credit (Received)</button>
                        <button
                            type="button"
                            className={formData.type === 'debit' ? 'active debit' : ''}
                            onClick={() => setFormData({ ...formData, type: 'debit' })}
                        >Debit (Paid)</button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <button type="submit" className="submit-btn">Add Transaction</button>
            </form>
        </div>
    );
};

export default TransactionForm;
