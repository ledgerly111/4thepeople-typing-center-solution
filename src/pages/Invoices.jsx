import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SearchableSelect from '../components/ui/SearchableSelect';
import InvoicePreview from '../components/ui/InvoicePreview';
import { useStore } from '../contexts/StoreContext';
import { MOCK_CUSTOMERS, MOCK_SERVICES } from '../services/mockData';
import { Plus, Printer, Trash2, ArrowLeft, Eye, CheckCircle, Search } from 'lucide-react';

const Invoices = () => {
    const { invoices, addInvoice, updateInvoiceStatus } = useStore();
    const [view, setView] = useState('list');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [lineItems, setLineItems] = useState([]);
    const [paymentType, setPaymentType] = useState('Cash');
    const [previewInvoice, setPreviewInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Filter and sort invoices (newest first)
    const filteredInvoices = invoices
        .filter(inv => {
            const matchesSearch =
                inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.id.toString().includes(searchTerm);
            const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const addItem = () => {
        setLineItems([...lineItems, { serviceId: '', price: 0, name: '' }]);
    };

    const updateItem = (index, serviceId) => {
        const newItems = [...lineItems];
        const service = MOCK_SERVICES.find(s => s.id === parseInt(serviceId));
        newItems[index] = {
            serviceId: serviceId,
            price: service ? service.price : 0,
            name: service ? service.name : ''
        };
        setLineItems(newItems);
    };

    const removeItem = (index) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const total = lineItems.reduce((sum, item) => sum + Number(item.price), 0);

    // Get today's date in correct format
    const getTodayDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleGenerateInvoice = () => {
        if (!selectedCustomer) {
            alert('Please select a customer');
            return;
        }
        if (lineItems.length === 0 || lineItems.some(item => !item.serviceId)) {
            alert('Please add at least one service');
            return;
        }

        const customer = MOCK_CUSTOMERS.find(c => c.id === parseInt(selectedCustomer));
        const newInvoice = addInvoice({
            customerName: customer ? customer.name : 'Unknown',
            customerMobile: customer ? customer.mobile : '',
            customerEmail: customer ? customer.email : '',
            total: total,
            status: paymentType === 'Cash' ? 'Paid' : 'Pending',
            paymentType: paymentType,
            items: lineItems.map(item => ({ name: item.name, price: item.price })),
            date: getTodayDate()
        });

        setPreviewInvoice(newInvoice);
        setSelectedCustomer('');
        setLineItems([]);
        setPaymentType('Cash');
        setView('list');
    };

    const openInvoicePreview = (invoice) => {
        const fullInvoice = {
            ...invoice,
            items: Array.isArray(invoice.items) ? invoice.items : [{ name: 'Service', price: invoice.total }]
        };
        setPreviewInvoice(fullInvoice);
    };

    const customerOptions = MOCK_CUSTOMERS.map(c => ({
        id: c.id,
        name: `${c.name} (${c.mobile})`
    }));

    const serviceOptions = MOCK_SERVICES.map(s => ({
        id: s.id,
        name: `${s.name} - AED ${s.price}`
    }));

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div>
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
                            <select
                                className="select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ minWidth: '120px' }}
                            >
                                <option value="All">All Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                            </select>
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
                                                <td>{inv.customerName}</td>
                                                <td>{inv.paymentType || 'Cash'}</td>
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

                    <Card title="Summary">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Subtotal</span>
                            <span>AED {total}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                            <span>VAT (0%)</span>
                            <span>AED 0</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '1rem',
                            borderTop: '2px dashed var(--border)',
                            fontSize: '1.25rem',
                            fontWeight: '700'
                        }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--accent)' }}>AED {total}</span>
                        </div>

                        <Button onClick={handleGenerateInvoice} style={{ width: '100%', marginTop: '1.5rem' }}>
                            <Printer size={16} /> Generate Invoice
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Invoices;
