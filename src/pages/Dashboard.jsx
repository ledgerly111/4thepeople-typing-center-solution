import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import QuickSale from '../components/ui/QuickSale';
import { useStore } from '../contexts/StoreContext';
import { Plus, TrendingUp, Users, FileText, Zap, List, DollarSign, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
    const { getTodaysSales, invoices, quickSales, addQuickSale } = useStore();

    const todaySales = getTodaysSales();
    const pendingInvoices = invoices.filter(inv => inv.status === 'Pending').length;
    const pendingAmount = invoices.filter(inv => inv.status === 'Pending').reduce((sum, inv) => sum + inv.total, 0);
    const totalTransactions = invoices.length + quickSales.length;

    // Get recent transactions (last 5)
    const recentTransactions = [
        ...invoices.slice(0, 3).map(inv => ({
            customer: inv.customerName,
            service: Array.isArray(inv.items) && inv.items[0] ? inv.items[0].name : 'Services',
            amount: inv.total,
            status: inv.status,
            date: inv.date
        })),
        ...quickSales.slice(0, 2).map(qs => ({
            customer: 'Walk-in',
            service: qs.items?.[0]?.name || 'Quick Sale',
            amount: qs.total,
            status: 'Paid',
            date: qs.date
        }))
    ].slice(0, 5);

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
        <div>
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
                        <AlertCircle size={12} /> {pendingInvoices} invoices
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

            {/* Quick Actions */}
            <Card title="Quick Actions" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    <button
                        onClick={() => setIsQuickSaleOpen(true)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, var(--success) 0%, #43A047 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <Zap size={24} />
                        Quick Sale
                    </button>

                    <Link to="/invoices" style={{ textDecoration: 'none' }}>
                        <button
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem',
                                width: '100%',
                                background: 'linear-gradient(135deg, var(--accent) 0%, #E65100 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(230, 81, 0, 0.4)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <Plus size={24} />
                            New Invoice
                        </button>
                    </Link>

                    <Link to="/transactions" style={{ textDecoration: 'none' }}>
                        <button
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem',
                                width: '100%',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-accent)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                        >
                            <List size={24} />
                            All Sales
                        </button>
                    </Link>

                    <Link to="/customers" style={{ textDecoration: 'none' }}>
                        <button
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem',
                                width: '100%',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-accent)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                        >
                            <Users size={24} />
                            Customers
                        </button>
                    </Link>
                </div>
            </Card>

            {/* Recent Activity */}
            <Card title="Recent Activity" style={{ marginTop: '1rem' }}>
                {recentTransactions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentTransactions.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    background: 'var(--bg-accent)',
                                    borderRadius: '8px',
                                    gap: '1rem'
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.customer}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {item.service} • {formatDate(item.date)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', color: 'var(--accent)' }}>
                                        AED {item.amount}
                                    </div>
                                    <span className={`badge ${item.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
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
    );
};

export default Dashboard;
