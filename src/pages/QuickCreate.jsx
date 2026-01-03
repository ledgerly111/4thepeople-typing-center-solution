import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SearchableSelect from '../components/ui/SearchableSelect';
import InvoicePreview from '../components/ui/InvoicePreview';
import IDScanner from '../components/ui/IDScanner';
import { useStore } from '../contexts/StoreContext';
import {
    Zap, User, UserPlus, Plus, Trash2, FileText, ClipboardList,
    Receipt, DollarSign, Wallet, Printer, ArrowLeft, Save, Scan
} from 'lucide-react';

const QuickCreate = () => {
    const navigate = useNavigate();
    const {
        customers,
        services,
        addCustomer,
        addInvoice,
        addWorkOrder,
        govtFeeCards,
        fetchGovtFeeCards,
        deductFromCard
    } = useStore();

    // Output Type: quotation, work_order, invoice
    const [outputType, setOutputType] = useState('invoice');

    // Customer
    const [customerMode, setCustomerMode] = useState('existing'); // existing, walkin, new
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '' });

    // Services - array of { serviceId, name, serviceFee, govtFee, price }
    const [serviceItems, setServiceItems] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');

    // Beneficiary (optional, collapsed by default)
    const [showBeneficiary, setShowBeneficiary] = useState(false);
    const [sameAsCustomer, setSameAsCustomer] = useState(true);
    const [beneficiary, setBeneficiary] = useState({ name: '', id_number: '' });

    // Payment (for invoice only)
    const [paymentType, setPaymentType] = useState('Cash');
    const [amountReceived, setAmountReceived] = useState('');
    const [selectedCardId, setSelectedCardId] = useState('');

    // Reference & Notes
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes] = useState('');

    // Preview
    const [showPreview, setShowPreview] = useState(false);
    const [createdDocument, setCreatedDocument] = useState(null);

    // Loading
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ID Scanner
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        fetchGovtFeeCards();
    }, []);

    // Get active cards
    const activeCards = govtFeeCards.filter(c => c.status === 'Active');

    // Customer options
    const customerOptions = (customers || []).map(c => ({
        id: c.id,
        name: `${c.name} (${c.mobile})`
    }));

    // Service options
    const serviceOptions = (services || []).map(s => ({
        id: s.id,
        name: `${s.name} - AED ${(parseFloat(s.service_fee || 0) + parseFloat(s.govt_fee || 0)).toFixed(0)}`
    }));

    // Get selected customer data
    const getCustomerData = () => {
        if (customerMode === 'walkin') {
            return { name: 'Walk-in Customer', mobile: '', email: '' };
        } else if (customerMode === 'new') {
            return { name: newCustomer.name, mobile: newCustomer.mobile, email: '' };
        } else {
            const customer = customers.find(c => c.id === parseInt(selectedCustomerId));
            return customer || { name: '', mobile: '', email: '' };
        }
    };

    // Handle scanned ID data
    const handleScanComplete = (data) => {
        setCustomerMode('new');
        setNewCustomer({
            name: data.name || '',
            mobile: '',
            emirates_id: data.emirates_id || '',
            nationality: data.nationality || ''
        });
        setShowScanner(false);
    };

    // Add service to list
    const addService = () => {
        if (!selectedServiceId) return;

        const service = services.find(s => s.id === parseInt(selectedServiceId));
        if (!service) return;

        // Check if already added
        if (serviceItems.some(item => item.serviceId === service.id)) {
            alert('Service already added');
            return;
        }

        setServiceItems([...serviceItems, {
            serviceId: service.id,
            name: service.name,
            serviceFee: parseFloat(service.service_fee || 0),
            govtFee: parseFloat(service.govt_fee || 0),
            price: parseFloat(service.service_fee || 0) + parseFloat(service.govt_fee || 0)
        }]);
        setSelectedServiceId('');
    };

    // Remove service
    const removeService = (index) => {
        setServiceItems(serviceItems.filter((_, i) => i !== index));
    };

    // Calculate totals
    const totals = serviceItems.reduce((acc, item) => ({
        serviceFee: acc.serviceFee + item.serviceFee,
        govtFee: acc.govtFee + item.govtFee,
        total: acc.total + item.price
    }), { serviceFee: 0, govtFee: 0, total: 0 });

    // Validate form
    const isValid = () => {
        const customerData = getCustomerData();
        if (!customerData.name) return false;
        if (customerMode === 'new' && !newCustomer.mobile) return false;
        if (serviceItems.length === 0) return false;
        return true;
    };

    // Handle submission
    const handleSubmit = async (type) => {
        if (!isValid()) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        const customerData = getCustomerData();

        // If new customer, check if customer already exists first
        if (customerMode === 'new') {
            // Check if customer with this mobile already exists
            const existingCustomer = customers.find(c => c.mobile === newCustomer.mobile);

            if (!existingCustomer) {
                // Only create if customer doesn't exist
                const created = await addCustomer({
                    name: newCustomer.name,
                    mobile: newCustomer.mobile,
                    emirates_id: newCustomer.emirates_id || null,
                    nationality: newCustomer.nationality || null
                });
                if (!created) {
                    alert('Failed to create customer');
                    setIsSubmitting(false);
                    return;
                }
            }
            // If customer exists, just continue with the existing customer data
        }

        // Beneficiary data
        const beneficiaryData = sameAsCustomer
            ? { name: customerData.name, id_number: '' }
            : beneficiary;

        try {
            if (type === 'quotation') {
                // Quotation is same as invoice but with status = 'Quotation'
                const result = await addInvoice({
                    customer_name: customerData.name,
                    customer_mobile: customerData.mobile,
                    customer_email: customerData.email || '',
                    beneficiary_name: beneficiaryData.name,
                    beneficiary_id_number: beneficiaryData.id_number,
                    reference_number: referenceNumber || null,
                    service_fee: totals.serviceFee,
                    govt_fee: totals.govtFee,
                    total: totals.total,
                    amount_received: 0,
                    change: 0,
                    status: 'Quotation',
                    payment_type: 'Credit',
                    notes: notes,
                    items: serviceItems,
                    date: new Date().toISOString().split('T')[0]
                });

                if (result?.success) {
                    setCreatedDocument(result.data);
                    setShowPreview(true);
                } else {
                    alert(`Failed to create quotation: ${result?.error || 'Unknown error'}`);
                }

            } else if (type === 'work_order') {
                const result = await addWorkOrder({
                    customer_name: customerData.name,
                    customer_mobile: customerData.mobile,
                    customer_email: customerData.email || '',
                    beneficiary_name: beneficiaryData.name,
                    beneficiary_id_number: beneficiaryData.id_number,
                    reference_number: referenceNumber || null,
                    service_fee: totals.serviceFee,
                    govt_fee: totals.govtFee,
                    total: totals.total,
                    status: 'Pending',
                    notes: notes,
                    services: serviceItems,  // Fixed: was 'items', should be 'services' to match DB
                    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });

                if (result?.success || result?.id) {
                    alert('Work Order created successfully!');
                    navigate('/dashboard/work-orders');
                } else {
                    alert(`Failed to create work order: ${result?.error || 'Unknown error'}`);
                }

            } else if (type === 'invoice') {
                // Deduct from wallet card if selected
                let cardUsed = null;
                if (selectedCardId && totals.govtFee > 0) {
                    const deductResult = await deductFromCard(
                        parseInt(selectedCardId),
                        totals.govtFee,
                        null,
                        `Invoice govt fee - ${customerData.name}`
                    );
                    if (!deductResult) {
                        setIsSubmitting(false);
                        return;
                    }
                    cardUsed = govtFeeCards.find(c => c.id === parseInt(selectedCardId));
                }

                const isPaid = paymentType !== 'Credit';
                const receivedAmount = paymentType === 'Cash' ? Number(amountReceived) || totals.total : totals.total;

                const result = await addInvoice({
                    customer_name: customerData.name,
                    customer_mobile: customerData.mobile,
                    customer_email: customerData.email || '',
                    beneficiary_name: beneficiaryData.name,
                    beneficiary_id_number: beneficiaryData.id_number,
                    reference_number: referenceNumber || null,
                    service_fee: totals.serviceFee,
                    govt_fee: totals.govtFee,
                    total: totals.total,
                    amount_received: isPaid ? receivedAmount : 0,
                    change: isPaid && paymentType === 'Cash' ? Math.max(0, receivedAmount - totals.total) : 0,
                    status: isPaid ? 'Paid' : 'Pending',
                    payment_type: isPaid ? paymentType : 'Credit',
                    govt_fee_card_id: selectedCardId ? parseInt(selectedCardId) : null,
                    govt_fee_card_name: cardUsed?.card_name || null,
                    notes: notes,
                    items: serviceItems,
                    date: new Date().toISOString().split('T')[0]
                });

                if (result?.success) {
                    setCreatedDocument(result.data);
                    setShowPreview(true);
                } else {
                    alert(`Failed to create invoice: ${result?.error || 'Unknown error'}`);
                }
            }
        } catch (error) {
            console.error('Error creating document:', error);
            alert('An error occurred');
        }

        setIsSubmitting(false);
    };

    // If showing preview
    if (showPreview && createdDocument) {
        return (
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
                <InvoicePreview
                    invoice={createdDocument}
                    onClose={() => navigate('/dashboard/invoices')}
                />
            </div>
        );
    }

    return (
        <div className="page" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <button
                        onClick={() => navigate(-1)}
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
                        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={28} style={{ color: 'var(--accent)' }} />
                            Quick Create
                        </h1>
                        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
                            Create quotations, work orders, or invoices
                        </p>
                    </div>
                </div>
            </div>

            {/* Output Type Selector */}
            <Card style={{ marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Create As
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {[
                            { id: 'quotation', label: 'Quotation', icon: FileText, color: '#6366f1' },
                            { id: 'work_order', label: 'Work Order', icon: ClipboardList, color: '#f59e0b' },
                            { id: 'invoice', label: 'Invoice', icon: Receipt, color: 'var(--success)' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setOutputType(type.id)}
                                style={{
                                    flex: '1 1 100px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    border: outputType === type.id ? `2px solid ${type.color}` : '2px solid var(--border)',
                                    borderRadius: '8px',
                                    background: outputType === type.id ? `${type.color}15` : 'var(--bg)',
                                    color: outputType === type.id ? type.color : 'var(--text)',
                                    cursor: 'pointer',
                                    fontWeight: outputType === type.id ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <type.icon size={18} />
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Customer Section */}
            <Card style={{ marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={14} /> Customer
                        </span>
                        <button
                            onClick={() => setShowScanner(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.4rem 0.75rem',
                                border: 'none',
                                borderRadius: '6px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}
                        >
                            <Scan size={14} />
                            Scan ID
                        </button>
                    </div>

                    {/* Customer Mode Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[
                            { id: 'existing', label: 'Existing' },
                            { id: 'walkin', label: 'Walk-in' },
                            { id: 'new', label: 'New Customer' }
                        ].map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => setCustomerMode(mode.id)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: customerMode === mode.id ? 'var(--accent)' : 'var(--bg-accent)',
                                    color: customerMode === mode.id ? 'white' : 'var(--text)',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: customerMode === mode.id ? '600' : '400'
                                }}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>

                    {customerMode === 'existing' && (
                        <SearchableSelect
                            options={customerOptions}
                            value={selectedCustomerId}
                            onChange={setSelectedCustomerId}
                            placeholder="Search customer by name or mobile..."
                        />
                    )}

                    {customerMode === 'walkin' && (
                        <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', textAlign: 'center' }}>
                            <User size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                            <div style={{ fontWeight: '500' }}>Walk-in Customer</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No customer record will be saved</div>
                        </div>
                    )}

                    {customerMode === 'new' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Customer name"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="05xxxxxxxx"
                                    value={newCustomer.mobile}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Services Section */}
            <Card style={{ marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                        Services
                    </div>

                    {/* Add Service Row */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <SearchableSelect
                                options={serviceOptions}
                                value={selectedServiceId}
                                onChange={setSelectedServiceId}
                                placeholder="Search and select service..."
                            />
                        </div>
                        <Button onClick={addService} disabled={!selectedServiceId}>
                            <Plus size={18} /> Add
                        </Button>
                    </div>

                    {/* Service Table */}
                    {serviceItems.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Service</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Service Fee</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Govt Fee</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</th>
                                        <th style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceItems.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>{item.name}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>AED {item.serviceFee.toFixed(2)}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#8b5cf6' }}>AED {item.govtFee.toFixed(2)}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: '600' }}>AED {item.price.toFixed(2)}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => removeService(index)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Totals Row */}
                                    <tr style={{ background: 'var(--bg-accent)', fontWeight: '700' }}>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>TOTAL</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>AED {totals.serviceFee.toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#8b5cf6' }}>AED {totals.govtFee.toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--success)', fontSize: '1.1rem' }}>AED {totals.total.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--bg-accent)', borderRadius: '8px' }}>
                            <FileText size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p style={{ margin: 0 }}>No services added yet</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>Select a service above and click Add</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Beneficiary Section (Collapsible) */}
            <Card style={{ marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem' }}>
                    <button
                        onClick={() => setShowBeneficiary(!showBeneficiary)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem 0',
                            color: 'var(--text)'
                        }}
                    >
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Beneficiary (Optional)
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{showBeneficiary ? '−' : '+'}</span>
                    </button>

                    {showBeneficiary && (
                        <div style={{ marginTop: '0.75rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <input
                                    type="checkbox"
                                    checked={sameAsCustomer}
                                    onChange={(e) => setSameAsCustomer(e.target.checked)}
                                />
                                Same as customer
                            </label>

                            {!sameAsCustomer && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Beneficiary name"
                                            value={beneficiary.name}
                                            onChange={(e) => setBeneficiary({ ...beneficiary, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID Number</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Emirates ID / Passport"
                                            value={beneficiary.id_number}
                                            onChange={(e) => setBeneficiary({ ...beneficiary, id_number: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Payment Section (Invoice Only) */}
            {outputType === 'invoice' && (
                <Card style={{ marginBottom: '1rem' }}>
                    <div style={{ padding: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DollarSign size={14} /> Payment
                        </div>

                        {/* Payment Type */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            {['Cash', 'Card', 'Bank Transfer', 'Credit'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setPaymentType(type)}
                                    style={{
                                        flex: '1 1 80px',
                                        padding: '0.5rem 0.75rem',
                                        border: paymentType === type ? '2px solid var(--accent)' : '1px solid var(--border)',
                                        borderRadius: '6px',
                                        background: paymentType === type ? 'var(--accent)' : 'var(--bg)',
                                        color: paymentType === type ? 'white' : 'var(--text)',
                                        cursor: 'pointer',
                                        fontWeight: paymentType === type ? '600' : '400',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Cash Amount */}
                        {paymentType === 'Cash' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount Received</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder={`Enter amount (Total: AED ${totals.total.toFixed(2)})`}
                                    value={amountReceived}
                                    onChange={(e) => setAmountReceived(e.target.value)}
                                />
                                {amountReceived && Number(amountReceived) > totals.total && (
                                    <div style={{ marginTop: '0.5rem', color: 'var(--success)', fontSize: '0.875rem' }}>
                                        Change: AED {(Number(amountReceived) - totals.total).toFixed(2)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wallet Card for Govt Fee */}
                        {totals.govtFee > 0 && (
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Wallet size={14} /> Wallet Card (for Govt Fee: AED {totals.govtFee.toFixed(2)})
                                </label>
                                <select
                                    className="input"
                                    value={selectedCardId}
                                    onChange={(e) => setSelectedCardId(e.target.value)}
                                    style={{ marginTop: '0.25rem' }}
                                >
                                    <option value="">No card (pay separately)</option>
                                    {activeCards.map(card => (
                                        <option key={card.id} value={card.id}>
                                            {card.card_name} ({card.card_type}) - AED {parseFloat(card.balance).toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Reference & Notes */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reference Number (Optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Application ID"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notes (Optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Any additional notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {outputType === 'quotation' && (
                    <Button
                        onClick={() => handleSubmit('quotation')}
                        disabled={!isValid() || isSubmitting}
                        style={{ flex: 1, padding: '1rem', fontSize: '1rem', background: '#6366f1' }}
                    >
                        <FileText size={20} />
                        {isSubmitting ? 'Creating...' : 'Create Quotation'}
                    </Button>
                )}

                {outputType === 'work_order' && (
                    <Button
                        onClick={() => handleSubmit('work_order')}
                        disabled={!isValid() || isSubmitting}
                        style={{ flex: 1, padding: '1rem', fontSize: '1rem', background: '#f59e0b' }}
                    >
                        <ClipboardList size={20} />
                        {isSubmitting ? 'Creating...' : 'Create Work Order'}
                    </Button>
                )}

                {outputType === 'invoice' && (
                    <Button
                        onClick={() => handleSubmit('invoice')}
                        disabled={!isValid() || isSubmitting}
                        style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                    >
                        <Receipt size={20} />
                        {isSubmitting ? 'Creating...' : 'Create Invoice'}
                    </Button>
                )}
            </div>

            {/* ID Scanner Modal */}
            {showScanner && (
                <IDScanner
                    onScanComplete={handleScanComplete}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};

export default QuickCreate;
