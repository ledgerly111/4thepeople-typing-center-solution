import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import QuickSale from '../components/ui/QuickSale';
import { useStore } from '../contexts/StoreContext';
import {
    Plus, TrendingUp, Users, FileText, Zap, DollarSign, Clock,
    AlertCircle, Eye, ClipboardList, Wallet, ArrowRight,
    Calendar, Receipt, BarChart3
} from 'lucide-react';

const Dashboard = () => {
    const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
    const [hoveredBar, setHoveredBar] = useState(null);
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
    const recentTransactions = getRecentTransactions(5);
    const totalCardBalance = govtFeeCards.reduce((sum, card) => sum + parseFloat(card.balance || 0), 0);
    const activeCards = govtFeeCards.filter(c => c.status === 'Active');

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Helper to format date as YYYY-MM-DD in local timezone
    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get last 7 days sales for chart
    const getLast7DaysSales = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = formatLocalDate(date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const fullDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

            const daySales = invoices
                .filter(inv => inv.date === dateStr && inv.status === 'Paid')
                .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

            days.push({ day: dayName, amount: daySales, date: dateStr, fullDate });
        }
        return days;
    };

    const last7Days = getLast7DaysSales();
    const maxSale = Math.max(...last7Days.map(d => d.amount), 1);
    const weeklyTotal = last7Days.reduce((sum, d) => sum + d.amount, 0);

    const handleQuickSaleComplete = (sale) => {
        addQuickSale(sale);
        setIsQuickSaleOpen(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    // Today's date formatted
    const todayFormatted = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <div className="dashboard fade-in" style={{ paddingBottom: '2rem' }}>
            <QuickSale
                isOpen={isQuickSaleOpen}
                onClose={() => setIsQuickSaleOpen(false)}
                onComplete={handleQuickSaleComplete}
            />

            {/* Welcome Header */}
            <div style={{
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {getGreeting()}! 👋
                    </h1>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem'
                    }}>
                        <Calendar size={14} />
                        {todayFormatted}
                    </div>
                </div>
                <Link to="/dashboard/quick-create" style={{ textDecoration: 'none' }}>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.875rem 1.75rem',
                        background: 'linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                        transition: 'all 0.2s ease'
                    }}>
                        <Zap size={20} />
                        Quick Create
                    </button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {/* Today's Sales */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-accent) 100%)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '80px',
                        height: '80px',
                        background: 'var(--accent)',
                        opacity: 0.1,
                        borderRadius: '50%'
                    }} />
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        marginBottom: '1rem'
                    }}>
                        <DollarSign size={24} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                        Today's Sales
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--accent)' }}>AED </span>
                        {todaySales.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                        <TrendingUp size={12} />
                        Paid today
                    </div>
                </div>

                {/* Pending Credit */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-accent) 100%)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '80px',
                        height: '80px',
                        background: 'var(--warning)',
                        opacity: 0.1,
                        borderRadius: '50%'
                    }} />
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'var(--warning)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        marginBottom: '1rem'
                    }}>
                        <Clock size={24} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                        Pending Credit
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--warning)' }}>AED </span>
                        {pendingAmount.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--warning)' }}>
                        <AlertCircle size={12} />
                        {pendingCount} unpaid invoices
                    </div>
                </div>

                {/* Wallet Balance */}
                <Link to="/dashboard/wallet" style={{ textDecoration: 'none' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-accent) 100%)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '80px',
                            height: '80px',
                            background: '#8b5cf6',
                            opacity: 0.1,
                            borderRadius: '50%'
                        }} />
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            marginBottom: '1rem'
                        }}>
                            <Wallet size={24} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                            Wallet Balance
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#8b5cf6' }}>
                            <span style={{ fontSize: '1rem' }}>AED </span>
                            {totalCardBalance.toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Wallet size={12} />
                            {activeCards.length} active cards
                        </div>
                    </div>
                </Link>

                {/* Work Orders */}
                <Link to="/dashboard/work-orders" style={{ textDecoration: 'none' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-accent) 100%)',
                        border: `1px solid ${overdueWorkOrders > 0 ? 'var(--danger)' : 'var(--border)'}`,
                        borderRadius: '16px',
                        padding: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '80px',
                            height: '80px',
                            background: overdueWorkOrders > 0 ? 'var(--danger)' : 'var(--success)',
                            opacity: 0.1,
                            borderRadius: '50%'
                        }} />
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: overdueWorkOrders > 0 ? 'var(--danger)' : 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            marginBottom: '1rem'
                        }}>
                            <ClipboardList size={24} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                            Pending Orders
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {pendingWorkOrders}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.75rem', color: overdueWorkOrders > 0 ? 'var(--danger)' : 'var(--success)' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Weekly Sales Chart */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Weekly Sales</h3>
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '700',
                            color: 'var(--accent)',
                            background: 'var(--bg-accent)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px'
                        }}>
                            AED {weeklyTotal.toLocaleString()}
                        </div>
                    </div>

                    {/* Chart */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '150px', marginBottom: '1rem' }}>
                        {last7Days.map((day, idx) => (
                            <div
                                key={idx}
                                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
                                onMouseEnter={() => setHoveredBar(idx)}
                                onMouseLeave={() => setHoveredBar(null)}
                            >
                                {hoveredBar === idx && day.amount > 0 && (
                                    <div style={{
                                        background: 'var(--text-primary)',
                                        color: 'var(--bg-card)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        marginBottom: '0.25rem',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        AED {day.amount.toLocaleString()}
                                    </div>
                                )}
                                <div style={{
                                    width: '100%',
                                    background: day.amount > 0
                                        ? hoveredBar === idx
                                            ? 'linear-gradient(180deg, var(--accent) 0%, #f59e0b 100%)'
                                            : 'linear-gradient(180deg, var(--accent) 0%, rgba(249, 115, 22, 0.6) 100%)'
                                        : 'var(--border)',
                                    borderRadius: '6px 6px 0 0',
                                    height: `${Math.max((day.amount / maxSale) * 120, 6)}px`,
                                    minHeight: '6px',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }} />
                            </div>
                        ))}
                    </div>

                    {/* Day Labels */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {last7Days.map((day, idx) => (
                            <div key={idx} style={{
                                flex: 1,
                                textAlign: 'center',
                                fontSize: '0.7rem',
                                color: idx === 6 ? 'var(--accent)' : 'var(--text-muted)',
                                fontWeight: idx === 6 ? '600' : '400'
                            }}>
                                {day.day}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Receipt size={18} style={{ color: 'var(--accent)' }} />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Recent Activity</h3>
                        </div>
                        <Link to="/dashboard/transactions" style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>

                    {recentTransactions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recentTransactions.map((item) => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    background: 'var(--bg-accent)',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.customer}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                            {item.service} • {formatDate(item.date)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--accent)', fontSize: '0.9rem' }}>
                                            AED {item.amount}
                                        </div>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '20px',
                                            fontSize: '0.65rem',
                                            fontWeight: '600',
                                            marginTop: '0.25rem',
                                            background: item.status === 'Paid' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                            color: item.status === 'Paid' ? 'var(--success)' : 'var(--warning)'
                                        }}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <FileText size={40} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>No recent activity</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem'
            }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    <button
                        onClick={() => setIsQuickSaleOpen(true)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem 0.75rem',
                            background: 'linear-gradient(135deg, var(--success) 0%, #22c55e 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Zap size={22} />
                        Quick Sale
                    </button>

                    <Link to="/dashboard/invoices" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem 0.75rem',
                            width: '100%',
                            background: 'linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}>
                            <Plus size={22} />
                            New Invoice
                        </button>
                    </Link>

                    <Link to="/dashboard/work-orders" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem 0.75rem',
                            width: '100%',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}>
                            <ClipboardList size={22} />
                            Work Orders
                        </button>
                    </Link>

                    <Link to="/dashboard/wallet" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem 0.75rem',
                            width: '100%',
                            background: 'var(--bg-accent)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}>
                            <Wallet size={22} />
                            Wallet
                        </button>
                    </Link>

                    <Link to="/dashboard/transactions" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem 0.75rem',
                            width: '100%',
                            background: 'var(--bg-accent)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}>
                            <Eye size={22} />
                            Sales
                        </button>
                    </Link>

                    <Link to="/dashboard/customers" style={{ textDecoration: 'none' }}>
                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem 0.75rem',
                            width: '100%',
                            background: 'var(--bg-accent)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}>
                            <Users size={22} />
                            Customers
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
