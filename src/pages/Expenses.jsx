import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { Plus, Trash2, DollarSign } from 'lucide-react';

const Expenses = () => {
    const { expenses, addExpense, deleteExpense } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Supplies',
        description: '',
        amount: '',
        payment_method: 'Cash'
    });

    const categories = [
        { value: 'Rent', label: '🏢 Rent' },
        { value: 'Salaries', label: '💰 Salaries' },
        { value: 'Utilities', label: '💡 Utilities' },
        { value: 'Supplies', label: '📦 Supplies' },
        { value: 'Marketing', label: '📢 Marketing' },
        { value: 'Maintenance', label: '🔧 Maintenance' },
        { value: 'Transport', label: '🚗 Transport' },
        { value: 'Other', label: '📋 Other' }
    ];

    const paymentMethods = [
        { value: 'Cash', label: '💵 Cash' },
        { value: 'Bank Transfer', label: '🏦 Bank Transfer' },
        { value: 'Card', label: '💳 Card' }
    ];

    const handleSubmit = async () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        await addExpense({
            date: formData.date,
            category: formData.category,
            description: formData.description,
            amount: parseFloat(formData.amount),
            payment_method: formData.payment_method
        });

        setFormData({
            date: new Date().toISOString().split('T')[0],
            category: 'Supplies',
            description: '',
            amount: '',
            payment_method: 'Cash'
        });
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            await deleteExpense(id);
        }
    };

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const expensesByCategory = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount || 0);
        return acc;
    }, {});

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ margin: 0 }}>Expenses</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} /> Add Expense
                </Button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Total Expenses
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--danger)' }}>
                                AED {totalExpenses.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </Card>

                {Object.keys(expensesByCategory).length > 0 && (
                    <Card>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                            By Category
                        </div>
                        {Object.entries(expensesByCategory)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 3)
                            .map(([category, amount]) => (
                                <div key={category} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.875rem' }}>{category}</span>
                                    <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>AED {amount.toFixed(2)}</span>
                                </div>
                            ))}
                    </Card>
                )}
            </div>

            {/* Expenses Table */}
            <Card>
                {expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <DollarSign size={48} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p>No expenses recorded yet</p>
                        <p style={{ fontSize: '0.875rem' }}>Click "Add Expense" to track your costs</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Payment</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{formatDate(expense.date)}</td>
                                        <td>
                                            <span className="badge" style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)' }}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td>{expense.description || '-'}</td>
                                        <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {expense.payment_method}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--danger)' }}>
                                            AED {parseFloat(expense.amount || 0).toFixed(2)}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDelete(expense.id)}
                                                style={{ color: 'var(--danger)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Add Expense Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Expense"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Add Expense</Button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                        type="date"
                        className="input"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Category *</label>
                    <Select
                        options={categories}
                        value={formData.category}
                        onChange={(val) => setFormData({ ...formData, category: val })}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                        type="text"
                        className="input"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g., Monthly office rent"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Amount (AED) *</label>
                    <input
                        type="number"
                        className="input"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <Select
                        options={paymentMethods}
                        value={formData.payment_method}
                        onChange={(val) => setFormData({ ...formData, payment_method: val })}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Expenses;
