import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import ClientView from './ClientView';

const SupplierView = ({ supplier, onBack }) => {
    const { getClientsBySupplier, getClientStats, getSupplierStats, addClient, deleteClient } = useFinance();
    const [selectedClient, setSelectedClient] = useState(null);
    const [showAddClient, setShowAddClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');

    const clients = getClientsBySupplier(supplier);
    const supplierStats = getSupplierStats(supplier);

    const handleAddClient = () => {
        if (addClient(newClientName, supplier)) {
            setNewClientName('');
            setShowAddClient(false);
        }
    };

    const handleDeleteClient = (e, clientName) => {
        e.stopPropagation();
        if (deleteClient(clientName, supplier)) {
            // Client deleted successfully
        }
    };

    if (selectedClient) {
        return (
            <ClientView
                clientName={selectedClient}
                supplier={supplier}
                onBack={() => setSelectedClient(null)}
            />
        );
    }

    return (
        <div className="supplier-view">
            <button className="back-btn" onClick={onBack}>&larr; Back to Dashboard</button>
            <div className="supplier-view-header">
                <div>
                    <h2>{supplier} Overview</h2>
                    <div className="supplier-budget-pill">
                        Budget Status: <span className={supplierStats.remainingBudget >= 0 ? 'positive' : 'negative'}>
                            ₹{supplierStats.remainingBudget.toLocaleString()} remaining
                        </span>
                    </div>
                </div>
                <button
                    className="add-btn"
                    onClick={() => setShowAddClient(true)}
                    title="Add New Client"
                >
                    + Add Client
                </button>
            </div>

            {showAddClient && (
                <div className="add-client-modal">
                    <div className="modal-content">
                        <h3>Add New Client</h3>
                        <input
                            type="text"
                            placeholder="Enter client name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddClient()}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button onClick={handleAddClient} className="save-btn">Add</button>
                            <button onClick={() => { setShowAddClient(false); setNewClientName(''); }} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="client-list">
                {clients.length === 0 ? (
                    <p className="empty-msg">No clients found for this supplier.</p>
                ) : (
                    clients.map(clientName => {
                        const stats = getClientStats(clientName, supplier);
                        return (
                            <div
                                key={clientName}
                                className="client-card"
                            >
                                <div className="client-card-content" onClick={() => setSelectedClient(clientName)}>
                                    <h4>{clientName}</h4>
                                    <div className="client-stats">
                                        <div className="stat-pill primary">
                                            Profit: ₹{stats.profit.toLocaleString()}
                                        </div>
                                        <div className="stat-pill secondary">
                                            Collecting: ₹{stats.totalCredit.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="client-delete-btn"
                                    onClick={(e) => handleDeleteClient(e, clientName)}
                                    title="Delete Client"
                                >
                                    🗑️
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SupplierView;
