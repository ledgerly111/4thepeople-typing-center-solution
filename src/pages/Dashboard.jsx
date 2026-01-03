import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import QuickSale from '../components/ui/QuickSale';
import { useStore } from '../contexts/StoreContext';
import { Plus, TrendingUp, Users, FileText, Zap, List, DollarSign, Clock, AlertCircle, Eye, ClipboardList, Wallet, TrendingDown } from 'lucide-react';

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
        addQuickSale,
        customers,
        workOrders,
        govtFeeCards,
        fetchGovtFeeCards
    } = useStore();

    useEffect(() => {
        fetchGovtFeeCards();
    }, []);

    const todaySales = getTodaysSales();
    const pendingAmount = getPendingAmount();
    const pendingCount = getPendingCount();
    const pendingWorkOrders = getPendingWorkOrdersCount();
    const overdueWorkOrders = getOverdueWorkOrdersCount();
    const totalTransactions = invoices.length + quickSales.length;
    const recentTransactions = getRecentTransactions(5);

    // Calculate total card balance
    const totalCardBalance = govtFeeCards.reduce((sum, card) => sum + parseFloat(card.balance || 0), 0);
    const activeCards = govtFeeCards.filter(c => c.status === 'Active');

    // Get last 7 days sales for chart
    const getLast7DaysSales = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const daySales = invoices
                .filter(inv => inv.date === dateStr && inv.status === 'Paid')
                .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

            days.push({ day: dayName, amount: daySales, date: dateStr });
        }
        return days;
    };

    const last7Days = getLast7DaysSales();
    const maxSale = Math.max(...last7Days.map(d => d.amount), 1);

    const handleQuickSaleComplete = (sale) => {
        addQuickSale(sale);
        setIsQuickSaleOpen(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="dashboard" style={{ paddingBottom: '2rem' }}>
            <QuickSale
                isOpen={isQuickSaleOpen}
                onClose={() => setIsQuickSaleOpen(false)}
                onComplete={handleQuickSaleComplete}
            />

            {/* Welcome Header with Quick Create Button */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Welcome back! 👋</h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Here's what's happening today
                    </p>
                </div>
                <Link to="/dashboard/quick-create" style={{ textDecoration: 'none' }}>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}>
                        <Zap size={20} />
                        Quick Create
                    </button>
                </Link>
            </div>

            {/* Stats Grid - 4 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Today's Sales */}
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

                {/* Pending Credit */}
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

                {/* Wallet Balance */}
                <Link to="/dashboard/wallet" style={{ textDecoration: 'none' }}>
                    <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <Wallet size={20} />
                        </div>
                        <div className="stat-label">Wallet Balance</div>
                        <div className="stat-value" style={{ color: '#8b5cf6' }}>
                            <span className="currency">AED </span>{totalCardBalance.toLocaleString()}
                        </div>
                        <div className="stat-change">
                            <Wallet size={12} /> {activeCards.length} active cards
                        </div>
                    </div>
                </Link>

                {/* Pending Work Orders */}
                <Link to="/dashboard/work-orders" style={{ textDecoration: 'none' }}>
                    <div className="stat-card" style={{ cursor: 'pointer', borderColor: overdueWorkOrders > 0 ? 'var(--danger)' : undefined }}>
                        <div className="stat-icon" style={{ background: overdueWorkOrders > 0 ? 'var(--danger)' : 'var(--success)' }}>
                            <ClipboardList size={20} />
                        </div>
                        <div className="stat-label">Pending Orders</div>
                        <div className="stat-value">{pendingWorkOrders}</div>
                        <div className="stat-change" style={{ color: overdueWorkOrders > 0 ? 'var(--danger)' : undefined }}>
                            {overdueWorkOrders > 0 ? (
                                <><AlertCircle size={12} /> {overdueWorkOrders} overdue!</>
                            ) : (
                                <><TrendingUp size={12} /> All on track</>
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Weekly Sales Chart */}
                <Card title="Weekly Sales Overview">
                    <div style={{ padding: '1rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '160px', marginBottom: '0.5rem' }}>
                            {last7Days.map((day, idx) => (
                                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        width: '100%',
                                        background: day.amount > 0 ? 'var(--accent)' : 'var(--border)',
                                        borderRadius: '4px 4px 0 0',
                                        height: `${Math.max((day.amount / maxSale) * 140, 4)}px`,
                                        minHeight: '4px',
                                        transition: 'height 0.3s'
                                    }} title={`AED ${day.amount.toLocaleString()}`} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {last7Days.map((day, idx) => (
                                <div key={idx} style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    {day.day}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Weekly Total:</span>
                            <span style={{ fontWeight: '700', color: 'var(--accent)' }}>
                                AED {last7Days.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card title="Recent Activity">
                    {recentTransactions.length > 0 ? (
                        <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                            {recentTransactions.map((item) => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem 0',
                                    borderBottom: '1px solid var(--border)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.customer}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {item.service} · {formatDate(item.date)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--accent)' }}>AED {item.amount}</div>
                                        <span className={`badge ${item.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <FileText size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p>No recent activity</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Work Orders Summary + Card Balance Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Work Orders Summary */}
                <Card title="Work Order Status">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning)' }}>{pendingWorkOrders}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending</div>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: overdueWorkOrders > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                {overdueWorkOrders}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overdue</div>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                                {workOrders.filter(w => w.status === 'Completed').length}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</div>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{workOrders.length}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
                        </div>
                    </div>
                </Card>

                {/* Wallet Cards */}
                <Card title="Wallet Cards">
                    {govtFeeCards.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {govtFeeCards.slice(0, 5).map(card => (
                                <div key={card.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--bg-accent)',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${card.card_type === 'ICP' ? '#667eea' : card.card_type === 'MOHRE' ? '#f5576c' : card.card_type === 'GDRFA' ? '#4facfe' : '#43e97b'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {card.card_name}
                                                {card.linked_to_govt_fees && (
                                                    <span style={{
                                                        fontSize: '0.6rem',
                                                        background: 'var(--success)',
                                                        color: 'white',
                                                        padding: '0.15rem 0.4rem',
                                                        borderRadius: '4px',
                                                        fontWeight: '500'
                                                    }}>LINKED</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.card_type}</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: '700',
                                        color: parseFloat(card.balance) > 500 ? 'var(--success)' : parseFloat(card.balance) < 100 ? 'var(--danger)' : 'var(--warning)'
                                    }}>
                                        AED {parseFloat(card.balance || 0).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            {govtFeeCards.length > 5 && (
                                <Link to="/dashboard/wallet" style={{ textAlign: 'center', color: 'var(--accent)', fontSize: '0.875rem' }}>
                                    View all {govtFeeCards.length} cards →
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                            <Wallet size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p>No wallet cards yet</p>
                            <Link to="/dashboard/wallet" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>Add your first card →</Link>
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick Actions - At Bottom */}
            <Card title="Quick Actions">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <button
                        onClick={() => setIsQuickSaleOpen(true)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.5rem 1rem',
                            background: 'var(--success)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}
                    >
                        <Zap size={24} />
                        Quick Sale
                    </button>

                    <Link to="/dashboard/invoices" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.5rem 1rem',
                            width: '100%',
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}>
                            <Plus size={24} />
                            New Invoice
                        </button>
                    </Link>

                    <Link to="/dashboard/work-orders" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.5rem 1rem',
                            width: '100%',
                            background: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}>
                            <ClipboardList size={24} />
                            Work Orders
                        </button>
                    </Link>

                    <Link to="/dashboard/wallet" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.5rem 1rem',
                            width: '100%',
                            background: 'var(--bg-accent)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}>
                            <Wallet size={24} />
                            Top Up Card
                        </button>
                    </Link>

                    <Link to="/dashboard/transactions" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.5rem 1rem',
                            width: '100%',
                            background: 'var(--bg-accent)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}>
                            <Eye size={24} />
                            View Sales
                        </button>
                    </Link>

                    <Link to="/dashboard/customers" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.5rem 1rem',
                            width: '100%',
                            background: 'var(--bg-accent)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}>
                            <Users size={24} />
                            Customers
                        </button>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
