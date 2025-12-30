import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import { useStore } from '../contexts/StoreContext';
import { Search } from 'lucide-react';

const Transactions = () => {
    const { getAllTransactions, getTodaysSales } = useStore();
    const transactions = getAllTransactions();
    const todaysSales = getTodaysSales();

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Filter transactions
    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch =
            tx.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.id.toString().includes(searchTerm);
        const matchesType = typeFilter === 'All' || tx.type === typeFilter;
        const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Get today's date for display
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ margin: 0 }}>All Transactions</h2>
                <div style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--bg-accent)',
                    borderRadius: '6px',
                    fontWeight: '600'
                }}>
                    Today ({today}): <span style={{ color: 'var(--accent)' }}>AED {todaysSales}</span>
                </div>
            </div>

            {/* Search and Filters */}
            <Card style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search by customer or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <div style={{ minWidth: '140px' }}>
                        <Select
                            options={[
                                { value: 'All', label: 'All Types' },
                                { value: 'Invoice', label: 'Invoice' },
                                { value: 'Quick Sale', label: 'Quick Sale' }
                            ]}
                            value={typeFilter}
                            onChange={setTypeFilter}
                            placeholder="All Types"
                        />
                    </div>
                    <div style={{ minWidth: '140px' }}>
                        <Select
                            options={[
                                { value: 'All', label: 'All Status' },
                                { value: 'Paid', label: 'Paid' },
                                { value: 'Pending', label: 'Pending' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            placeholder="All Status"
                        />
                    </div>
                </div>
            </Card>

            <Card>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Customer</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td style={{ fontWeight: '600' }}>#{tx.id}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{formatDate(tx.date)}</td>
                                        <td>
                                            <span className={`badge ${tx.type === 'Invoice' ? 'badge-warning' : 'badge-success'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td>{tx.customer}</td>
                                        <td>{tx.paymentType}</td>
                                        <td>
                                            <span className={`badge ${tx.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: '600' }}>AED {tx.total}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Transactions;
