import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { supabase } from '../services/supabase';
import { Search, Plus, Edit, Trash2, Eye, Building, Phone, Mail, DollarSign, CheckCircle, History, FileText, Printer, AlertTriangle, ClipboardList } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [supplierTransactions, setSupplierTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [lastPayment, setLastPayment] = useState(null);

    // Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [deletionReason, setDeletionReason] = useState('');

    // Deletion logs state
    const [showDeletionLogs, setShowDeletionLogs] = useState(false);
    const [deletedTransactions, setDeletedTransactions] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        mobile: '',
        email: '',
        address: '',
        category: 'General',
        trade_license: '',
        trn_number: '',
        bank_name: '',
        bank_account: '',
        iban: '',
        notes: '',
        status: 'Active'
    });

    // Payment form state
    const [paymentData, setPaymentData] = useState({
        amount: '',
        description: '',
        invoice_number: '',
        payment_method: 'Cash',
        notes: ''
    });

    const categories = [
        'General', 'Stationery', 'Printing', 'IT Services', 'Utilities',
        'Office Supplies', 'Furniture', 'Maintenance', 'Marketing', 'Other'
    ];

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        setLoading(true);

        // Check if suppliers table exists, if not we'll work with local state
        if (!supabase) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('Suppliers table may not exist yet:', error.message);
            // Create sample data for demo
            setSuppliers([]);
        } else {
            setSuppliers(data || []);
        }
        setLoading(false);
    };

    const filteredSuppliers = suppliers.filter(s => {
        const matchesSearch =
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.mobile?.includes(searchTerm);
        const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const openAddModal = () => {
        setEditingSupplier(null);
        setFormData({
            name: '',
            contact_person: '',
            mobile: '',
            email: '',
            address: '',
            category: 'General',
            trade_license: '',
            trn_number: '',
            bank_name: '',
            bank_account: '',
            iban: '',
            notes: '',
            status: 'Active'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name || '',
            contact_person: supplier.contact_person || '',
            mobile: supplier.mobile || '',
            email: supplier.email || '',
            address: supplier.address || '',
            category: supplier.category || 'General',
            trade_license: supplier.trade_license || '',
            trn_number: supplier.trn_number || '',
            bank_name: supplier.bank_name || '',
            bank_account: supplier.bank_account || '',
            iban: supplier.iban || '',
            notes: supplier.notes || '',
            status: supplier.status || 'Active'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            alert('Supplier name is required');
            return;
        }

        if (!supabase) {
            // Local mode - just update state
            if (editingSupplier) {
                setSuppliers(prev => prev.map(s =>
                    s.id === editingSupplier.id ? { ...s, ...formData } : s
                ));
            } else {
                setSuppliers(prev => [...prev, { id: Date.now(), ...formData, created_at: new Date().toISOString() }]);
            }
            setIsModalOpen(false);
            return;
        }

        if (editingSupplier) {
            const { error } = await supabase
                .from('suppliers')
                .update(formData)
                .eq('id', editingSupplier.id);

            if (error) {
                console.error('Error updating supplier:', error);
                alert('Error updating supplier: ' + error.message);
                return;
            }
        } else {
            const { error } = await supabase
                .from('suppliers')
                .insert([formData]);

            if (error) {
                console.error('Error adding supplier:', error);
                alert('Error adding supplier: ' + error.message);
                return;
            }
        }

        setIsModalOpen(false);
        loadSuppliers();
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this supplier?')) return;

        if (!supabase) {
            setSuppliers(prev => prev.filter(s => s.id !== id));
            return;
        }

        const { error } = await supabase
            .from('suppliers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting supplier:', error);
            alert('Error deleting supplier: ' + error.message);
            return;
        }

        loadSuppliers();
    };

    const openPaymentModal = (supplier) => {
        setSelectedSupplier(supplier);
        setPaymentData({
            amount: '',
            description: '',
            invoice_number: '',
            payment_method: 'Cash',
            notes: ''
        });
        setShowPaymentModal(true);
    };

    const handleRecordPayment = async () => {
        if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const paymentDate = new Date().toISOString().split('T')[0];

        // Record for UI (Voucher) - includes supplier name
        const paymentRecordUI = {
            supplier_id: selectedSupplier.id,
            supplier_name: selectedSupplier.name,
            amount: parseFloat(paymentData.amount),
            description: paymentData.description,
            invoice_number: paymentData.invoice_number,
            payment_method: paymentData.payment_method,
            payment_date: paymentDate,
            notes: paymentData.notes,
            status: 'Paid'
        };

        // Record for DB - excludes supplier name (it's relational)
        const paymentRecordDB = {
            supplier_id: selectedSupplier.id,
            amount: parseFloat(paymentData.amount),
            description: paymentData.description,
            invoice_number: paymentData.invoice_number,
            payment_method: paymentData.payment_method,
            payment_date: paymentDate,
            notes: paymentData.notes,
            status: 'Paid'
        };

        if (!supabase) {
            // Demo mode - show voucher
            setLastPayment(paymentRecordUI);
            setShowPaymentModal(false);
            setShowVoucherModal(true);
            return;
        }

        const { error } = await supabase
            .from('supplier_transactions')
            .insert([paymentRecordDB]);

        if (error) {
            console.error('Error recording payment:', error);
            alert('Error: ' + error.message + '\n\nNote: You may need to create the supplier_transactions table first.');
            return;
        }

        // Show voucher modal instead of alert
        setLastPayment(paymentRecordUI);
        setShowPaymentModal(false);
        setShowVoucherModal(true);
    };

    // Print voucher function
    const handlePrintVoucher = () => {
        window.print();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Load transactions for a specific supplier (excluding deleted)
    const loadSupplierTransactions = async (supplierId) => {
        setLoadingTransactions(true);
        setSupplierTransactions([]);

        if (!supabase) {
            setLoadingTransactions(false);
            return;
        }

        const { data, error } = await supabase
            .from('supplier_transactions')
            .select('*')
            .eq('supplier_id', supplierId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('Error loading transactions:', error.message);
        } else {
            setSupplierTransactions(data || []);
        }
        setLoadingTransactions(false);
    };

    // Load deleted transactions for audit log
    const loadDeletedTransactions = async (supplierId) => {
        if (!supabase) return;

        const { data, error } = await supabase
            .from('supplier_transactions')
            .select('*')
            .eq('supplier_id', supplierId)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });

        if (error) {
            console.warn('Error loading deleted transactions:', error.message);
        } else {
            setDeletedTransactions(data || []);
        }
    };

    // Open delete confirmation modal
    const confirmDelete = (transaction) => {
        setTransactionToDelete(transaction);
        setDeletionReason('');
        setShowDeleteConfirm(true);
    };

    // Handle soft delete
    const handleDeleteTransaction = async () => {
        if (!transactionToDelete) return;

        if (!supabase) {
            alert('Database not connected');
            return;
        }

        const { error } = await supabase
            .from('supplier_transactions')
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: 'Current User', // Replace with actual user if auth is implemented
                deletion_reason: deletionReason || 'No reason provided'
            })
            .eq('id', transactionToDelete.id);

        if (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete: ' + error.message);
            return;
        }

        // Refresh transactions list
        await loadSupplierTransactions(selectedSupplier.id);
        setShowDeleteConfirm(false);
        setTransactionToDelete(null);
        setDeletionReason('');
    };

    // Open deletion logs modal
    const openDeletionLogs = async () => {
        await loadDeletedTransactions(selectedSupplier.id);
        setShowDeletionLogs(true);
    };

    // Open history modal
    const openHistoryModal = async (supplier) => {
        setSelectedSupplier(supplier);
        await loadSupplierTransactions(supplier.id);
        setShowHistoryModal(true);
    };

    // Calculate total paid to supplier (excluding deleted)
    const getTotalPaid = () => {
        return supplierTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ margin: 0 }}>Suppliers</h2>
                <Button onClick={openAddModal}>
                    <Plus size={16} /> Add Supplier
                </Button>
            </div>

            {/* Search & Filter */}
            <Card style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search by name, contact, or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <div style={{ minWidth: '150px' }}>
                        <Select
                            options={[
                                { value: 'All', label: 'All Categories' },
                                ...categories.map(c => ({ value: c, label: c }))
                            ]}
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                        />
                    </div>
                </div>
            </Card>

            {/* Suppliers Table */}
            <Card>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Loading suppliers...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.length > 0 ? (
                                    filteredSuppliers.map((supplier) => (
                                        <tr key={supplier.id}>
                                            <td>
                                                <div style={{ fontWeight: '600' }}>{supplier.name}</div>
                                                {supplier.trade_license && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        TL: {supplier.trade_license}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {supplier.contact_person && <div>{supplier.contact_person}</div>}
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    📱 {supplier.mobile || '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: 'var(--bg-accent)',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    {supplier.category || 'General'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: supplier.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: supplier.status === 'Active' ? 'var(--success)' : 'var(--danger)'
                                                }}>
                                                    {supplier.status || 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => {
                                                            setSelectedSupplier(supplier);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        title="View Details"
                                                        style={{ color: 'var(--info)' }}
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => openPaymentModal(supplier)}
                                                        title="Record Payment"
                                                        style={{ color: 'var(--success)' }}
                                                    >
                                                        <DollarSign size={14} />
                                                    </button>
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => openHistoryModal(supplier)}
                                                        title="Payment History"
                                                        style={{ color: 'var(--warning)' }}
                                                    >
                                                        <History size={14} />
                                                    </button>
                                                    <button className="btn-icon" onClick={() => openEditModal(supplier)} title="Edit">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => handleDelete(supplier.id)}
                                                        title="Delete"
                                                        style={{ color: 'var(--danger)' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            {suppliers.length === 0
                                                ? 'No suppliers yet. Add your first supplier!'
                                                : 'No suppliers found matching your search'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Add/Edit Supplier Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingSupplier ? 'Save Changes' : 'Add Supplier'}</Button>
                    </>
                }
            >
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {/* Basic Info */}
                    <div className="form-group">
                        <label className="form-label">Company/Supplier Name *</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="ABC Supplies LLC"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                            <label className="form-label">Contact Person</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.contact_person}
                                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                placeholder="Ahmed Ali"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mobile</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                placeholder="050-1234567"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="supplier@company.com"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <Select
                                options={categories.map(c => ({ value: c, label: c }))}
                                value={formData.category}
                                onChange={(val) => setFormData({ ...formData, category: val })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <textarea
                            className="input"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Full address..."
                            rows={2}
                        />
                    </div>

                    {/* Business Info */}
                    <div style={{ padding: '0.75rem', background: 'var(--bg-accent)', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--accent)' }}>🏢 Business Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Trade License</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.trade_license}
                                    onChange={(e) => setFormData({ ...formData, trade_license: e.target.value })}
                                    placeholder="TL-123456"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">TRN (Tax Reg. No.)</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.trn_number}
                                    onChange={(e) => setFormData({ ...formData, trn_number: e.target.value })}
                                    placeholder="100xxxxxxxxx"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div style={{ padding: '0.75rem', background: 'var(--bg-accent)', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--accent)' }}>💳 Bank Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Bank Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                    placeholder="Emirates NBD"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Account Number</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.bank_account}
                                    onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                                    placeholder="1234567890"
                                />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                            <label className="form-label">IBAN</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.iban}
                                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                placeholder="AE12 3456 7890 1234 5678 901"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <Select
                                options={[
                                    { value: 'Active', label: '✅ Active' },
                                    { value: 'Inactive', label: '❌ Inactive' }
                                ]}
                                value={formData.status}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any notes..."
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Supplier Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title={selectedSupplier?.name || 'Supplier Details'}
            >
                {selectedSupplier && (
                    <div style={{ padding: '0.5rem' }}>
                        {/* Status Badge */}
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                background: selectedSupplier.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: selectedSupplier.status === 'Active' ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {selectedSupplier.status || 'Active'}
                            </span>
                            <span style={{
                                marginLeft: '0.5rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                background: 'var(--bg-accent)'
                            }}>
                                {selectedSupplier.category || 'General'}
                            </span>
                        </div>

                        {/* Contact Info */}
                        <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', marginBottom: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--accent)' }}>📞 Contact</h4>
                            {selectedSupplier.contact_person && (
                                <div style={{ fontWeight: '600' }}>{selectedSupplier.contact_person}</div>
                            )}
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>📱 {selectedSupplier.mobile || '-'}</div>
                            {selectedSupplier.email && (
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>✉️ {selectedSupplier.email}</div>
                            )}
                            {selectedSupplier.address && (
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>📍 {selectedSupplier.address}</div>
                            )}
                        </div>

                        {/* Business Info */}
                        {(selectedSupplier.trade_license || selectedSupplier.trn_number) && (
                            <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', marginBottom: '1rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--accent)' }}>🏢 Business</h4>
                                {selectedSupplier.trade_license && (
                                    <div style={{ fontSize: '0.875rem' }}>Trade License: <strong>{selectedSupplier.trade_license}</strong></div>
                                )}
                                {selectedSupplier.trn_number && (
                                    <div style={{ fontSize: '0.875rem' }}>TRN: <strong>{selectedSupplier.trn_number}</strong></div>
                                )}
                            </div>
                        )}

                        {/* Bank Info */}
                        {(selectedSupplier.bank_name || selectedSupplier.iban) && (
                            <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', marginBottom: '1rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--accent)' }}>💳 Bank Details</h4>
                                {selectedSupplier.bank_name && (
                                    <div style={{ fontSize: '0.875rem' }}>Bank: <strong>{selectedSupplier.bank_name}</strong></div>
                                )}
                                {selectedSupplier.bank_account && (
                                    <div style={{ fontSize: '0.875rem' }}>Account: <strong>{selectedSupplier.bank_account}</strong></div>
                                )}
                                {selectedSupplier.iban && (
                                    <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>IBAN: {selectedSupplier.iban}</div>
                                )}
                            </div>
                        )}

                        {/* Notes */}
                        {selectedSupplier.notes && (
                            <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', marginBottom: '1rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--accent)' }}>📝 Notes</h4>
                                <div style={{ fontSize: '0.875rem' }}>{selectedSupplier.notes}</div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
                            <Button onClick={() => {
                                setShowDetailsModal(false);
                                openPaymentModal(selectedSupplier);
                            }}>
                                <DollarSign size={16} /> Record Payment
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Record Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title={`Payment to ${selectedSupplier?.name || 'Supplier'}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                        <Button onClick={handleRecordPayment}>
                            <CheckCircle size={16} /> Record Payment
                        </Button>
                    </>
                }
            >
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Amount (AED) *</label>
                        <input
                            type="number"
                            className="input"
                            value={paymentData.amount}
                            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                            placeholder="0.00"
                            style={{ fontSize: '1.25rem', fontWeight: '600' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                            <label className="form-label">Invoice/Reference #</label>
                            <input
                                type="text"
                                className="input"
                                value={paymentData.invoice_number}
                                onChange={(e) => setPaymentData({ ...paymentData, invoice_number: e.target.value })}
                                placeholder="INV-001"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Payment Method</label>
                            <Select
                                options={[
                                    { value: 'Cash', label: '💵 Cash' },
                                    { value: 'Bank Transfer', label: '🏦 Bank Transfer' },
                                    { value: 'Check', label: '📝 Check' },
                                    { value: 'Card', label: '💳 Card' }
                                ]}
                                value={paymentData.payment_method}
                                onChange={(val) => setPaymentData({ ...paymentData, payment_method: val })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                            type="text"
                            className="input"
                            value={paymentData.description}
                            onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                            placeholder="What is this payment for?"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="input"
                            value={paymentData.notes}
                            onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                            placeholder="Any additional notes..."
                            rows={2}
                        />
                    </div>
                </div>
            </Modal>

            {/* Transaction History Modal */}
            <Modal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                title={`Payment History - ${selectedSupplier?.name || 'Supplier'}`}
            >
                <div>
                    {/* Total Summary */}
                    <div style={{
                        padding: '1rem',
                        background: 'linear-gradient(135deg, rgba(255, 138, 0, 0.15) 0%, rgba(255, 138, 0, 0.05) 100%)',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Paid</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)' }}>
                                AED {getTotalPaid().toFixed(2)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{supplierTransactions.length} transactions</div>
                        </div>
                    </div>

                    {/* Transactions List */}
                    {loadingTransactions ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Loading transactions...
                        </div>
                    ) : supplierTransactions.length > 0 ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {supplierTransactions.map((t, index) => (
                                <div
                                    key={t.id || index}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        marginBottom: '0.75rem',
                                        background: 'var(--bg-primary)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--success)' }}>
                                            AED {parseFloat(t.amount || 0).toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {formatDate(t.payment_date || t.created_at)}
                                        </div>
                                    </div>

                                    {t.invoice_number && (
                                        <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                            <FileText size={12} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                            Invoice: <strong>{t.invoice_number}</strong>
                                        </div>
                                    )}

                                    {t.description && (
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                            {t.description}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <span style={{
                                            padding: '0.125rem 0.375rem',
                                            background: 'var(--bg-accent)',
                                            borderRadius: '4px'
                                        }}>
                                            {t.payment_method || 'Cash'}
                                        </span>
                                        <span style={{
                                            padding: '0.125rem 0.375rem',
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            color: 'var(--success)',
                                            borderRadius: '4px'
                                        }}>
                                            {t.status || 'Paid'}
                                        </span>
                                    </div>

                                    {t.notes && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                            📝 {t.notes}
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
                                        <button
                                            onClick={() => confirmDelete(t)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.375rem 0.75rem',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid var(--danger)',
                                                borderRadius: '4px',
                                                color: 'var(--danger)',
                                                cursor: 'pointer',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No transactions recorded yet for this supplier
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        <Button variant="secondary" onClick={openDeletionLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ClipboardList size={16} /> Deletion Logs
                        </Button>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
                            <Button onClick={() => {
                                setShowHistoryModal(false);
                                openPaymentModal(selectedSupplier);
                            }}>
                                <DollarSign size={16} /> Record Payment
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Payment Voucher Modal */}
            <Modal
                isOpen={showVoucherModal}
                onClose={() => setShowVoucherModal(false)}
                title="✅ Payment Recorded"
            >
                {lastPayment && (
                    <div>
                        {/* Printable Voucher */}
                        <div
                            id="payment-voucher"
                            style={{
                                padding: '1.5rem',
                                border: '2px solid var(--border)',
                                borderRadius: '12px',
                                background: 'var(--bg-primary)'
                            }}
                        >
                            {/* Header */}
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px dashed var(--border)', paddingBottom: '1rem' }}>
                                <h2 style={{ margin: '0 0 0.25rem', color: 'var(--accent)' }}>PAYMENT VOUCHER</h2>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>4 The People Typing Center</div>
                            </div>

                            {/* Voucher Details */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</div>
                                    <div style={{ fontWeight: '600' }}>{formatDate(lastPayment.payment_date)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment Method</div>
                                    <div style={{ fontWeight: '600' }}>{lastPayment.payment_method}</div>
                                </div>
                            </div>

                            {/* Paid To */}
                            <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Paid To</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{lastPayment.supplier_name}</div>
                            </div>

                            {/* Amount */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(255, 138, 0, 0.15) 0%, rgba(255, 138, 0, 0.05) 100%)',
                                borderRadius: '8px',
                                textAlign: 'center',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Amount Paid</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
                                    AED {lastPayment.amount.toFixed(2)}
                                </div>
                            </div>

                            {/* Invoice/Reference */}
                            {lastPayment.invoice_number && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Invoice/Reference #</span>
                                    <span style={{ fontWeight: '600' }}>{lastPayment.invoice_number}</span>
                                </div>
                            )}

                            {/* Description */}
                            {lastPayment.description && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Description</span>
                                    <span style={{ fontWeight: '600' }}>{lastPayment.description}</span>
                                </div>
                            )}

                            {/* Notes */}
                            {lastPayment.notes && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-accent)', borderRadius: '8px', fontSize: '0.875rem' }}>
                                    <strong>Notes:</strong> {lastPayment.notes}
                                </div>
                            )}

                            {/* Signature Lines - for print */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '2px dashed var(--border)' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ borderTop: '1px solid var(--text-muted)', marginTop: '2rem', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Authorized Signature
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ borderTop: '1px solid var(--text-muted)', marginTop: '2rem', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Received By
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                            <Button variant="secondary" onClick={() => setShowVoucherModal(false)}>Close</Button>
                            <Button onClick={handlePrintVoucher}>
                                <Printer size={16} /> Print Voucher
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

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
                                    This will reverse the effect on reports and totals.
                                </div>
                            </div>
                        </div>

                        {/* Transaction Details */}
                        <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                                <span style={{ fontWeight: '700', color: 'var(--success)' }}>AED {parseFloat(transactionToDelete.amount || 0).toFixed(2)}</span>
                            </div>
                            {transactionToDelete.invoice_number && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Invoice #</span>
                                    <span style={{ fontWeight: '600' }}>{transactionToDelete.invoice_number}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Date</span>
                                <span>{formatDate(transactionToDelete.payment_date || transactionToDelete.created_at)}</span>
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
                                onClick={handleDeleteTransaction}
                                style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
                            >
                                <Trash2 size={16} /> Yes, Delete
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
                    {deletedTransactions.length > 0 ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {deletedTransactions.map((t, index) => (
                                <div
                                    key={t.id || index}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--danger)',
                                        marginBottom: '0.75rem',
                                        background: 'rgba(239, 68, 68, 0.05)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--danger)', textDecoration: 'line-through' }}>
                                            AED {parseFloat(t.amount || 0).toFixed(2)}
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

                                    {t.invoice_number && (
                                        <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                            Invoice: <strong>{t.invoice_number}</strong>
                                        </div>
                                    )}

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
                                            <span style={{ fontWeight: '600' }}>{t.deleted_by || 'Unknown'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Deleted At</span>
                                            <span>{t.deleted_at ? new Date(t.deleted_at).toLocaleString('en-GB') : 'N/A'}</span>
                                        </div>
                                        {t.deletion_reason && (
                                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                                                <strong>Reason:</strong> {t.deletion_reason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No deleted transactions found for this supplier
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

export default Suppliers;
