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

    // Beneficiary fields
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [beneficiaryIdNumber, setBeneficiaryIdNumber] = useState('');

    // Bulk create modal
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkCustomer, setBulkCustomer] = useState('');
    const [bulkService, setBulkService] = useState('');
    const [bulkBeneficiaries, setBulkBeneficiaries] = useState('');
    const [bulkCombined, setBulkCombined] = useState(false); // true = one invoice, false = separate invoices
    const [hideGovtFee, setHideGovtFee] = useState(false); // Option to hide govt fee in invoice preview/print

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
            beneficiary_name: beneficiaryName || null,
            beneficiary_id_number: beneficiaryIdNumber || null,
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
        setBeneficiaryName('');
        setBeneficiaryIdNumber('');
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

    // Get today's date utility
    const getTodayDateForBulk = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Handle bulk invoice creation
    const handleBulkCreate = async () => {
        if (!bulkCustomer) {
            alert('Please select a customer (paying company)');
            return;
        }
        if (!bulkService) {
            alert('Please select a service');
            return;
        }
        if (!bulkBeneficiaries.trim()) {
            alert('Please enter at least one beneficiary (one per line)');
            return;
        }

        const customer = (customers || []).find(c => c.id === parseInt(bulkCustomer));
        const service = (services || []).find(s => s.id === parseInt(bulkService));

        if (!service) {
            alert('Service not found');
            return;
        }

        // Parse beneficiaries (one per line, format: Name | ID/Passport)
        const beneficiaryLines = bulkBeneficiaries.trim().split('\n').filter(line => line.trim());

        const serviceFee = parseFloat(service.service_fee || service.serviceFee || 0);
        const govtFee = parseFloat(service.govt_fee || service.govtFee || 0);
        const serviceTotal = parseFloat(service.total || (serviceFee + govtFee) || 0);

        if (bulkCombined) {
            // Mode A: Create ONE combined invoice with all beneficiaries as line items
            const items = beneficiaryLines.map(line => {
                const parts = line.split('|').map(p => p.trim());
                const bName = parts[0] || '';
                const bId = parts[1] || '';
                return {
                    name: `${service.name} - ${bName}${bId ? ` (${bId})` : ''}`,
                    serviceFee: serviceFee,
                    govtFee: govtFee,
                    price: serviceTotal,
                    beneficiaryName: bName,
                    beneficiaryId: bId
                };
            }).filter(item => item.beneficiaryName);

            const totalServiceFee = items.reduce((sum, i) => sum + i.serviceFee, 0);
            const totalGovtFee = items.reduce((sum, i) => sum + i.govtFee, 0);
            const grandTotal = items.reduce((sum, i) => sum + i.price, 0);

            await addInvoice({
                customer_name: customer ? customer.name : 'Unknown',
                customer_mobile: customer ? customer.mobile : '',
                customer_email: customer ? customer.email : '',
                beneficiary_name: `${items.length} beneficiaries`,
                beneficiary_id_number: null,
                service_fee: totalServiceFee,
                govt_fee: totalGovtFee,
                total: grandTotal,
                amount_received: 0,
                change: 0,
                status: 'Pending',
                payment_type: 'Credit',
                items: items,
                date: getTodayDateForBulk()
            });

            alert(`Successfully created 1 combined invoice with ${items.length} beneficiaries!`);
        } else {
            // Mode B: Create SEPARATE invoices for each beneficiary
            let createdCount = 0;

            for (const line of beneficiaryLines) {
                const parts = line.split('|').map(p => p.trim());
                const bName = parts[0] || '';
                const bId = parts[1] || '';

                if (!bName) continue;

                await addInvoice({
                    customer_name: customer ? customer.name : 'Unknown',
                    customer_mobile: customer ? customer.mobile : '',
                    customer_email: customer ? customer.email : '',
                    beneficiary_name: bName,
                    beneficiary_id_number: bId || null,
                    service_fee: serviceFee,
                    govt_fee: govtFee,
                    total: serviceTotal,
                    amount_received: 0,
                    change: 0,
                    status: 'Pending',
                    payment_type: 'Credit',
                    items: [{
                        name: service.name,
                        serviceFee: serviceFee,
                        govtFee: govtFee,
                        price: serviceTotal
                    }],
                    date: getTodayDateForBulk()
                });
                createdCount++;
            }

            alert(`Successfully created ${createdCount} separate invoices!`);
        }

        setShowBulkModal(false);
        setBulkCustomer('');
        setBulkService('');
        setBulkBeneficiaries('');
        setBulkCombined(false);
    };

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <>
            {previewInvoice && (
                <>
                    {/* Hide Govt Fee Toggle - positioned in corner */}
                    <div className="no-print" style={{
                        position: 'fixed',
                        top: '1rem',
                        right: '1rem',
                        zIndex: 3005,
                        background: 'var(--bg-card)',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <input
                            type="checkbox"
                            id="hideGovtFee"
                            checked={hideGovtFee}
                            onChange={(e) => setHideGovtFee(e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <label htmlFor="hideGovtFee" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                            Hide Govt Fees
                        </label>
                    </div>
                    <InvoicePreview
                        invoice={previewInvoice}
                        onClose={() => setPreviewInvoice(null)}
                        hideGovtFee={hideGovtFee}
                    />
                </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                {view === 'list' ? (
                    <>
                        <h2 style={{ margin: 0 }}>Invoices</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button variant="secondary" onClick={() => setShowBulkModal(true)}>
                                <Plus size={16} /> Bulk Create
                            </Button>
                            <Button onClick={() => setView('create')}>
                                <Plus size={16} /> New Invoice
                            </Button>
                        </div>
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
                                                <td>
                                                    <div>{inv.customer_name || inv.customerName}</div>
                                                    {(inv.beneficiary_name || inv.beneficiaryName) && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            👤 {inv.beneficiary_name || inv.beneficiaryName}
                                                        </div>
                                                    )}
                                                </td>
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

                    {/* Beneficiary Section */}
                    <Card title="👤 Beneficiary (Optional)" style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            Person receiving the service (leave blank if same as customer)
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Beneficiary Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={beneficiaryName}
                                    onChange={(e) => setBeneficiaryName(e.target.value)}
                                    placeholder="e.g., Ahmed Hassan"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">ID/Passport</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={beneficiaryIdNumber}
                                    onChange={(e) => setBeneficiaryIdNumber(e.target.value)}
                                    placeholder="e.g., A12345678"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card title="Services" style={{ marginTop: '1rem' }}>
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

            {/* Bulk Create Modal */}
            <Modal
                isOpen={showBulkModal}
                onClose={() => {
                    setShowBulkModal(false);
                    setBulkCustomer('');
                    setBulkService('');
                    setBulkBeneficiaries('');
                    setBulkCombined(false);
                }}
                title="📋 Bulk Create Invoices"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowBulkModal(false)}>Cancel</Button>
                        <Button onClick={handleBulkCreate}>Create Invoices</Button>
                    </>
                }
            >
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-accent)', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <strong>💡 Tip:</strong> Enter one beneficiary per line. Format: <code>Name | ID/Passport</code>
                </div>

                <div className="form-group">
                    <label className="form-label">Customer (Paying Company) *</label>
                    <SearchableSelect
                        options={customerOptions}
                        value={bulkCustomer}
                        onChange={setBulkCustomer}
                        placeholder="Search customer..."
                        displayKey="name"
                        valueKey="id"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Service (Same for all) *</label>
                    <SearchableSelect
                        options={serviceOptions}
                        value={bulkService}
                        onChange={setBulkService}
                        placeholder="Search service..."
                        displayKey="name"
                        valueKey="id"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Beneficiaries (One per line) *</label>
                    <textarea
                        className="input"
                        value={bulkBeneficiaries}
                        onChange={(e) => setBulkBeneficiaries(e.target.value)}
                        placeholder="Ahmed Hassan | A12345678
Mohammed Ali | B87654321
Fatima Khan"
                        rows={8}
                        style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                    />
                    <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                        {bulkBeneficiaries.split('\n').filter(l => l.trim()).length} beneficiaries will be created
                    </small>
                </div>

                {/* Toggle: Combined vs Separate */}
                <div style={{
                    padding: '1rem',
                    background: 'var(--bg-accent)',
                    borderRadius: '8px',
                    marginTop: '0.5rem'
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={bulkCombined}
                            onChange={(e) => setBulkCombined(e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                        />
                        <div>
                            <strong>Create ONE combined invoice</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {bulkCombined
                                    ? '✓ All beneficiaries will be line items on a single invoice'
                                    : 'Each beneficiary gets a separate invoice'
                                }
                            </div>
                        </div>
                    </label>
                </div>
            </Modal>
        </>
    );
};

export default Invoices;

