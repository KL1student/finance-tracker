import React, { createContext, useState, useContext, useEffect } from 'react';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    // Load from LocalStorage or Default
    const [googleSheetUrl, setGoogleSheetUrl] = useState(() => localStorage.getItem('google_sheet_url') || '');

    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('finance_transactions');
        return saved ? JSON.parse(saved) : [];
    });

    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('finance_expenses');
        return saved ? JSON.parse(saved) : [];
    });

    const [suppliers, setSuppliers] = useState(() => {
        const saved = localStorage.getItem('finance_suppliers');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration: If suppliers are just strings, convert to objects
            if (parsed.length > 0 && typeof parsed[0] === 'string') {
                return parsed.map(s => ({ name: s, allottedAmount: 0 }));
            }
            return parsed;
        }
        return [
            { name: 'Supplier A', allottedAmount: 0 },
            { name: 'Supplier B', allottedAmount: 0 },
            { name: 'Supplier C', allottedAmount: 0 }
        ];
    });

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('finance_dark_mode');
        return saved ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('finance_suppliers', JSON.stringify(suppliers));
    }, [suppliers]);

    useEffect(() => {
        localStorage.setItem('finance_expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('finance_dark_mode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Create a separate effect for URL changes
    useEffect(() => {
        if (googleSheetUrl) {
            localStorage.setItem('google_sheet_url', googleSheetUrl);
            fetchGlobalData();
        }
    }, [googleSheetUrl]);

    // Sync transactions to local storage as fallback/cache
    useEffect(() => {
        localStorage.setItem('finance_transactions', JSON.stringify(transactions));
    }, [transactions]);

    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const fetchGlobalData = async () => {
        if (!googleSheetUrl) return;
        try {
            const response = await fetch(googleSheetUrl);
            const data = await response.json();

            if (data.Transactions) {
                setTransactions(data.Transactions.map(d => ({
                    ...d,
                    amount: Number(d.amount),
                    supplierAmount: Number(d.supplierAmount || 0),
                    clientName: d.clientName || d.client || '',
                    id: d.id || ('sheet_' + Math.random())
                })));
            }
            if (data.Expenses) {
                setExpenses(data.Expenses.map(d => ({
                    ...d,
                    amount: Number(d.amount),
                    id: d.id || ('sheet_exp_' + Math.random())
                })));
            }
            if (data.Suppliers) {
                setSuppliers(data.Suppliers.map(d => ({
                    ...d,
                    allottedAmount: Number(d.allottedAmount || 0)
                })));
            }
        } catch (error) {
            console.error("Failed to fetch from sheet", error);
            alert("Failed to sync with Google Sheet. Check URL.");
        }
    };

    const apiPost = async (body) => {
        if (!googleSheetUrl) return;
        try {
            await fetch(googleSheetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } catch (error) {
            console.error("API POST failed", error);
        }
    };

    const deleteTransaction = async (id) => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;
        setTransactions((prev) => prev.filter(t => t.id !== id));
        apiPost({ action: 'delete', dataType: 'transaction', id: id });
    };

    const addTransaction = async (transaction) => {
        const newTrans = {
            ...transaction,
            id: Date.now().toString(),
            supplierAmount: Number(transaction.supplierAmount || 0)
        };
        setTransactions((prev) => [...prev, newTrans]);
        apiPost({ ...newTrans, dataType: 'transaction', action: 'add' });
    };

    const addExpense = (expense) => {
        const newExpense = { ...expense, id: Date.now().toString() };
        setExpenses(prev => [...prev, newExpense]);
        apiPost({ ...newExpense, dataType: 'expense', action: 'add' });
    };

    const deleteExpense = (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        setExpenses(prev => prev.filter(e => e.id !== id));
        apiPost({ action: 'delete', dataType: 'expense', id: id });
    };

    const addSupplier = (supplierName) => {
        if (!supplierName || supplierName.trim() === '') {
            alert('Supplier name cannot be empty!');
            return false;
        }
        if (suppliers.some(s => s.name === supplierName)) {
            alert('Supplier name already exists!');
            return false;
        }
        const newSupplier = { name: supplierName, allottedAmount: 0 };
        setSuppliers(prev => [...prev, newSupplier]);
        apiPost({ ...newSupplier, dataType: 'supplier', action: 'update' });
        return true;
    };

    const updateSupplierAllottedAmount = (supplierName, amount) => {
        setSuppliers(prev => prev.map(s =>
            s.name === supplierName ? { ...s, allottedAmount: Number(amount) } : s
        ));
        apiPost({ name: supplierName, allottedAmount: Number(amount), dataType: 'supplier', action: 'update' });
    };

    const deleteSupplier = (supplierName) => {
        if (!window.confirm(`Are you sure you want to delete "${supplierName}"? This will also delete all transactions for this supplier.`)) {
            return false;
        }
        setSuppliers(prev => prev.filter(s => s.name !== supplierName));
        setTransactions(prev => prev.filter(t => t.supplier !== supplierName));
        return true;
    };

    const renameSupplier = (oldName, newName) => {
        if (suppliers.some(s => s.name === newName)) {
            alert('Supplier name already exists!');
            return;
        }
        setSuppliers(prev => prev.map(s => s.name === oldName ? { ...s, name: newName } : s));
        setTransactions(prev => prev.map(t => t.supplier === oldName ? { ...t, supplier: newName } : t));
    };

    const addClient = (clientName, supplierName) => {
        if (!clientName || clientName.trim() === '') {
            alert('Client name cannot be empty!');
            return false;
        }
        const existingClients = getClientsBySupplier(supplierName);
        if (existingClients.includes(clientName)) {
            alert('Client already exists for this supplier!');
            return false;
        }
        const placeholderTransaction = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            clientName: clientName,
            supplier: supplierName,
            type: 'credit',
            amount: 0,
            supplierAmount: 0
        };
        addTransaction(placeholderTransaction);
        return true;
    };

    const deleteClient = (clientName, supplierName) => {
        if (!window.confirm(`Are you sure you want to delete "${clientName}"? This will delete all transactions for this client.`)) {
            return false;
        }
        setTransactions(prev => prev.filter(t => !(t.clientName === clientName && t.supplier === supplierName)));
        return true;
    };

    const isDateInSelectedMonth = (dateStr) => {
        if (selectedMonth === 'all') return true;
        return dateStr && dateStr.startsWith(selectedMonth);
    };

    const getSupplierStats = (supplierName) => {
        const supplierObj = suppliers.find(s => s.name === supplierName) || { allottedAmount: 0 };
        const supplierTransactions = transactions.filter(t =>
            t.supplier === supplierName && isDateInSelectedMonth(t.date)
        );

        const totalCredit = supplierTransactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalDebit = supplierTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalSupplierCost = supplierTransactions.reduce((sum, t) => sum + Number(t.supplierAmount || 0), 0);
        const remainingBudget = supplierObj.allottedAmount - totalSupplierCost;

        return {
            totalCredit,
            totalDebit,
            totalSupplierCost,
            remainingBudget,
            allottedAmount: supplierObj.allottedAmount,
            net: totalCredit - totalDebit
        };
    };

    const getGlobalStats = () => {
        const monthlyTransactions = transactions.filter(t => isDateInSelectedMonth(t.date));
        const monthlyExpensesList = expenses.filter(e => isDateInSelectedMonth(e.date));

        const getStats = (transList, expList) => {
            const credit = transList
                .filter(t => t.type === 'credit')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const debit = transList
                .filter(t => t.type === 'debit')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const supplierCost = transList.reduce((sum, t) => sum + Number(t.supplierAmount || 0), 0);

            const totalExp = expList.reduce((sum, e) => sum + Number(e.amount), 0);

            // Profit = (Credit - SupplierAmount) - Expenses
            // Note: In this business model, Debit (outgoing to client?) might be different, 
            // but the user specified: Profit = Amount - Supplier Amount - Expenses.
            // Usually "Amount" is "Credit" (what we receive).
            const profit = (credit - supplierCost) - totalExp;

            return { credit, debit, expense: totalExp, profit, net: credit - debit - totalExp };
        };

        const monthly = getStats(monthlyTransactions, monthlyExpensesList);
        const allTime = getStats(transactions, expenses);

        return {
            monthlyCredit: monthly.credit,
            monthlyDebit: monthly.debit,
            monthlyExpense: monthly.expense,
            monthlyProfit: monthly.profit,
            monthlyNet: monthly.net,
            allTimeNet: allTime.net,
            allTimeProfit: allTime.profit,
            monthlyTransactions: [...monthlyTransactions].reverse(),
            monthlyExpenses: [...monthlyExpensesList].reverse()
        };
    };

    const getClientStats = (clientName, supplierName) => {
        const clientTransactions = transactions.filter(t =>
            t.clientName === clientName &&
            t.supplier === supplierName
        );

        const filteredTransactions = clientTransactions.filter(t => isDateInSelectedMonth(t.date));

        const totalCredit = filteredTransactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalDebit = filteredTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const supplierCost = filteredTransactions.reduce((sum, t) => sum + Number(t.supplierAmount || 0), 0);
        const net = totalCredit - totalDebit;
        const profit = totalCredit - supplierCost;

        return { totalCredit, totalDebit, supplierCost, net, profit, transactions: [...filteredTransactions].reverse() };
    };

    const getClientsBySupplier = (supplierName) => {
        const supplierTransactions = transactions.filter(t => t.supplier === supplierName);
        const clients = [...new Set(supplierTransactions.map(t => t.clientName).reverse())];
        return clients;
    };

    const value = {
        transactions,
        suppliers,
        expenses,
        selectedMonth,
        setSelectedMonth,
        googleSheetUrl,
        setGoogleSheetUrl,
        darkMode,
        setDarkMode,
        addTransaction,
        deleteTransaction,
        addExpense,
        deleteExpense,
        addSupplier,
        deleteSupplier,
        renameSupplier,
        updateSupplierAllottedAmount,
        addClient,
        deleteClient,
        getSupplierStats,
        getGlobalStats,
        getClientsBySupplier,
        getClientStats
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
};
