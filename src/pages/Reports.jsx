import React, { useState, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import Card from '../components/ui/Card';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Calendar, Clock } from 'lucide-react';

const Reports = () => {
    const { invoices, expenses } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Calculate ALL outstanding receivables (not just selected date)
    const receivables = useMemo(() => {
        const pendingInvoices = invoices.filter(inv => inv.status === 'Pending' || inv.payment_type === 'Credit');

        const totalOutstanding = pendingInvoices.reduce((sum, inv) => {
            const total = parseFloat(inv.total || 0);
            const received = parseFloat(inv.amount_received || 0);
            return sum + (total - received);
        }, 0);

        // Group by customer
        const byCustomer = pendingInvoices.reduce((acc, inv) => {
            const name = inv.customer_name || 'Walk-in';
            if (!acc[name]) {
                acc[name] = { total: 0, invoices: [] };
            }
            const outstanding = parseFloat(inv.total || 0) - parseFloat(inv.amount_received || 0);
            acc[name].total += outstanding;
            acc[name].invoices.push(inv);
            return acc;
        }, {});

        return {
            totalOutstanding,
            pendingInvoices,
            byCustomer,
            count: pendingInvoices.length
        };
    }, [invoices]);

    // Calculate totals for selected date (CASH-BASED: using amount_received)
    const dateReport = useMemo(() => {
        const dateInvoices = invoices.filter(inv => inv.date === selectedDate);
        const dateExpenses = expenses.filter(exp => exp.date === selectedDate);

        // Cash-based: only count what was actually received
        const cashReceived = dateInvoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + parseFloat(inv.amount_received || inv.total || 0), 0);

        // Pending/credit shows what was partially received (could be 0)
        const creditReceived = dateInvoices
            .filter(inv => inv.status === 'Pending')
            .reduce((sum, inv) => sum + parseFloat(inv.amount_received || 0), 0);

        const totalReceived = cashReceived + creditReceived;

        const totalExpenses = dateExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

        const netProfit = totalReceived - totalExpenses;

        const expensesByCategory = dateExpenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount || 0);
            return acc;
        }, {});

        return {
            cashSales: cashReceived,
            creditSales: creditReceived,
            totalSales: totalReceived,
            totalExpenses,
            netProfit,
            invoices: dateInvoices,
            expenses: dateExpenses,
            expensesByCategory
        };
    }, [selectedDate, invoices, expenses]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div>
            {/* Header with Date Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.5rem' }}>Daily Reports</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Calendar size={20} style={{ color: 'var(--accent)' }} />
                    <input
                        type="date"
                        className="input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ maxWidth: '200px' }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {formatDate(selectedDate)}
                    </span>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Total Sales */}
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Total Sales
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--success)' }}>
                                AED {dateReport.totalSales.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>💵 Cash Sales:</span>
                            <span style={{ fontWeight: '600' }}>AED {dateReport.cashSales.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>📝 Credit Sales:</span>
                            <span style={{ fontWeight: '600' }}>AED {dateReport.creditSales.toFixed(2)}</span>
                        </div>
                    </div>
                </Card>

                {/* Total Expenses */}
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Total Expenses
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--danger)' }}>
                                AED {dateReport.totalExpenses.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    {Object.keys(dateReport.expensesByCategory).length > 0 && (
                        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                            {Object.entries(dateReport.expensesByCategory)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 3)
                                .map(([category, amount]) => (
                                    <div key={category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{category}:</span>
                                        <span style={{ fontWeight: '600' }}>AED {amount.toFixed(2)}</span>
                                    </div>
                                ))}
                        </div>
                    )}
                </Card>

                {/* Net Profit */}
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: dateReport.netProfit >= 0 ? 'var(--accent)' : 'var(--warning)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            {dateReport.netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Net Profit
                            </div>
                            <div style={{
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                color: dateReport.netProfit >= 0 ? 'var(--success)' : 'var(--danger)'
                            }}>
                                AED {dateReport.netProfit.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {dateReport.netProfit >= 0
                                ? '✅ Profitable day!'
                                : '⚠️ Loss - expenses exceeded sales'
                            }
                        </div>
                    </div>
                </Card>

                {/* Receivables Card */}
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: receivables.totalOutstanding > 0 ? 'var(--warning)' : 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Outstanding Receivables
                            </div>
                            <div style={{
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                color: receivables.totalOutstanding > 0 ? 'var(--warning)' : 'var(--success)'
                            }}>
                                AED {receivables.totalOutstanding.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>📋 Pending Invoices:</span>
                            <span style={{ fontWeight: '600' }}>{receivables.count}</span>
                        </div>
                        {Object.entries(receivables.byCustomer)
                            .sort(([, a], [, b]) => b.total - a.total)
                            .slice(0, 3)
                            .map(([customer, data]) => (
                                <div key={customer} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    <span>{customer}:</span>
                                    <span style={{ fontWeight: '600', color: 'var(--warning)' }}>AED {data.total.toFixed(2)}</span>
                                </div>
                            ))
                        }
                    </div>
                </Card>
            </div>

            {/* Transactions List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {/* Sales */}
                <Card title={`Sales (${dateReport.invoices.length})`}>
                    {dateReport.invoices.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <Receipt size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p style={{ fontSize: '0.875rem' }}>No sales for this date</p>
                        </div>
                    ) : (
                        <div style={{ marginTop: '0.75rem' }}>
                            {dateReport.invoices.map((inv) => (
                                <div
                                    key={inv.id}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '6px',
                                        background: 'var(--bg-accent)',
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>#{inv.id}</span>
                                        <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        {inv.customer_name}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {inv.payment_type || 'Cash'}
                                        </span>
                                        <span style={{ fontWeight: '700', color: 'var(--success)' }}>
                                            AED {parseFloat(inv.total || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Expenses */}
                <Card title={`Expenses (${dateReport.expenses.length})`}>
                    {dateReport.expenses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <DollarSign size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p style={{ fontSize: '0.875rem' }}>No expenses for this date</p>
                        </div>
                    ) : (
                        <div style={{ marginTop: '0.75rem' }}>
                            {dateReport.expenses.map((exp) => (
                                <div
                                    key={exp.id}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '6px',
                                        background: 'var(--bg-accent)',
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{exp.category}</span>
                                        <span style={{ fontWeight: '700', color: 'var(--danger)' }}>
                                            AED {parseFloat(exp.amount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {exp.description || '-'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {exp.payment_method}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Reports;
