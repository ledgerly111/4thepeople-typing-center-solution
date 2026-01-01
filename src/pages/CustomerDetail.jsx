import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, DollarSign, FileText, Plus } from 'lucide-react';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomerData();
    }, [id]);

    const loadCustomerData = async () => {
        setLoading(true);

        // Fetch customer info
        const { data: customerData } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (!customerData) {
            navigate('/customers');
            return;
        }

        setCustomer(customerData);

        // Fetch all related data
        const [workOrdersRes, invoicesRes] = await Promise.all([
            supabase
                .from('work_orders')
                .select('*')
                .eq('customer_mobile', customerData.mobile)
                .order('created_at', { ascending: false }),
            supabase
                .from('invoices')
                .select('*')
                .eq('customer_mobile', customerData.mobile)
                .order('created_at', { ascending: false })
        ]);

        const workOrders = workOrdersRes.data || [];
        const invoices = invoicesRes.data || [];

        // Calculate financial summary - COUNT BOTH WORK ORDERS AND INVOICES
        const totalFromWorkOrders = workOrders.reduce((sum, wo) => sum + parseFloat(wo.total || 0), 0);
        const totalFromInvoices = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

        // Total spent is all work orders + standalone invoices (not linked to work orders)
        const standaloneInvoices = invoices.filter(inv => !inv.work_order_id);
        const totalFromStandaloneInvoices = standaloneInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
        const totalSpent = totalFromWorkOrders + totalFromStandaloneInvoices;

        // Paid invoices
        const totalPaid = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
        const outstandingBalance = totalSpent - totalPaid;

        setCustomerDetails({
            workOrders,
            invoices,
            stats: {
                totalSpent,
                totalPaid,
                outstandingBalance,
                totalWorkOrders: workOrders.length,
                totalInvoices: invoices.length,
                pendingWorkOrders: workOrders.filter(wo => wo.status !== 'Completed').length
            }
        });
        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading customer details...
            </div>
        );
    }

    if (!customer || !customerDetails) {
        return null;
    }

    return (
        <div className="page">
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/customers')}
                        style={{
                            background: 'var(--bg-accent)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{customer.name}</h1>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            {customer.mobile} {customer.email && `• ${customer.email}`}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button onClick={() => navigate('/work-orders/create', { state: { customer } })}>
                        <Plus size={16} /> New Work Order
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/invoices/create', { state: { customer } })}>
                        <Plus size={16} /> New Invoice
                    </Button>
                </div>
            </div>

            {/* Financial Summary */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={20} style={{ color: 'var(--accent)' }} />
                        Financial Summary
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-accent)', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Spent</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
                                AED {customerDetails.stats.totalSpent.toFixed(2)}
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-accent)', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Paid</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                                AED {customerDetails.stats.totalPaid.toFixed(2)}
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-accent)', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Outstanding</div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: customerDetails.stats.outstandingBalance > 0 ? 'var(--danger)' : 'inherit'
                            }}>
                                AED {customerDetails.stats.outstandingBalance.toFixed(2)}
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-accent)', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Work Orders</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{customerDetails.stats.totalWorkOrders}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {customerDetails.stats.pendingWorkOrders} pending
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Work Orders */}
                <Card>
                    <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} style={{ color: 'var(--accent)' }} />
                            Work Orders ({customerDetails.workOrders.length})
                        </h3>
                        {customerDetails.workOrders.length > 0 ? (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {customerDetails.workOrders.map(wo => (
                                    <div key={wo.id} style={{
                                        padding: '1rem',
                                        background: 'var(--bg-accent)',
                                        borderRadius: '8px',
                                        marginBottom: '0.75rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>WO #{wo.id}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {new Date(wo.created_at).toLocaleDateString()}
                                                {wo.due_date && ` • Due: ${new Date(wo.due_date).toLocaleDateString()}`}
                                            </div>
                                            {wo.reference_number && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    Ref: {wo.reference_number}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>AED {wo.total}</div>
                                            <span style={{
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                background: wo.status === 'Completed' ? 'var(--success)' : 'var(--warning)',
                                                color: 'white'
                                            }}>
                                                {wo.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No work orders yet
                            </div>
                        )}
                    </div>
                </Card>

                {/* Invoices */}
                <Card>
                    <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DollarSign size={20} style={{ color: 'var(--accent)' }} />
                            Invoices ({customerDetails.invoices.length})
                        </h3>
                        {customerDetails.invoices.length > 0 ? (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {customerDetails.invoices.map(inv => (
                                    <div key={inv.id} style={{
                                        padding: '1rem',
                                        background: 'var(--bg-accent)',
                                        borderRadius: '8px',
                                        marginBottom: '0.75rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Invoice #{inv.id}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {new Date(inv.created_at).toLocaleDateString()} • {inv.payment_type || 'Cash'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>AED {inv.total}</div>
                                            <span style={{
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                background: inv.status === 'Paid' ? 'var(--success)' : 'var(--danger)',
                                                color: 'white'
                                            }}>
                                                {inv.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No invoices yet
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CustomerDetail;
