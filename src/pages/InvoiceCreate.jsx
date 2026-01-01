import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import SearchableSelect from '../components/ui/SearchableSelect';
import InvoicePreview from '../components/ui/InvoicePreview';
import { useStore } from '../contexts/StoreContext';
import {
    ArrowLeft, Plus, Trash2, User, UserPlus, Save, CreditCard,
    FileText, Users, Building, DollarSign, Printer
} from 'lucide-react';

const InvoiceCreate = () => {
    const navigate = useNavigate();
    const {
        customers,
        services,
        addCustomer,
        addInvoice,
        govtFeeCards,
        fetchGovtFeeCards,
        deductFromCard
    } = useStore();

    // Customer Mode
    const [customerMode, setCustomerMode] = useState('existing');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '' });

    // Sponsor (optional)
    const [hasSponsor, setHasSponsor] = useState(false);
    const [sponsor, setSponsor] = useState({
        name: '', type: 'Company', id: '', contact: ''
    });

    // Beneficiary Mode
    const [beneficiaryMode, setBeneficiaryMode] = useState('single');
    const [sameAsCustomer, setSameAsCustomer] = useState(true);
    const [beneficiary, setBeneficiary] = useState({ name: '', id_number: '', passport: '', nationality: '' });
    const [bulkBeneficiaries, setBulkBeneficiaries] = useState('');
    const [bulkCombined, setBulkCombined] = useState(false); // true = one invoice, false = separate

    // Services

    const [selectedServices, setSelectedServices] = useState([]);

    // Payment
    const [paymentType, setPaymentType] = useState('Cash');
    const [amountReceived, setAmountReceived] = useState('');
    const [selectedCardId, setSelectedCardId] = useState('');

    // Reference
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes] = useState('');

    // Preview
    const [showPreview, setShowPreview] = useState(false);
    const [createdInvoice, setCreatedInvoice] = useState(null);

    useEffect(() => {
        fetchGovtFeeCards();
    }, []);


    const customerOptions = (customers || []).map(c => ({ id: c.id, name: `${c.name} (${c.mobile})` }));
    const serviceOptions = (services || []).map(s => ({
        id: s.id,
        name: `${s.name} - AED ${parseFloat(s.service_fee || 0) + parseFloat(s.govt_fee || 0)}`
    }));

    // Parse bulk beneficiaries
    const parseBulkBeneficiaries = () => {
        return bulkBeneficiaries
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                const parts = line.split(',').map(p => p.trim());
                return { name: parts[0] || '', id_number: parts[1] || '' };
            });
    };
    const beneficiaryList = beneficiaryMode === 'multiple' ? parseBulkBeneficiaries() : [];

    // Calculate totals
    const calculateTotals = () => {
        let serviceFee = 0, govtFee = 0;
        selectedServices.forEach(serviceId => {
            const service = services.find(s => s.id === parseInt(serviceId));
            if (service) {
                serviceFee += parseFloat(service.service_fee || 0);
                govtFee += parseFloat(service.govt_fee || 0);
            }
        });

        let multiplier = 1;
        if (beneficiaryMode === 'multiple' && !bulkCombined) {
            multiplier = Math.max(1, beneficiaryList.length);
        } else if (beneficiaryMode === 'multiple' && bulkCombined) {
            multiplier = Math.max(1, beneficiaryList.length);
        }

        return {
            serviceFee: serviceFee * multiplier,
            govtFee: govtFee * multiplier,
            total: (serviceFee + govtFee) * multiplier,
            perPerson: serviceFee + govtFee,
            count: beneficiaryMode === 'multiple' ? beneficiaryList.length : 1
        };
    };

    const { serviceFee, govtFee, total, perPerson, count } = calculateTotals();
    const change = paymentType === 'Cash' && amountReceived ? Math.max(0, Number(amountReceived) - total) : 0;

    // Service management
    const addService = () => setSelectedServices([...selectedServices, '']);
    const updateService = (index, value) => {
        const newServices = [...selectedServices];
        newServices[index] = value;
        setSelectedServices(newServices);
    };
    const removeService = (index) => setSelectedServices(selectedServices.filter((_, i) => i !== index));

    // Handle Submit
    const handleSubmit = async () => {
        // Validate
        if (customerMode === 'existing' && !selectedCustomerId) {
            alert('Please select a customer');
            return;
        }
        if (customerMode === 'new' && (!newCustomer.name || !newCustomer.mobile)) {
            alert('Please enter customer name and mobile');
            return;
        }
        if (selectedServices.length === 0 || selectedServices.some(s => !s)) {
            alert('Please add at least one service');
            return;
        }
        if (beneficiaryMode === 'multiple' && beneficiaryList.length === 0) {
            alert('Please enter at least one beneficiary');
            return;
        }

        // Get/Create customer
        let customerData;
        if (customerMode === 'new') {
            customerData = await addCustomer({ name: newCustomer.name, mobile: newCustomer.mobile });
            if (!customerData) { alert('Failed to create customer'); return; }
        } else {
            customerData = customers.find(c => c.id === parseInt(selectedCustomerId));
        }

        // Build service details
        const serviceDetails = selectedServices.map(serviceId => {
            const service = services.find(s => s.id === parseInt(serviceId));
            return {
                id: service?.id,
                name: service?.name,
                category: service?.category,
                serviceFee: parseFloat(service?.service_fee || 0),
                govtFee: parseFloat(service?.govt_fee || 0),
                price: parseFloat(service?.service_fee || 0) + parseFloat(service?.govt_fee || 0)
            };
        });

        // Deduct govt fee from wallet card if selected (regardless of payment method)
        let cardUsed = null;

        // Paid = any payment type except Credit
        const isPaid = paymentType !== 'Credit';

        // Deduct govt fee from selected wallet card if govt fee > 0 and card selected
        if (selectedCardId && govtFee > 0) {
            const deductResult = await deductFromCard(
                parseInt(selectedCardId),
                govtFee,
                null,
                `Invoice govt fee - ${customerData.name}`
            );
            if (!deductResult) return; // Alert shown by deductFromCard
            cardUsed = govtFeeCards.find(c => c.id === parseInt(selectedCardId));
        }

        // Determine payment status
        const receivedAmount = paymentType === 'Cash' ? Number(amountReceived) || total : total;
        const status = isPaid ? 'Paid' : 'Pending';
        const finalPaymentType = isPaid ? paymentType : 'Credit';

        // Base invoice data
        const baseInvoice = {
            customer_name: customerData.name,
            customer_mobile: customerData.mobile,
            customer_email: customerData.email || '',
            sponsor_name: hasSponsor ? sponsor.name : null,
            sponsor_type: hasSponsor ? sponsor.type : null,
            reference_number: referenceNumber || null,
            service_fee: serviceFee,
            govt_fee: govtFee,
            total: total,
            amount_received: receivedAmount,
            change: isPaid ? Math.max(0, receivedAmount - total) : 0,
            status: status,
            payment_type: finalPaymentType,
            govt_fee_card_id: selectedCardId ? parseInt(selectedCardId) : null,
            govt_fee_card_name: cardUsed?.card_name || null,
            notes: notes,
            date: new Date().toISOString().split('T')[0]
        };

        // Handle multiple beneficiaries
        if (beneficiaryMode === 'multiple' && beneficiaryList.length > 0) {
            if (bulkCombined) {
                // ONE invoice with all beneficiaries as line items
                const combinedItems = [];
                beneficiaryList.forEach(ben => {
                    serviceDetails.forEach(svc => {
                        combinedItems.push({
                            ...svc,
                            name: `${svc.name} - ${ben.name}${ben.id_number ? ` (${ben.id_number})` : ''}`,
                            beneficiaryName: ben.name,
                            beneficiaryId: ben.id_number
                        });
                    });
                });

                const newInvoice = await addInvoice({
                    ...baseInvoice,
                    beneficiary_name: `${beneficiaryList.length} beneficiaries`,
                    items: combinedItems
                });

                if (newInvoice && newInvoice.success) {
                    setCreatedInvoice(newInvoice.data);
                    setShowPreview(true);
                } else {
                    alert(`Failed to create invoice: ${newInvoice?.error || 'Unknown error'}`);
                }
            } else {
                // SEPARATE invoices for each beneficiary
                let createdCount = 0;
                let lastInvoice = null;

                for (const ben of beneficiaryList) {
                    const singleTotal = serviceDetails.reduce((sum, s) => sum + s.price, 0);
                    lastInvoice = await addInvoice({
                        ...baseInvoice,
                        beneficiary_name: ben.name,
                        beneficiary_id_number: ben.id_number,
                        service_fee: serviceDetails.reduce((sum, s) => sum + s.serviceFee, 0),
                        govt_fee: serviceDetails.reduce((sum, s) => sum + s.govtFee, 0),
                        total: singleTotal,
                        amount_received: isPaid ? singleTotal : 0,
                        change: 0,
                        items: serviceDetails
                    });
                    if (lastInvoice && lastInvoice.success) createdCount++;
                    else {
                        alert(`Failed to create invoice (stopped at #${createdCount + 1}): ${lastInvoice?.error || 'Unknown error'}`);
                        break;
                    }
                }

                alert(`Successfully created ${createdCount} invoices!`);
                navigate('/invoices');
                return;
            }
        } else {
            // Single beneficiary invoice
            const beneficiaryData = sameAsCustomer
                ? { name: customerData.name, id_number: '' }
                : beneficiary;

            const newInvoice = await addInvoice({
                ...baseInvoice,
                beneficiary_name: beneficiaryData.name,
                beneficiary_id_number: beneficiaryData.id_number,
                items: serviceDetails
            });

            if (newInvoice && newInvoice.success) {
                setCreatedInvoice(newInvoice.data);
                setShowPreview(true);
            } else {
                alert(`Failed to create invoice: ${newInvoice?.error || 'Unknown error'}\n\nTIP: Run the SQL migration script if you see column errors.`);
            }
        }
    };

    // If showing preview
    if (showPreview && createdInvoice) {
        return (
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
                <InvoicePreview
                    invoice={createdInvoice}
                    onClose={() => navigate('/invoices')}
                />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => navigate('/invoices')}
                    style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: '8px', padding: '0.5rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Create Invoice</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Generate a new invoice for services
                    </p>
                </div>
            </div>

            {/* Customer Section */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <User size={20} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ margin: 0 }}>Customer (Bill To)</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button onClick={() => setCustomerMode('existing')}
                            style={{
                                flex: 1, padding: '0.75rem',
                                background: customerMode === 'existing' ? 'var(--accent)' : 'var(--bg-accent)',
                                color: customerMode === 'existing' ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <User size={16} /> Existing
                        </button>
                        <button onClick={() => setCustomerMode('new')}
                            style={{
                                flex: 1, padding: '0.75rem',
                                background: customerMode === 'new' ? 'var(--success)' : 'var(--bg-accent)',
                                color: customerMode === 'new' ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <UserPlus size={16} /> New
                        </button>
                    </div>

                    {customerMode === 'existing' && (
                        <SearchableSelect
                            options={customerOptions} value={selectedCustomerId} onChange={setSelectedCustomerId}
                            placeholder="Search customer..." displayKey="name" valueKey="id"
                        />
                    )}

                    {customerMode === 'new' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input type="text" className="input" placeholder="Customer Name *"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                            <input type="tel" className="input" placeholder="Mobile *"
                                value={newCustomer.mobile}
                                onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })} />
                        </div>
                    )}
                </div>
            </Card>

            {/* Sponsor Section */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building size={20} style={{ color: 'var(--accent)' }} />
                            <h3 style={{ margin: 0 }}>Sponsor (Optional)</h3>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input type="checkbox" checked={hasSponsor} onChange={(e) => setHasSponsor(e.target.checked)} />
                            Has Sponsor
                        </label>
                    </div>

                    {!hasSponsor && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                            ℹ️ Enable for company/visa-related services
                        </p>
                    )}

                    {hasSponsor && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                            <Select options={[
                                { value: 'Company', label: 'Company' },
                                { value: 'Individual', label: 'Individual' },
                                { value: 'Family', label: 'Family' }
                            ]} value={sponsor.type} onChange={(val) => setSponsor({ ...sponsor, type: val })} />
                            <input type="text" className="input" placeholder="Sponsor Name"
                                value={sponsor.name} onChange={(e) => setSponsor({ ...sponsor, name: e.target.value })} />
                            <input type="text" className="input" placeholder="License/ID"
                                value={sponsor.id} onChange={(e) => setSponsor({ ...sponsor, id: e.target.value })} />
                        </div>
                    )}
                </div>
            </Card>

            {/* Beneficiary Section */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Users size={20} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ margin: 0 }}>Beneficiary (Service Receiver)</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {['Same as Customer', 'Different', 'Multiple (Bulk)'].map((label, i) => {
                            const modes = [
                                { mode: 'single', same: true },
                                { mode: 'single', same: false },
                                { mode: 'multiple', same: false }
                            ];
                            const isActive = beneficiaryMode === modes[i].mode && sameAsCustomer === modes[i].same;
                            return (
                                <button key={label}
                                    onClick={() => { setBeneficiaryMode(modes[i].mode); setSameAsCustomer(modes[i].same); }}
                                    style={{
                                        flex: 1, padding: '0.75rem', fontSize: '0.875rem',
                                        background: isActive ? (i === 2 ? 'var(--success)' : 'var(--accent)') : 'var(--bg-accent)',
                                        color: isActive ? 'white' : 'var(--text-primary)',
                                        border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
                                    }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {beneficiaryMode === 'single' && sameAsCustomer && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>✓ Customer = Beneficiary</p>
                    )}

                    {beneficiaryMode === 'single' && !sameAsCustomer && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input type="text" className="input" placeholder="Beneficiary Name"
                                value={beneficiary.name} onChange={(e) => setBeneficiary({ ...beneficiary, name: e.target.value })} />
                            <input type="text" className="input" placeholder="ID/Passport"
                                value={beneficiary.id_number} onChange={(e) => setBeneficiary({ ...beneficiary, id_number: e.target.value })} />
                        </div>
                    )}

                    {beneficiaryMode === 'multiple' && (
                        <>
                            <textarea className="input" rows={4} style={{ fontFamily: 'monospace' }}
                                placeholder={`One per line: Name, ID\nAhmed Hassan, 784-1234-5678901-2\nMohammad Ali, A12345678`}
                                value={bulkBeneficiaries}
                                onChange={(e) => setBulkBeneficiaries(e.target.value)} />
                            {beneficiaryList.length > 0 && (
                                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-accent)', borderRadius: '6px' }}>
                                    👥 {beneficiaryList.length} beneficiaries
                                </div>
                            )}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={bulkCombined} onChange={(e) => setBulkCombined(e.target.checked)} />
                                <span style={{ fontSize: '0.875rem' }}>
                                    {bulkCombined ? '✓ One combined invoice' : 'Create separate invoices'}
                                </span>
                            </label>
                        </>
                    )}
                </div>
            </Card>

            {/* Services Section */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} style={{ color: 'var(--accent)' }} />
                            <h3 style={{ margin: 0 }}>Services</h3>
                        </div>

                    </div>

                    {selectedServices.map((serviceId, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <SearchableSelect options={serviceOptions} value={serviceId}
                                    onChange={(val) => updateService(index, val)}
                                    placeholder="Search service..." displayKey="name" valueKey="id" />
                            </div>
                            <button onClick={() => removeService(index)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    <Button variant="secondary" onClick={addService} style={{ width: '100%' }}>
                        <Plus size={16} /> Add Service
                    </Button>

                    {selectedServices.length > 0 && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px' }}>
                            {count > 1 && (
                                <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Per person: AED {perPerson.toFixed(2)} × {count} = AED {total.toFixed(2)}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span>Service Fee:</span><span>AED {serviceFee.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span>Govt Fee:</span><span>AED {govtFee.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                <span>Total:</span><span style={{ color: 'var(--accent)' }}>AED {total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Payment Section */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <DollarSign size={20} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ margin: 0 }}>Payment</h3>
                    </div>

                    {/* Payment Type */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                        {['Cash', 'Card', 'Bank Transfer', 'Credit'].map(type => (
                            <button key={type} onClick={() => setPaymentType(type)}
                                style={{
                                    padding: '0.75rem', border: `2px solid ${paymentType === type ? 'var(--accent)' : 'var(--border)'}`,
                                    borderRadius: '8px', background: paymentType === type ? 'var(--bg-accent)' : 'transparent',
                                    cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem',
                                    color: paymentType === type ? 'var(--accent)' : 'var(--text-primary)'
                                }}
                            >
                                {type === 'Cash' && '💵'} {type === 'Card' && '💳'} {type === 'Bank Transfer' && '🏦'} {type === 'Credit' && '📝'} {type}
                            </button>
                        ))}
                    </div>

                    {/* Amount + Card Selection */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {paymentType !== 'Credit' && (
                            <div className="form-group">
                                <label className="form-label">Amount Received</label>
                                <input type="number" className="input" placeholder={`AED ${total.toFixed(2)}`}
                                    value={amountReceived}
                                    onChange={(e) => setAmountReceived(e.target.value)}
                                    style={{ fontSize: '1.1rem', fontWeight: '600' }} />
                            </div>
                        )}

                        {govtFee > 0 && (
                            <div className="form-group">
                                <label className="form-label"><CreditCard size={14} /> Deduct Govt Fee From</label>
                                <Select options={[
                                    { value: '', label: 'Select card (optional)' },
                                    ...govtFeeCards.filter(c => c.status === 'Active').map(c => ({
                                        value: c.id.toString(),
                                        label: `${c.card_name} - AED ${parseFloat(c.balance || 0).toFixed(2)}`
                                    }))
                                ]} value={selectedCardId} onChange={setSelectedCardId} />
                            </div>
                        )}
                    </div>

                    {/* Change Display */}
                    {paymentType === 'Cash' && amountReceived && Number(amountReceived) >= total && (
                        <div style={{
                            marginTop: '1rem', padding: '0.75rem', background: 'var(--success)', color: 'white',
                            borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '600'
                        }}>
                            <span>💵 Change to Return:</span>
                            <span>AED {change.toFixed(2)}</span>
                        </div>
                    )}

                    {paymentType === 'Credit' && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--warning)', color: 'white', borderRadius: '8px' }}>
                            📝 Invoice will be saved as <strong>Pending</strong> (pay later)
                        </div>
                    )}
                </div>
            </Card>

            {/* Notes & Reference */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Reference #</label>
                            <input type="text" className="input" placeholder="Optional"
                                value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <input type="text" className="input" placeholder="Any notes..."
                                value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => navigate('/invoices')}>Cancel</Button>
                <Button onClick={handleSubmit}>
                    <Printer size={16} />
                    {beneficiaryMode === 'multiple' && !bulkCombined && count > 1
                        ? `Generate ${count} Invoices`
                        : 'Generate Invoice'}
                </Button>
            </div>
        </div>
    );
};

export default InvoiceCreate;
