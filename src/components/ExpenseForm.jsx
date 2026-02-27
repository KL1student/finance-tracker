import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

const ExpenseForm = () => {
    const { addExpense } = useFinance();
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Personal',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addExpense({
            ...formData,
            amount: Number(formData.amount)
        });
        setFormData({
            name: '',
            category: 'Personal',
            amount: '',
            date: new Date().toISOString().split('T')[0]
        });
        setIsCustomCategory(false);

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
    };

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        if (val === 'Custom') {
            setIsCustomCategory(true);
            setFormData({ ...formData, category: '' });
        } else {
            setIsCustomCategory(false);
            setFormData({ ...formData, category: val });
        }
    };

    return (
        <div className="transaction-form-container expense-form-container relative">
            {showSuccess && (
                <div className="toast-notification">Expense Added!</div>
            )}
            <h3>Add Expense</h3>
            <form onSubmit={handleSubmit} className="transaction-form">
                <div className="form-group">
                    <label>Expense Name</label>
                    <input
                        type="text"
                        placeholder="e.g., Office Rent, Tea"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    {!isCustomCategory ? (
                        <select
                            value={formData.category}
                            onChange={handleCategoryChange}
                        >
                            <option value="Personal">Personal</option>
                            <option value="Shop">Shop</option>
                            <option value="Custom">Other (Custom)</option>
                        </select>
                    ) : (
                        <div className="custom-input-wrapper">
                            <input
                                type="text"
                                placeholder="Enter custom category"
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="back-to-select"
                                onClick={() => setIsCustomCategory(false)}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Amount (₹)</label>
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
                    <label>Date</label>
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <button type="submit" className="submit-btn">Save Expense</button>
            </form>
        </div>
    );
};

export default ExpenseForm;
