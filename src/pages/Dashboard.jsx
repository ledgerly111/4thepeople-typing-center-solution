import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import QuickSale from '../components/ui/QuickSale';
import { useStore } from '../contexts/StoreContext';
import { Plus, TrendingUp, Users, FileText, Zap, List, DollarSign, Clock, AlertCircle, Eye, ClipboardList } from 'lucide-react';

const Dashboard = () => {
    const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
    const {
        getTodaysSales,
        getRecentTransactions,
        getPendingAmount,
        getPendingCount,
        getPendingWorkOrdersCount,
        getOverdueWorkOrdersCount,
        invoices,
        quickSales,
        addQuickSale
    } = useStore();

    const todaySales = getTodaysSales();
    const pendingAmount = getPendingAmount();
    const pendingCount = getPendingCount();
    const pendingWorkOrders = getPendingWorkOrdersCount();
    const overdueWorkOrders = getOverdueWorkOrdersCount();
    const totalTransactions = invoices.length + quickSales.length;
    const recentTransactions = getRecentTransactions(10);

    const handleQuickSaleComplete = (sale) => {
        addQuickSale(sale);
        setIsQuickSaleOpen(false);
    };

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="dashboard">
            <QuickSale
                isOpen={isQuickSaleOpen}
                onClose={() => setIsQuickSaleOpen(false)}
                onComplete={handleQuickSaleComplete}
            />

            {/* Welcome Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Welcome back! 👋</h1>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Here's what's happening today
                </p>
            </div>

            {/* Desktop Layout - Two Columns */}
            <div className="dashboard-grid">
                {/* Left Column */}
                <div className="dashboard-main">
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <DollarSign size={20} />
                            </div>
                            <div className="stat-label">Today's Sales</div>
                            <div className="stat-value">
                                <span className="currency">AED </span>{todaySales.toLocaleString()}
                            </div>
                            <div className="stat-change">
                                <TrendingUp size={12} /> Paid transactions
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'var(--warning)' }}>
                                <Clock size={20} />
                            </div>
                            <div className="stat-label">Pending Credit</div>
                            <div className="stat-value">
                                <span className="currency">AED </span>{pendingAmount.toLocaleString()}
                            </div>
                            <div className="stat-change warning">
                                <AlertCircle size={12} /> {pendingCount} invoices
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'var(--success)' }}>
                                <FileText size={20} />
                            </div>
                            <div className="stat-label">Total Transactions</div>
                            <div className="stat-value">{totalTransactions}</div>
                            <div className="stat-change">
                                <List size={12} /> All time
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity - Scrollable Table */}
                    <Card title="Recent Activity" style={{ marginTop: '1.5rem' }}>
                        {recentTransactions.length > 0 ? (
                            <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Service</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.map((item) => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: '600' }}>{item.customer}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{item.service}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{formatDate(item.date)}</td>
                                                <td>
                                                    <span className={`badge ${item.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--accent)' }}>
                                                    AED {item.amount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <FileText size={48} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>No recent activity</p>
                                <p style={{ fontSize: '0.875rem' }}>Start by creating an invoice or quick sale</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column - Quick Actions */}
                <div className="dashboard-sidebar">
                    <Card title="Quick Actions">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={() => setIsQuickSaleOpen(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    background: 'var(--success)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    transition: 'transform 0.2s, opacity 0.2s',
                                    textAlign: 'left'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.opacity = '0.9'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1'; }}
                            >
                                <Zap size={20} />
                                Quick Sale
                            </button>

                            <Link to="/invoices" style={{ textDecoration: 'none' }}>
                                <button
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1rem',
                                        width: '100%',
                                        background: 'var(--accent)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        transition: 'transform 0.2s, opacity 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.opacity = '0.9'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1'; }}
                                >
                                    <Plus size={20} />
                                    New Invoice
                                </button>
                            </Link>

                            <Link to="/work-orders" style={{ textDecoration: 'none' }}>
                                <button
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '0.75rem',
                                        padding: '1rem',
                                        width: '100%',
                                        background: overdueWorkOrders > 0 ? 'var(--danger)' : '#8b5cf6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        transition: 'transform 0.2s, opacity 0.2s',
                                        textAlign: 'left',
                                        marginTop: '0.75rem'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.opacity = '0.9'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <ClipboardList size={20} />
                                        <div>
                                            <div>Work Orders</div>
                                            <div style={{ fontSize: '0.625rem', opacity: 0.9, fontWeight: '400' }}>
                                                {pendingWorkOrders} pending
                                                {overdueWorkOrders > 0 && ` · ${overdueWorkOrders} overdue!`}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </Link>

                            <Link to="/transactions" style={{ textDecoration: 'none' }}>
                                <button
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1rem',
                                        width: '100%',
                                        background: 'var(--bg-accent)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                >
                                    <Eye size={20} />
                                    View All Sales
                                </button>
                            </Link>

                            <Link to="/customers" style={{ textDecoration: 'none' }}>
                                <button
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1rem',
                                        width: '100%',
                                        background: 'var(--bg-accent)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                >
                                    <Users size={20} />
                                    Manage Customers
                                </button>
                            </Link>
                        </div>
                    </Card>

                    {/* Summary Card */}
                    <Card title="Today's Summary" style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Invoices Today</span>
                                <span style={{ fontWeight: '600' }}>{invoices.filter(i => i.date === new Date().toISOString().split('T')[0]).length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Quick Sales Today</span>
                                <span style={{ fontWeight: '600' }}>{quickSales.filter(q => q.date === new Date().toISOString().split('T')[0]).length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Total Customers</span>
                                <span style={{ fontWeight: '600' }}>5</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
