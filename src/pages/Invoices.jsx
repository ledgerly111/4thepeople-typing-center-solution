import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SearchableSelect from '../components/ui/SearchableSelect';
import Select from '../components/ui/Select';
import InvoicePreview from '../components/ui/InvoicePreview';
import ThermalReceipt from '../components/ui/ThermalReceipt';
import Modal from '../components/ui/Modal';
import { useStore } from '../contexts/StoreContext';
import { Plus, Printer, Trash2, ArrowLeft, Eye, CheckCircle, Search } from 'lucide-react';

const Invoices = () => {
    const { invoices, addInvoice, updateInvoiceStatus, customers, services } = useStore();
    const [view, setView] = useState('list');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [lineItems, setLineItems] = useState([]);
    const [paymentType, setPaymentType] = useState('Cash');
    const [amountReceived, setAmountReceived] = useState('');
    const [previewInvoice, setPreviewInvoice] = useState(null);
    const [printInvoice, setPrintInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Filter and sort invoices (newest first)
    const filteredInvoices = invoices
        .filter(inv => {
            const customerName = inv.customer_name || inv.customerName || '';
            const matchesSearch =
                customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.id.toString().includes(searchTerm);
            const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    const addItem = () => {
        setLineItems([...lineItems, { serviceId: '', serviceFee: 0, govtFee: 0, price: 0, name: '' }]);
    };

    const updateItem = (index, serviceId) => {
        const newItems = [...lineItems];
        const service = (services || []).find(s => s.id === parseInt(serviceId));
        newItems[index] = {
            serviceId: serviceId,
            serviceFee: service ? (service.service_fee || service.serviceFee || 0) : 0,
            govtFee: service ? (service.govt_fee || service.govtFee || 0) : 0,
            price: service ? (service.total || (service.service_fee + service.govt_fee) || service.price || 0) : 0,
            name: service ? service.name : ''
        };
        setLineItems(newItems);
    };

    const removeItem = (index) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    // Calculate totals
    const totalServiceFee = lineItems.reduce((sum, item) => sum + Number(item.serviceFee || 0), 0);
    const totalGovtFee = lineItems.reduce((sum, item) => sum + Number(item.govtFee || 0), 0);
    const grandTotal = totalServiceFee + totalGovtFee;
    const change = amountReceived && paymentType === 'Cash' ? Math.max(0, Number(amountReceived) - grandTotal) : 0;

    // Get today's date in correct format
    const getTodayDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleGenerateInvoice = async () => {
        if (!selectedCustomer) {
            alert('Please select a customer');
            return;
        }
        if (lineItems.length === 0 || lineItems.some(item => !item.serviceId)) {
            alert('Please add at least one service');
            return;
        }

        const customer = (customers || []).find(c => c.id === parseInt(selectedCustomer));
        const receivedAmount = paymentType === 'Cash' ? (Number(amountReceived) || 0) : 0;

        // If amount received is less than total, mark as Pending (Credit)
        const isPaid = paymentType === 'Cash' && receivedAmount >= grandTotal;

        const newInvoice = await addInvoice({
            customer_name: customer ? customer.name : 'Unknown',
            customer_mobile: customer ? customer.mobile : '',
            customer_email: customer ? customer.email : '',
            service_fee: totalServiceFee,
            govt_fee: totalGovtFee,
            total: grandTotal,
            amount_received: receivedAmount,
            change: isPaid ? Math.max(0, receivedAmount - grandTotal) : 0,
            status: isPaid ? 'Paid' : 'Pending',
            payment_type: isPaid ? 'Cash' : 'Credit',
            items: lineItems.map(item => ({
                name: item.name,
                serviceFee: item.serviceFee,
                govtFee: item.govtFee,
                price: item.price
            })),
            date: getTodayDate()
        });

        if (newInvoice) {
            setPreviewInvoice(newInvoice);
        }
        setSelectedCustomer('');
        setLineItems([]);
        setPaymentType('Cash');
        setAmountReceived('');
        setView('list');
    };

    const openInvoicePreview = (invoice) => {
        const fullInvoice = {
            ...invoice,
            items: Array.isArray(invoice.items) ? invoice.items : [{ name: 'Service', price: invoice.total }]
        };
        setPreviewInvoice(fullInvoice);
    };

    const customerOptions = (customers || []).map(c => ({
        id: c.id,
        name: `${c.name} (${c.mobile})`
    }));

    const serviceOptions = (services || []).map(s => ({
        id: s.id,
        name: `${s.name} - AED ${s.total || (parseFloat(s.service_fee || 0) + parseFloat(s.govt_fee || 0))} (Service: ${s.service_fee || s.serviceFee || 0} + Govt: ${s.govt_fee || s.govtFee || 0})`
    }));

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <>
            {previewInvoice && (
                <InvoicePreview
                    invoice={previewInvoice}
                    onClose={() => setPreviewInvoice(null)}
                />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                {view === 'list' ? (
                    <>
                        <h2 style={{ margin: 0 }}>Invoices</h2>
                        <Button onClick={() => setView('create')}>
                            <Plus size={16} /> New Invoice
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" onClick={() => setView('list')}>
                            <ArrowLeft size={16} /> Back
                        </Button>
                        <h2 style={{ margin: 0 }}>Create Invoice</h2>
                    </>
                )}
            </div>

            {view === 'list' ? (
                <>
                    {/* Search and Filter */}
                    <Card style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Search by customer or invoice #..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
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
                                        <th>Invoice #</th>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.length > 0 ? (
                                        filteredInvoices.map((inv) => (
                                            <tr key={inv.id}>
                                                <td style={{ fontWeight: '600' }}>#{inv.id}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{formatDate(inv.date)}</td>
                                                <td>{inv.customer_name || inv.customerName}</td>
                                                <td>{inv.payment_type || inv.paymentType || 'Cash'}</td>
                                                <td>
                                                    <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: '600' }}>AED {inv.total}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => openInvoicePreview(inv)}
                                                            title="View/Print Invoice"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        {inv.status === 'Pending' && (
                                                            <button
                                                                className="btn-icon"
                                                                onClick={() => updateInvoiceStatus(inv.id, 'Paid')}
                                                                title="Mark as Paid"
                                                                style={{ color: 'var(--success)' }}
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => setPrintInvoice(inv)}
                                                            title="Print Receipt"
                                                            style={{ color: 'var(--accent)' }}
                                                        >
                                                            <Printer size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No invoices found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <Card title="Customer">
                        <SearchableSelect
                            options={customerOptions}
                            value={selectedCustomer}
                            onChange={setSelectedCustomer}
                            placeholder="Search customer by name..."
                            displayKey="name"
                            valueKey="id"
                        />
                    </Card>

                    <Card title="Services">
                        {lineItems.map((item, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <SearchableSelect
                                        options={serviceOptions}
                                        value={item.serviceId}
                                        onChange={(val) => updateItem(index, val)}
                                        placeholder="Search service..."
                                        displayKey="name"
                                        valueKey="id"
                                    />
                                </div>
                                <div style={{
                                    minWidth: '100px',
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--bg-accent)',
                                    borderRadius: '6px',
                                    textAlign: 'right',
                                    fontWeight: '600'
                                }}>
                                    AED {item.price}
                                </div>
                                <button
                                    className="btn-icon"
                                    onClick={() => removeItem(index)}
                                    style={{ color: 'var(--danger)' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <Button variant="secondary" onClick={addItem} style={{ width: '100%' }}>
                            <Plus size={16} /> Add Service
                        </Button>
                    </Card>

                    <Card title="Payment Type">
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setPaymentType('Cash')}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: `2px solid ${paymentType === 'Cash' ? 'var(--success)' : 'var(--border)'}`,
                                    borderRadius: '6px',
                                    backgroundColor: paymentType === 'Cash' ? 'var(--bg-accent)' : 'transparent',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontWeight: '600',
                                    color: paymentType === 'Cash' ? 'var(--success)' : 'var(--text-secondary)'
                                }}
                            >
                                💵 Cash (Paid Now)
                            </button>
                            <button
                                onClick={() => setPaymentType('Credit')}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: `2px solid ${paymentType === 'Credit' ? 'var(--warning)' : 'var(--border)'}`,
                                    borderRadius: '6px',
                                    backgroundColor: paymentType === 'Credit' ? 'var(--bg-accent)' : 'transparent',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontWeight: '600',
                                    color: paymentType === 'Credit' ? 'var(--warning)' : 'var(--text-secondary)'
                                }}
                            >
                                📝 Credit (Pay Later)
                            </button>
                        </div>
                    </Card>

                    <Card title="Bill Summary">
                        {/* Fee Breakdown */}
                        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-accent)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                                Fee Breakdown
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Service Charge (Our Fee)</span>
                                <span style={{ fontWeight: '600' }}>AED {totalServiceFee}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Government Fee</span>
                                <span style={{ fontWeight: '600' }}>AED {totalGovtFee}</span>
                            </div>
                        </div>

                        {/* Grand Total */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            backgroundColor: 'var(--accent)',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '1.25rem',
                            fontWeight: '700'
                        }}>
                            <span>Grand Total</span>
                            <span>AED {grandTotal}</span>
                        </div>

                        {/* Amount Received - Only for Cash payments */}
                        {paymentType === 'Cash' && grandTotal > 0 && (
                            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    💰 Amount Received from Customer
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder={`Enter amount received (min AED ${grandTotal})`}
                                    value={amountReceived}
                                    onChange={(e) => setAmountReceived(e.target.value)}
                                    style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '600' }}
                                />
                                {amountReceived && Number(amountReceived) >= grandTotal && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        backgroundColor: 'var(--success)',
                                        color: 'white',
                                        borderRadius: '6px',
                                        fontWeight: '700'
                                    }}>
                                        <span>💵 Change to Return:</span>
                                        <span>AED {change.toFixed(2)}</span>
                                    </div>
                                )}
                                {paymentType === 'Cash' && amountReceived && Number(amountReceived) < grandTotal && (
                                    <div style={{
                                        padding: '0.75rem',
                                        backgroundColor: 'var(--warning)',
                                        color: 'white',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }}>
                                        ⚠️ Amount short by AED {(grandTotal - Number(amountReceived)).toFixed(2)} - will be saved as Credit
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={handleGenerateInvoice}
                            style={{ width: '100%', marginTop: '1.5rem' }}
                        >
                            <Printer size={16} /> Generate Invoice
                        </Button>
                    </Card>
                </div>
            )}

            {/* Thermal Print Modal */}
            <Modal
                isOpen={!!printInvoice}
                onClose={() => setPrintInvoice(null)}
                title="Print Receipt"
            >
                {printInvoice && (
                    <ThermalReceipt
                        invoice={printInvoice}
                        onClose={() => setPrintInvoice(null)}
                    />
                )}
            </Modal>
        </>
    );
};

export default Invoices;

