import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useStore } from '../contexts/StoreContext';
import { Search, Trash2, AlertTriangle, ClipboardList } from 'lucide-react';

const Transactions = () => {
    const { getAllTransactions, getTodaysSales, softDeleteInvoice, getDeletedInvoices, deletedInvoices } = useStore();
    const transactions = getAllTransactions();
    const todaysSales = getTodaysSales();

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Delete state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [deletionReason, setDeletionReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Deletion logs state
    const [showDeletionLogs, setShowDeletionLogs] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);

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

    // Open delete confirmation
    const confirmDelete = (tx) => {
        setTransactionToDelete(tx);
        setDeletionReason('');
        setShowDeleteConfirm(true);
    };

    // Handle delete
    const handleDelete = async () => {
        if (!transactionToDelete) return;
        setIsDeleting(true);

        const result = await softDeleteInvoice(transactionToDelete.id, deletionReason);

        setIsDeleting(false);
        if (result.success) {
            setShowDeleteConfirm(false);
            setTransactionToDelete(null);
            setDeletionReason('');
        } else {
            alert('Failed to delete: ' + (result.error || 'Unknown error'));
        }
    };

    // Open deletion logs
    const openDeletionLogs = async () => {
        setLoadingLogs(true);
        setShowDeletionLogs(true);
        await getDeletedInvoices();
        setLoadingLogs(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ margin: 0 }}>All Transactions</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Button variant="secondary" onClick={openDeletionLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ClipboardList size={16} /> Deletion Logs
                    </Button>
                    <div style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--bg-accent)',
                        borderRadius: '6px',
                        fontWeight: '600'
                    }}>
                        Today ({today}): <span style={{ color: 'var(--accent)' }}>AED {todaysSales}</span>
                    </div>
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
                                <th style={{ textAlign: 'center' }}>Actions</th>
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
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => confirmDelete(tx)}
                                                title="Delete Transaction"
                                                style={{ color: 'var(--danger)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="⚠️ Confirm Deletion"
            >
                {transactionToDelete && (
                    <div>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem'
                        }}>
                            <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--danger)' }}>
                                    Are you sure you want to delete this transaction?
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    This will reverse the effect on reports, dashboard, and totals.
                                </div>
                            </div>
                        </div>

                        {/* Transaction Details */}
                        <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Transaction ID</span>
                                <span style={{ fontWeight: '600' }}>#{transactionToDelete.id}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Customer</span>
                                <span style={{ fontWeight: '600' }}>{transactionToDelete.customer}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                                <span style={{ fontWeight: '700', color: 'var(--success)' }}>AED {transactionToDelete.total}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Date</span>
                                <span>{formatDate(transactionToDelete.date)}</span>
                            </div>
                        </div>

                        {/* Deletion Reason */}
                        <div className="form-group">
                            <label className="form-label">Reason for Deletion (Optional)</label>
                            <textarea
                                className="input"
                                value={deletionReason}
                                onChange={(e) => setDeletionReason(e.target.value)}
                                placeholder="Why is this transaction being deleted?"
                                rows={2}
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                            <Button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
                            >
                                <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Deletion Logs Modal */}
            <Modal
                isOpen={showDeletionLogs}
                onClose={() => setShowDeletionLogs(false)}
                title="🗂️ Deletion Logs"
            >
                <div>
                    {loadingLogs ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Loading deletion logs...
                        </div>
                    ) : deletedInvoices.length > 0 ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {deletedInvoices.map((inv, index) => (
                                <div
                                    key={inv.id || index}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--danger)',
                                        marginBottom: '0.75rem',
                                        background: 'rgba(239, 68, 68, 0.05)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div>
                                            <span style={{ fontWeight: '600' }}>#{inv.id}</span>
                                            <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                                                {inv.customer_name}
                                            </span>
                                        </div>
                                        <span style={{
                                            padding: '0.125rem 0.375rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: 'var(--danger)',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            DELETED
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        <span style={{ textDecoration: 'line-through', color: 'var(--danger)', fontWeight: '600' }}>
                                            AED {inv.total}
                                        </span>
                                        <span style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>
                                            {inv.is_quick_sale ? 'Quick Sale' : 'Invoice'}
                                        </span>
                                    </div>

                                    {/* Deletion Info */}
                                    <div style={{
                                        marginTop: '0.75rem',
                                        padding: '0.75rem',
                                        background: 'var(--bg-accent)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Deleted By</span>
                                            <span style={{ fontWeight: '600' }}>{inv.deleted_by || 'Unknown'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Deleted At</span>
                                            <span>{inv.deleted_at ? new Date(inv.deleted_at).toLocaleString('en-GB') : 'N/A'}</span>
                                        </div>
                                        {inv.deletion_reason && (
                                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                                                <strong>Reason:</strong> {inv.deletion_reason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No deleted transactions found
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <Button variant="secondary" onClick={() => setShowDeletionLogs(false)}>Close</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Transactions;
