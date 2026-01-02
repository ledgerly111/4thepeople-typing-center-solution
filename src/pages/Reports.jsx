import React, { useState, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    TrendingUp, TrendingDown, DollarSign, Receipt, Calendar, Clock,
    BarChart3, PieChart, Users, ClipboardList, Wallet, FileText, Download
} from 'lucide-react';

const Reports = () => {
    const { invoices, expenses, workOrders, govtFeeCards, customers, taxEnabled, TAX_RATE } = useStore();
    const [reportType, setReportType] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

    // Get date range based on report type
    const getDateRange = () => {
        const today = new Date();
        if (reportType === 'daily') {
            return { from: selectedDate, to: selectedDate };
        } else if (reportType === 'weekly') {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return { from: weekAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
        } else if (reportType === 'monthly') {
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return { from: monthAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
        } else {
            return { from: dateFrom, to: dateTo };
        }
    };

    const dateRange = getDateRange();

    // Filter data by date range
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const date = inv.date || inv.created_at?.split('T')[0];
            return date >= dateRange.from && date <= dateRange.to;
        });
    }, [invoices, dateRange.from, dateRange.to]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const date = exp.date || exp.created_at?.split('T')[0];
            return date >= dateRange.from && date <= dateRange.to;
        });
    }, [expenses, dateRange.from, dateRange.to]);

    const filteredWorkOrders = useMemo(() => {
        return workOrders.filter(wo => {
            const date = wo.created_at?.split('T')[0];
            return date >= dateRange.from && date <= dateRange.to;
        });
    }, [workOrders, dateRange.from, dateRange.to]);

    // Calculate comprehensive stats
    const stats = useMemo(() => {
        // Revenue breakdown
        const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
        const serviceFees = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.service_fee || 0), 0);
        const govtFees = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.govt_fee || 0), 0);
        const cashReceived = filteredInvoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + parseFloat(inv.amount_received || inv.total || 0), 0);
        const pendingAmount = filteredInvoices
            .filter(inv => inv.status === 'Pending')
            .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

        // Expenses
        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        const netProfit = cashReceived - totalExpenses;
        const grossProfit = serviceFees - totalExpenses;

        // Tax collected (5% of service fees if tax enabled)
        const taxCollected = serviceFees * 0.05;

        // Payment method breakdown
        const paymentMethods = filteredInvoices.reduce((acc, inv) => {
            const method = inv.payment_type || 'Cash';
            if (!acc[method]) acc[method] = { count: 0, amount: 0 };
            acc[method].count++;
            acc[method].amount += parseFloat(inv.total || 0);
            return acc;
        }, {});

        // Expense categories
        const expenseCategories = filteredExpenses.reduce((acc, exp) => {
            const cat = exp.category || 'Other';
            if (!acc[cat]) acc[cat] = 0;
            acc[cat] += parseFloat(exp.amount || 0);
            return acc;
        }, {});

        // Service breakdown (from invoice items)
        const serviceBreakdown = {};
        filteredInvoices.forEach(inv => {
            if (inv.items && Array.isArray(inv.items)) {
                inv.items.forEach(item => {
                    const name = item.name || 'Other Service';
                    if (!serviceBreakdown[name]) serviceBreakdown[name] = { count: 0, revenue: 0 };
                    serviceBreakdown[name].count++;
                    serviceBreakdown[name].revenue += parseFloat(item.price || 0);
                });
            }
        });

        // Work order stats
        const woCompleted = filteredWorkOrders.filter(wo => wo.status === 'Completed').length;
        const woPending = filteredWorkOrders.filter(wo => wo.status !== 'Completed').length;

        // Quick sale vs Invoice
        const quickSales = filteredInvoices.filter(inv => inv.is_quick_sale);
        const regularInvoices = filteredInvoices.filter(inv => !inv.is_quick_sale);

        // Top customers
        const customerStats = filteredInvoices.reduce((acc, inv) => {
            const name = inv.customer_name || 'Walk-in';
            if (!acc[name]) acc[name] = { count: 0, revenue: 0 };
            acc[name].count++;
            acc[name].revenue += parseFloat(inv.total || 0);
            return acc;
        }, {});

        return {
            totalRevenue,
            serviceFees,
            govtFees,
            cashReceived,
            pendingAmount,
            totalExpenses,
            netProfit,
            grossProfit,
            paymentMethods,
            expenseCategories,
            serviceBreakdown,
            woCompleted,
            woPending,
            woTotal: filteredWorkOrders.length,
            quickSales: quickSales.length,
            regularInvoices: regularInvoices.length,
            totalTransactions: filteredInvoices.length,
            customerStats,
            taxCollected
        };
    }, [filteredInvoices, filteredExpenses, filteredWorkOrders]);

    // All outstanding receivables
    const receivables = useMemo(() => {
        const pendingInvoices = invoices.filter(inv => inv.status === 'Pending');
        const totalOutstanding = pendingInvoices.reduce((sum, inv) => {
            return sum + parseFloat(inv.total || 0) - parseFloat(inv.amount_received || 0);
        }, 0);

        const byCustomer = pendingInvoices.reduce((acc, inv) => {
            const name = inv.customer_name || 'Walk-in';
            if (!acc[name]) acc[name] = { total: 0, count: 0 };
            acc[name].total += parseFloat(inv.total || 0) - parseFloat(inv.amount_received || 0);
            acc[name].count++;
            return acc;
        }, {});

        return { totalOutstanding, byCustomer, count: pendingInvoices.length };
    }, [invoices]);

    // Wallet balance
    const totalWalletBalance = govtFeeCards.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getReportTitle = () => {
        if (reportType === 'daily') return `Daily Report - ${formatDate(selectedDate)}`;
        if (reportType === 'weekly') return 'Weekly Report (Last 7 Days)';
        if (reportType === 'monthly') return 'Monthly Report (Last 30 Days)';
        return `Custom Report: ${formatDate(dateFrom)} to ${formatDate(dateTo)}`;
    };

    // Simple bar chart component
    const BarChart = ({ data, maxValue }) => (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
            {data.map((item, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '100%',
                        height: `${(item.value / maxValue) * 100}%`,
                        minHeight: '4px',
                        background: item.color || 'var(--accent)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s'
                    }} />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>{item.label}</div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="page">
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BarChart3 size={28} style={{ color: 'var(--accent)' }} />
                    Reports
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Detailed business analytics and insights</p>
            </div>

            {/* Report Type Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[
                    { id: 'daily', label: 'Daily' },
                    { id: 'weekly', label: 'Weekly' },
                    { id: 'monthly', label: 'Monthly' },
                    { id: 'custom', label: 'Custom Range' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setReportType(tab.id)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '8px',
                            background: reportType === tab.id ? 'var(--accent)' : 'var(--bg-accent)',
                            color: reportType === tab.id ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Date Selector */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <Calendar size={20} style={{ color: 'var(--accent)' }} />
                    {reportType === 'daily' && (
                        <input
                            type="date"
                            className="input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        />
                    )}
                    {reportType === 'custom' && (
                        <>
                            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>From:</label>
                            <input
                                type="date"
                                className="input"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                style={{ maxWidth: '180px' }}
                            />
                            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>To:</label>
                            <input
                                type="date"
                                className="input"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                style={{ maxWidth: '180px' }}
                            />
                        </>
                    )}
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{getReportTitle()}</span>
                    </div>
                </div>
            </Card>

            {/* Key Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Total Revenue */}
                <Card>
                    <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <TrendingUp size={20} style={{ color: 'var(--success)' }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Revenue</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--success)' }}>
                            AED {stats.totalRevenue.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {stats.totalTransactions} transactions
                        </div>
                    </div>
                </Card>

                {/* Cash Received */}
                <Card>
                    <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <DollarSign size={20} style={{ color: 'var(--accent)' }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cash Received</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent)' }}>
                            AED {stats.cashReceived.toFixed(2)}
                        </div>
                    </div>
                </Card>

                {/* Expenses */}
                <Card>
                    <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Receipt size={20} style={{ color: 'var(--danger)' }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expenses</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--danger)' }}>
                            AED {stats.totalExpenses.toFixed(2)}
                        </div>
                    </div>
                </Card>

                {/* Net Profit */}
                <Card>
                    <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {stats.netProfit >= 0 ? <TrendingUp size={20} style={{ color: 'var(--success)' }} /> : <TrendingDown size={20} style={{ color: 'var(--danger)' }} />}
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Profit</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: stats.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            AED {stats.netProfit.toFixed(2)}
                        </div>
                    </div>
                </Card>

                {/* Outstanding */}
                <Card>
                    <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Clock size={20} style={{ color: 'var(--warning)' }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Outstanding</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--warning)' }}>
                            AED {receivables.totalOutstanding.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {receivables.count} pending invoices
                        </div>
                    </div>
                </Card>

                {/* Wallet Balance */}
                <Card>
                    <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Wallet size={20} style={{ color: '#8b5cf6' }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wallet Balance</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#8b5cf6' }}>
                            AED {totalWalletBalance.toFixed(2)}
                        </div>
                    </div>
                </Card>

                {/* Tax Collected - only show if tax is enabled */}
                {taxEnabled && (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Receipt size={20} style={{ color: '#6366f1' }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VAT Collected (5%)</span>
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#6366f1' }}>
                                AED {stats.taxCollected.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                On service fees
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Revenue Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Revenue Breakdown Card */}
                <Card title="Revenue Breakdown">
                    <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                            <span>Service Fees</span>
                            <span style={{ fontWeight: '600', color: 'var(--success)' }}>AED {stats.serviceFees.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                            <span>Government Fees</span>
                            <span style={{ fontWeight: '600', color: '#8b5cf6' }}>AED {stats.govtFees.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                            <span>Pending (Credit)</span>
                            <span style={{ fontWeight: '600', color: 'var(--warning)' }}>AED {stats.pendingAmount.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: '700' }}>
                            <span>Gross Profit (Service - Expenses)</span>
                            <span style={{ color: stats.grossProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>AED {stats.grossProfit.toFixed(2)}</span>
                        </div>
                    </div>
                </Card>

                {/* Payment Methods */}
                <Card title="Payment Methods">
                    <div style={{ padding: '1rem' }}>
                        {Object.entries(stats.paymentMethods).length > 0 ? (
                            Object.entries(stats.paymentMethods)
                                .sort(([, a], [, b]) => b.amount - a.amount)
                                .map(([method, data]) => (
                                    <div key={method} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{method}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data.count} transactions</div>
                                        </div>
                                        <span style={{ fontWeight: '600' }}>AED {data.amount.toFixed(2)}</span>
                                    </div>
                                ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No transactions</div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Work Orders & Transaction Types */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Work Order Status */}
                <Card title="Work Order Status">
                    <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 80px', textAlign: 'center', padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', minWidth: '80px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.woTotal}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total</div>
                        </div>
                        <div style={{ flex: '1 1 80px', textAlign: 'center', padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', minWidth: '80px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>{stats.woCompleted}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Done</div>
                        </div>
                        <div style={{ flex: '1 1 80px', textAlign: 'center', padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', minWidth: '80px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--warning)' }}>{stats.woPending}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending</div>
                        </div>
                    </div>
                </Card>

                {/* Transaction Types */}
                <Card title="Transaction Types">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', padding: '1rem' }}>
                        <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px' }}>
                            <FileText size={24} style={{ color: 'var(--accent)', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.regularInvoices}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoices</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px' }}>
                            <Receipt size={24} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.quickSales}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Sales</div>
                        </div>
                    </div>
                </Card>

                {/* Expense Categories */}
                <Card title="Expense Categories">
                    <div style={{ padding: '1rem' }}>
                        {Object.entries(stats.expenseCategories).length > 0 ? (
                            Object.entries(stats.expenseCategories)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 5)
                                .map(([category, amount]) => (
                                    <div key={category} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <span>{category}</span>
                                        <span style={{ fontWeight: '600', color: 'var(--danger)' }}>AED {amount.toFixed(2)}</span>
                                    </div>
                                ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No expenses</div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Top Customers & Outstanding */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {/* Top Customers */}
                <Card title="Top Customers by Revenue">
                    <div style={{ padding: '1rem' }}>
                        {Object.entries(stats.customerStats).length > 0 ? (
                            Object.entries(stats.customerStats)
                                .sort(([, a], [, b]) => b.revenue - a.revenue)
                                .slice(0, 5)
                                .map(([customer, data], idx) => (
                                    <div key={customer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? '#cd7f32' : 'var(--bg-accent)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: '700'
                                            }}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{customer}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data.count} transactions</div>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: '700', color: 'var(--success)' }}>AED {data.revenue.toFixed(2)}</span>
                                    </div>
                                ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <Users size={40} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                                <p>No transactions yet</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Outstanding by Customer */}
                <Card title="Outstanding Receivables by Customer">
                    <div style={{ padding: '1rem' }}>
                        {Object.entries(receivables.byCustomer).length > 0 ? (
                            Object.entries(receivables.byCustomer)
                                .sort(([, a], [, b]) => b.total - a.total)
                                .slice(0, 5)
                                .map(([customer, data]) => (
                                    <div key={customer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{customer}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data.count} pending invoices</div>
                                        </div>
                                        <span style={{ fontWeight: '700', color: 'var(--warning)' }}>AED {data.total.toFixed(2)}</span>
                                    </div>
                                ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--success)' }}>
                                <TrendingUp size={40} style={{ marginBottom: '0.5rem' }} />
                                <p>No outstanding receivables! 🎉</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
