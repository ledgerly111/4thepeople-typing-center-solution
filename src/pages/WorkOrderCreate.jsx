import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import SearchableSelect from '../components/ui/SearchableSelect';
import { useStore } from '../contexts/StoreContext';
import { ArrowLeft, Plus, Trash2, User, UserPlus, Save, CreditCard, FileText, Users, Building, Hash } from 'lucide-react';

const WorkOrderCreate = () => {
    const navigate = useNavigate();
    const {
        customers,
        services,
        addCustomer,
        addWorkOrder,
        govtFeeCards,
        fetchGovtFeeCards
    } = useStore();

    // Customer Mode: 'existing' or 'new'
    const [customerMode, setCustomerMode] = useState('existing');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');

    // New Customer Fields (only name & mobile required)
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        mobile: ''
    });

    // Sponsor (for visa/company services)
    const [hasSponsor, setHasSponsor] = useState(false);
    const [sponsor, setSponsor] = useState({
        name: '',
        type: 'Company', // Company, Individual, Family
        id: '', // License number or Emirates ID
        contact: ''
    });

    // Beneficiary Mode: 'single' or 'multiple'
    const [beneficiaryMode, setBeneficiaryMode] = useState('single');
    const [sameAsCustomer, setSameAsCustomer] = useState(true);

    // Single beneficiary
    const [beneficiary, setBeneficiary] = useState({
        name: '',
        id_number: '',
        passport: '',
        nationality: ''
    });

    // Multiple beneficiaries (bulk input)
    const [bulkBeneficiaries, setBulkBeneficiaries] = useState('');



    // Services
    const [selectedServices, setSelectedServices] = useState([]);

    // Reference/Tracking
    const [referenceNumber, setReferenceNumber] = useState('');
    const [portalType, setPortalType] = useState('');

    // Work Order Details
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');

    // Card Selection
    const [selectedCardId, setSelectedCardId] = useState('');

    useEffect(() => {
        fetchGovtFeeCards();
    }, []);



    // Customer options for dropdown
    const customerOptions = (customers || []).map(c => ({
        id: c.id,
        name: `${c.name} (${c.mobile})`
    }));

    // Service options
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
                return {
                    name: parts[0] || '',
                    id_number: parts[1] || '',
                    passport: parts[2] || '',
                    nationality: parts[3] || ''
                };
            });
    };

    const beneficiaryList = beneficiaryMode === 'multiple' ? parseBulkBeneficiaries() : [];

    // Calculate totals
    const calculateTotals = () => {
        let serviceFee = 0;
        let govtFee = 0;

        selectedServices.forEach(serviceId => {
            const service = services.find(s => s.id === parseInt(serviceId));
            if (service) {
                serviceFee += parseFloat(service.service_fee || 0);
                govtFee += parseFloat(service.govt_fee || 0);
            }
        });

        const multiplier = beneficiaryMode === 'multiple' ? Math.max(1, beneficiaryList.length) : 1;

        return {
            serviceFee: serviceFee * multiplier,
            govtFee: govtFee * multiplier,
            total: (serviceFee + govtFee) * multiplier,
            perPerson: serviceFee + govtFee,
            count: multiplier
        };
    };

    const { serviceFee, govtFee, total, perPerson, count } = calculateTotals();

    // Add/Update/Remove service
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

        let customerData;

        // If new customer, save to database first
        if (customerMode === 'new') {
            const savedCustomer = await addCustomer({
                name: newCustomer.name,
                mobile: newCustomer.mobile
            });

            if (!savedCustomer) {
                alert('Failed to create customer');
                return;
            }

            customerData = savedCustomer;
        } else {
            customerData = customers.find(c => c.id === parseInt(selectedCustomerId));
        }

        // Build services array
        const serviceDetails = selectedServices.map(serviceId => {
            const service = services.find(s => s.id === parseInt(serviceId));
            return {
                id: service?.id,
                name: service?.name,
                category: service?.category,
                service_fee: service?.service_fee,
                govt_fee: service?.govt_fee,
                total: parseFloat(service?.service_fee || 0) + parseFloat(service?.govt_fee || 0)
            };
        });

        // Base work order data
        const baseWorkOrder = {
            customer_id: customerData.id,
            customer_name: customerData.name,
            customer_mobile: customerData.mobile,
            customer_email: customerData.email || '',
            // Sponsor
            sponsor_name: hasSponsor ? sponsor.name : null,
            sponsor_type: hasSponsor ? sponsor.type : null,
            sponsor_id: hasSponsor ? sponsor.id : null,
            sponsor_contact: hasSponsor ? sponsor.contact : null,
            // Reference
            reference_number: referenceNumber || null,
            portal_type: portalType || null,
            // Services
            services: serviceDetails,
            service_fee: serviceDetails.reduce((sum, s) => sum + parseFloat(s.service_fee || 0), 0),
            govt_fee: serviceDetails.reduce((sum, s) => sum + parseFloat(s.govt_fee || 0), 0),
            total: serviceDetails.reduce((sum, s) => sum + parseFloat(s.total || 0), 0),
            // Details
            priority: priority,
            due_date: dueDate || null,
            notes: notes,
            status: 'Pending',
            govt_fee_card_id: selectedCardId ? parseInt(selectedCardId) : null
        };

        // Handle beneficiaries
        if (beneficiaryMode === 'multiple' && beneficiaryList.length > 1) {
            // Create multiple work orders
            for (const ben of beneficiaryList) {
                await addWorkOrder({
                    ...baseWorkOrder,
                    beneficiary_name: ben.name,
                    beneficiary_id_number: ben.id_number,
                    beneficiary_passport: ben.passport,
                    beneficiary_nationality: ben.nationality
                });
            }
            navigate('/work-orders');
        } else {
            // Single work order
            const beneficiaryData = sameAsCustomer ? {
                name: customerData.name,
                id_number: '',
                passport: '',
                nationality: ''
            } : (beneficiaryMode === 'multiple' && beneficiaryList.length === 1 ? beneficiaryList[0] : beneficiary);

            const result = await addWorkOrder({
                ...baseWorkOrder,
                beneficiary_name: beneficiaryData.name,
                beneficiary_id_number: beneficiaryData.id_number,
                beneficiary_passport: beneficiaryData.passport,
                beneficiary_nationality: beneficiaryData.nationality
            });

            if (result && result.success) {
                navigate('/work-orders');
            } else {
                alert(`Failed to create work order: ${result?.error || 'Unknown error'}\n\nTIP: Did you run the SQL migration script for the new columns?`);
            }
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => navigate('/work-orders')}
                    style={{
                        background: 'var(--bg-card)',
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
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Create Work Order</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Create a new service request
                    </p>
                </div>
            </div>

            {/* Customer Section */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <User size={20} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ margin: 0 }}>Customer (Who is paying)</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button
                            onClick={() => setCustomerMode('existing')}
                            style={{
                                flex: 1, padding: '0.75rem',
                                background: customerMode === 'existing' ? 'var(--accent)' : 'var(--bg-accent)',
                                color: customerMode === 'existing' ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border)', borderRadius: '8px',
                                cursor: 'pointer', fontWeight: '500',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <User size={16} /> Existing
                        </button>
                        <button
                            onClick={() => setCustomerMode('new')}
                            style={{
                                flex: 1, padding: '0.75rem',
                                background: customerMode === 'new' ? 'var(--success)' : 'var(--bg-accent)',
                                color: customerMode === 'new' ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border)', borderRadius: '8px',
                                cursor: 'pointer', fontWeight: '500',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <UserPlus size={16} /> New
                        </button>
                    </div>

                    {customerMode === 'existing' && (
                        <SearchableSelect
                            options={customerOptions}
                            value={selectedCustomerId}
                            onChange={setSelectedCustomerId}
                            placeholder="Search customer..."
                            displayKey="name"
                            valueKey="id"
                        />
                    )}

                    {customerMode === 'new' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input
                                type="text" className="input" placeholder="Customer Name *"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            />
                            <input
                                type="tel" className="input" placeholder="Mobile *"
                                value={newCustomer.mobile}
                                onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                            />
                        </div>
                    )}
                </div>
            </Card>

            {/* Sponsor Section (Optional) */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building size={20} style={{ color: 'var(--accent)' }} />
                            <h3 style={{ margin: 0 }}>Sponsor (for visa/company services)</h3>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input
                                type="checkbox"
                                checked={hasSponsor}
                                onChange={(e) => setHasSponsor(e.target.checked)}
                            />
                            Has Sponsor
                        </label>
                    </div>

                    {!hasSponsor && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                            ℹ️ Enable if this is a visa, labor card, or company-related service
                        </p>
                    )}

                    {hasSponsor && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Sponsor Type</label>
                                <Select
                                    options={[
                                        { value: 'Company', label: 'Company' },
                                        { value: 'Individual', label: 'Individual' },
                                        { value: 'Family', label: 'Family Member' }
                                    ]}
                                    value={sponsor.type}
                                    onChange={(val) => setSponsor({ ...sponsor, type: val })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sponsor Name</label>
                                <input
                                    type="text" className="input" placeholder="Company/Person name"
                                    value={sponsor.name}
                                    onChange={(e) => setSponsor({ ...sponsor, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">License/ID Number</label>
                                <input
                                    type="text" className="input" placeholder="Trade License or EID"
                                    value={sponsor.id}
                                    onChange={(e) => setSponsor({ ...sponsor, id: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contact (optional)</label>
                                <input
                                    type="text" className="input" placeholder="Phone number"
                                    value={sponsor.contact}
                                    onChange={(e) => setSponsor({ ...sponsor, contact: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Beneficiary Section */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Users size={20} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ margin: 0 }}>Beneficiary (Who receives service)</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button
                            onClick={() => { setBeneficiaryMode('single'); setSameAsCustomer(true); }}
                            style={{
                                flex: 1, padding: '0.75rem', fontSize: '0.875rem',
                                background: beneficiaryMode === 'single' && sameAsCustomer ? 'var(--accent)' : 'var(--bg-accent)',
                                color: beneficiaryMode === 'single' && sameAsCustomer ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
                            }}
                        >
                            Same as Customer
                        </button>
                        <button
                            onClick={() => { setBeneficiaryMode('single'); setSameAsCustomer(false); }}
                            style={{
                                flex: 1, padding: '0.75rem', fontSize: '0.875rem',
                                background: beneficiaryMode === 'single' && !sameAsCustomer ? 'var(--accent)' : 'var(--bg-accent)',
                                color: beneficiaryMode === 'single' && !sameAsCustomer ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
                            }}
                        >
                            Different
                        </button>
                        <button
                            onClick={() => { setBeneficiaryMode('multiple'); setSameAsCustomer(false); }}
                            style={{
                                flex: 1, padding: '0.75rem', fontSize: '0.875rem',
                                background: beneficiaryMode === 'multiple' ? 'var(--success)' : 'var(--bg-accent)',
                                color: beneficiaryMode === 'multiple' ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
                            }}
                        >
                            Multiple (Bulk)
                        </button>
                    </div>

                    {beneficiaryMode === 'single' && sameAsCustomer && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                            ✓ Beneficiary = Customer
                        </p>
                    )}

                    {beneficiaryMode === 'single' && !sameAsCustomer && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                            <input type="text" className="input" placeholder="Name *"
                                value={beneficiary.name}
                                onChange={(e) => setBeneficiary({ ...beneficiary, name: e.target.value })} />
                            <input type="text" className="input" placeholder="Emirates ID"
                                value={beneficiary.id_number}
                                onChange={(e) => setBeneficiary({ ...beneficiary, id_number: e.target.value })} />
                            <input type="text" className="input" placeholder="Passport"
                                value={beneficiary.passport}
                                onChange={(e) => setBeneficiary({ ...beneficiary, passport: e.target.value })} />
                            <input type="text" className="input" placeholder="Nationality"
                                value={beneficiary.nationality}
                                onChange={(e) => setBeneficiary({ ...beneficiary, nationality: e.target.value })} />
                        </div>
                    )}

                    {beneficiaryMode === 'multiple' && (
                        <div className="form-group">
                            <label className="form-label">
                                Enter one beneficiary per line: Name, Emirates ID, Passport, Nationality
                            </label>
                            <textarea
                                className="input" rows={5}
                                placeholder={`Ahmed Hassan, 784-1234-5678901-2, A12345678, Indian\nMohammad Ali, 784-5678-9012345-6, B87654321, Pakistani\nFatima Khan`}
                                value={bulkBeneficiaries}
                                onChange={(e) => setBulkBeneficiaries(e.target.value)}
                                style={{ fontFamily: 'monospace' }}
                            />
                            {beneficiaryList.length > 0 && (
                                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-accent)', borderRadius: '6px', fontSize: '0.875rem' }}>
                                    👥 <strong>{beneficiaryList.length}</strong> beneficiaries → Creates {beneficiaryList.length} work orders
                                </div>
                            )}
                        </div>
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
                                <SearchableSelect
                                    options={serviceOptions}
                                    value={serviceId}
                                    onChange={(val) => updateService(index, val)}
                                    placeholder="Search service..."
                                    displayKey="name"
                                    valueKey="id"
                                />
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
                            {beneficiaryMode === 'multiple' && count > 1 && (
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

            {/* Reference & Details */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Hash size={20} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ margin: 0 }}>Reference & Details</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Portal</label>
                            <Select
                                options={[
                                    { value: '', label: 'Select portal' },
                                    { value: 'ICP', label: 'ICP (eChannels)' },
                                    { value: 'MOHRE', label: 'MOHRE (Tasheel)' },
                                    { value: 'GDRFA', label: 'GDRFA (Amer)' },
                                    { value: 'DED', label: 'DED' },
                                    { value: 'Other', label: 'Other' }
                                ]}
                                value={portalType}
                                onChange={setPortalType}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Reference/Application #</label>
                            <input type="text" className="input" placeholder="Optional"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <Select
                                options={[
                                    { value: 'Low', label: 'Low' },
                                    { value: 'Medium', label: 'Medium' },
                                    { value: 'High', label: 'High' },
                                    { value: 'Urgent', label: 'Urgent' }
                                ]}
                                value={priority}
                                onChange={setPriority}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Due Date</label>
                            <input type="date" className="input" value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)} />
                        </div>
                        {govtFee > 0 && (
                            <div className="form-group">
                                <label className="form-label"><CreditCard size={14} /> Govt Fee Card</label>
                                <Select
                                    options={[
                                        { value: '', label: 'Select during payment' },
                                        ...govtFeeCards.filter(c => c.status === 'Active').map(c => ({
                                            value: c.id.toString(),
                                            label: `${c.card_name} - AED ${parseFloat(c.balance || 0).toFixed(2)}`
                                        }))
                                    ]}
                                    value={selectedCardId}
                                    onChange={setSelectedCardId}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Notes</label>
                        <textarea className="input" rows={2} placeholder="Special instructions..."
                            value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                </div>
            </Card>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => navigate('/work-orders')}>Cancel</Button>
                <Button onClick={handleSubmit}>
                    <Save size={16} />
                    {beneficiaryMode === 'multiple' && count > 1 ? `Create ${count} Work Orders` : 'Create Work Order'}
                </Button>
            </div>
        </div>
    );
};

export default WorkOrderCreate;
