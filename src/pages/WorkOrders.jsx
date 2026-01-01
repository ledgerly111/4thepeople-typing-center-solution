import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import InvoicePreview from '../components/ui/InvoicePreview';
import SearchableSelect from '../components/ui/SearchableSelect';
import Select from '../components/ui/Select';
import { useStore } from '../contexts/StoreContext';
import { Plus, Edit, Trash2, FileText, CheckCircle, Clock, AlertCircle, Search, Filter, Receipt } from 'lucide-react';

const WorkOrders = () => {
    const navigate = useNavigate();
    const {
        workOrders,
        addWorkOrder,
        updateWorkOrder,
        updateWorkOrderStatus,
        deleteWorkOrder,
        addInvoice,
        customers,
        services
    } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
    const [generatedInvoice, setGeneratedInvoice] = useState(null);
    const [amountReceived, setAmountReceived] = useState('');
    const [paymentType, setPaymentType] = useState('Cash');
    const [hideGovtFee, setHideGovtFee] = useState(false);

    const [formData, setFormData] = useState({
        customerName: '',
        customerMobile: '',
        customerEmail: '',
        beneficiaryName: '',
        beneficiaryIdNumber: '',
        services: [],
        priority: 'Medium',
        dueDate: '',
        notes: ''
    });

    // Filter work orders
    const filteredOrders = workOrders
        .filter(wo => {
            const customerName = wo.customer_name || wo.customerName || '';
            const matchesSearch =
                customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                wo.id.toString().includes(searchTerm);
            const matchesStatus = statusFilter === 'All' || wo.status === statusFilter;
            const matchesPriority = priorityFilter === 'All' || wo.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        })
        .sort((a, b) => new Date(b.created_date || b.createdDate || b.created_at) - new Date(a.created_date || a.createdDate || a.created_at));

    const openAddModal = () => {
        setEditingOrder(null);
        setIsNewCustomer(false);
        setFormData({
            customerName: '',
            customerMobile: '',
            customerEmail: '',
            beneficiaryName: '',
            beneficiaryIdNumber: '',
            services: [],
            priority: 'Medium',
            dueDate: '',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (order) => {
        setEditingOrder(order);
        setFormData({
            customerName: order.customer_name || order.customerName || '',
            customerMobile: order.customer_mobile || order.customerMobile || '',
            customerEmail: order.customer_email || order.customerEmail || '',
            beneficiaryName: order.beneficiary_name || order.beneficiaryName || '',
            beneficiaryIdNumber: order.beneficiary_id_number || order.beneficiaryIdNumber || '',
            services: (order.services || []).map(s => s.id || services.find(ms => ms.name === s.name)?.id || ''),
            priority: order.priority || 'Medium',
            dueDate: order.due_date || order.dueDate || '',
            notes: order.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleAddService = () => {
        setFormData({ ...formData, services: [...formData.services, ''] });
    };

    const handleRemoveService = (index) => {
        setFormData({
            ...formData,
            services: formData.services.filter((_, i) => i !== index)
        });
    };

    const handleServiceChange = (index, serviceId) => {
        const newServices = [...formData.services];
        newServices[index] = serviceId;
        setFormData({ ...formData, services: newServices });
    };

    const handleSubmit = () => {
        if (!formData.customerName || !formData.customerMobile || formData.services.length === 0) {
            alert('Customer name, mobile, and at least one service are required');
            return;
        }

        const selectedServices = formData.services
            .filter(id => id)
            .map(id => {
                const service = (services || []).find(s => s.id === parseInt(id));
                return service ? {
                    name: service.name,
                    serviceFee: service.service_fee || service.serviceFee || 0,
                    govtFee: service.govt_fee || service.govtFee || 0,
                    price: service.total || (service.service_fee + service.govt_fee) || service.price || 0
                } : null;
            })
            .filter(s => s !== null);

        const totalServiceFee = selectedServices.reduce((sum, s) => sum + s.serviceFee, 0);
        const totalGovtFee = selectedServices.reduce((sum, s) => sum + s.govtFee, 0);
        const total = totalServiceFee + totalGovtFee;

        const workOrderData = {
            customer_name: formData.customerName,
            customer_mobile: formData.customerMobile,
            customer_email: formData.customerEmail,
            beneficiary_name: formData.beneficiaryName || null,
            beneficiary_id_number: formData.beneficiaryIdNumber || null,
            services: selectedServices,
            service_fee: totalServiceFee,
            govt_fee: totalGovtFee,
            total,
            priority: formData.priority,
            due_date: formData.dueDate || null,
            notes: formData.notes
        };

        if (editingOrder) {
            updateWorkOrder(editingOrder.id, workOrderData);
        } else {
            addWorkOrder(workOrderData);
        }

        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this work order?')) {
            deleteWorkOrder(id);
        }
    };

    const handleCustomerSelect = (customerId) => {
        const customer = customers.find(c => c.id === parseInt(customerId));
        if (customer) {
            setFormData({
                ...formData,
                customerName: customer.name,
                customerMobile: customer.mobile,
                customerEmail: customer.email
            });
        }
    };

    // Step 1: Open confirmation modal
    const handleReceiptClick = (order) => {
        if (order.status !== 'Completed') {
            return; // Button should be hidden anyway
        }

        // Check if invoice already generated
        if (order.invoiceId) {
            // Just show info, can't regenerate
            setSelectedOrderForInvoice(order);
            setShowConfirmModal(true);
            return;
        }

        setSelectedOrderForInvoice(order);
        setAmountReceived('');
        setShowConfirmModal(true);
    };

    // Handle Pay Now - open payment modal
    const handlePayNow = () => {
        setShowConfirmModal(false);
        setAmountReceived(selectedOrderForInvoice?.total?.toString() || '');
        setPaymentType('Cash');
        setShowPaymentModal(true);
    };

    // Handle Credit - create pending invoice
    const handleCreditInvoice = () => {
        if (!selectedOrderForInvoice) return;

        const order = selectedOrderForInvoice;
        const orderTotal = parseFloat(order.total) || 0;

        // Get values with fallbacks for snake_case/camelCase
        const customerName = order.customer_name || order.customerName || 'Walk-in Customer';
        const customerMobile = order.customer_mobile || order.customerMobile || '';
        const customerEmail = order.customer_email || order.customerEmail || '';
        const serviceFee = parseFloat(order.service_fee || order.serviceFee) || 0;
        const govtFee = parseFloat(order.govt_fee || order.govtFee) || 0;
        const beneficiaryName = order.beneficiary_name || order.beneficiaryName || '';
        const beneficiaryId = order.beneficiary_id_number || order.beneficiaryIdNumber || '';

        // Build items array from services if available
        let items = [];
        if (order.services && Array.isArray(order.services)) {
            items = order.services.map(s => ({
                name: s.name || s.serviceName || 'Service',
                serviceFee: parseFloat(s.service_fee || s.serviceFee) || 0,
                govtFee: parseFloat(s.govt_fee || s.govtFee) || 0,
                price: parseFloat(s.total || s.price) || parseFloat(s.service_fee || s.serviceFee || 0) + parseFloat(s.govt_fee || s.govtFee || 0)
            }));
        } else {
            items = [{
                name: 'Services',
                serviceFee: serviceFee,
                govtFee: govtFee,
                price: orderTotal
            }];
        }

        // Create PENDING invoice (Credit) with snake_case for database
        const newInvoice = addInvoice({
            customer_name: customerName,
            customer_mobile: customerMobile,
            customer_email: customerEmail,
            beneficiary_name: beneficiaryName,
            beneficiary_id_number: beneficiaryId,
            items: items,
            service_fee: serviceFee,
            govt_fee: govtFee,
            total: orderTotal,
            status: 'Pending',
            payment_type: 'Credit',
            amount_received: 0,
            change: 0,
            work_order_id: order.id
        });

        // Link invoice to work order
        updateWorkOrder(order.id, {
            invoice_id: newInvoice.id,
            invoiceId: newInvoice.id
        });

        // Show preview
        setGeneratedInvoice(newInvoice);
        setShowConfirmModal(false);
        setShowInvoicePreview(true);
    };

    // Handle Cash Payment - create paid invoice
    const handleCashPayment = () => {
        if (!selectedOrderForInvoice) return;

        const order = selectedOrderForInvoice;
        const received = parseFloat(amountReceived) || 0;
        const orderTotal = parseFloat(order.total) || 0;
        const change = Math.max(0, received - orderTotal);

        if (received < orderTotal) {
            alert(`Amount received (AED ${received}) is less than total (AED ${orderTotal})`);
            return;
        }

        // Get values with fallbacks for snake_case/camelCase
        const customerName = order.customer_name || order.customerName || 'Walk-in Customer';
        const customerMobile = order.customer_mobile || order.customerMobile || '';
        const customerEmail = order.customer_email || order.customerEmail || '';
        const serviceFee = parseFloat(order.service_fee || order.serviceFee) || 0;
        const govtFee = parseFloat(order.govt_fee || order.govtFee) || 0;
        const beneficiaryName = order.beneficiary_name || order.beneficiaryName || '';
        const beneficiaryId = order.beneficiary_id_number || order.beneficiaryIdNumber || '';

        // Build items array from services if available
        let items = [];
        if (order.services && Array.isArray(order.services)) {
            items = order.services.map(s => ({
                name: s.name || s.serviceName || 'Service',
                serviceFee: parseFloat(s.service_fee || s.serviceFee) || 0,
                govtFee: parseFloat(s.govt_fee || s.govtFee) || 0,
                price: parseFloat(s.total || s.price) || parseFloat(s.service_fee || s.serviceFee || 0) + parseFloat(s.govt_fee || s.govtFee || 0)
            }));
        } else {
            // Fallback: create single item from order totals
            items = [{
                name: 'Services',
                serviceFee: serviceFee,
                govtFee: govtFee,
                price: orderTotal
            }];
        }

        // Create PAID invoice (Cash) with snake_case for database
        const newInvoice = addInvoice({
            customer_name: customerName,
            customer_mobile: customerMobile,
            customer_email: customerEmail,
            beneficiary_name: beneficiaryName,
            beneficiary_id_number: beneficiaryId,
            items: items,
            service_fee: serviceFee,
            govt_fee: govtFee,
            total: orderTotal,
            status: 'Paid',
            payment_type: paymentType,
            amount_received: received,
            change: change,
            work_order_id: order.id
        });

        // Link invoice to work order
        updateWorkOrder(order.id, {
            invoice_id: newInvoice.id,
            invoiceId: newInvoice.id
        });

        // Show preview
        setGeneratedInvoice(newInvoice);
        setShowPaymentModal(false);
        setShowInvoicePreview(true);
    };

    // Status badge helper
    const getStatusBadge = (status) => {
        const statusMap = {
            'Pending': { color: 'var(--warning)', bg: 'rgba(255, 193, 7, 0.1)', icon: Clock },
            'In Progress': { color: 'var(--info)', bg: 'rgba(13, 110, 253, 0.1)', icon: AlertCircle },
            'Waiting Docs': { color: 'var(--danger)', bg: 'rgba(220, 53, 69, 0.1)', icon: FileText },
            'Completed': { color: 'var(--success)', bg: 'rgba(25, 135, 84, 0.1)', icon: CheckCircle }
        };

        const config = statusMap[status] || statusMap['Pending'];
        const Icon = config.icon;

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: config.color,
                backgroundColor: config.bg
            }}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    // Priority badge helper
    const getPriorityBadge = (priority) => {
        const priorityColors = {
            'Urgent': 'var(--danger)',
            'High': 'var(--warning)',
            'Medium': 'var(--info)',
            'Low': 'var(--success)'
        };

        return (
            <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: priorityColors[priority],
                color: 'white'
            }}>
                {priority}
            </span>
        );
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Check if overdue
    const isOverdue = (dueDate, status) => {
        if (status === 'Completed' || !dueDate) return false;
        const today = new Date().toISOString().split('T')[0];
        return dueDate < today;
    };

    const customerOptions = (customers || []).map(c => ({
        id: c.id,
        name: `${c.name} (${c.mobile})`
    }));

    const serviceOptions = (services || []).map(s => ({
        id: s.id,
        name: `${s.name} - AED ${s.total || (parseFloat(s.service_fee || 0) + parseFloat(s.govt_fee || 0))}`
    }));

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ margin: 0 }}>Work Orders</h2>
                <Button onClick={openAddModal}>
                    <Plus size={16} /> New Work Order
                </Button>
            </div>

            {/* Filters */}
            <Card style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search by customer or work order #..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <div style={{ minWidth: '140px' }}>
                        <Select
                            options={[
                                { value: 'All', label: 'All Status' },
                                { value: 'Pending', label: 'Pending' },
                                { value: 'In Progress', label: 'In Progress' },
                                { value: 'Waiting Docs', label: 'Waiting Docs' },
                                { value: 'Completed', label: 'Completed' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            placeholder="Status"
                        />
                    </div>
                    <div style={{ minWidth: '140px' }}>
                        <Select
                            options={[
                                { value: 'All', label: 'All Priority' },
                                { value: 'Urgent', label: 'Urgent' },
                                { value: 'High', label: 'High' },
                                { value: 'Medium', label: 'Medium' },
                                { value: 'Low', label: 'Low' }
                            ]}
                            value={priorityFilter}
                            onChange={setPriorityFilter}
                            placeholder="Priority"
                        />
                    </div>
                </div>
            </Card>

            {/* Work Orders Table */}
            <Card>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>WO #</th>
                                <th>Customer</th>
                                <th>Services</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Due Date</th>
                                <th style={{ textAlign: 'right' }}>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} style={{ backgroundColor: isOverdue(order.dueDate, order.status) ? 'rgba(220, 53, 69, 0.05)' : 'transparent' }}>
                                        <td style={{ fontWeight: '600' }}>#{order.id}</td>
                                        <td>
                                            <div>{order.customerName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerMobile}</div>
                                        </td>
                                        <td>
                                            {order.services.slice(0, 2).map((s, i) => (
                                                <div key={i} style={{ fontSize: '0.875rem' }}>{s.name}</div>
                                            ))}
                                            {order.services.length > 2 && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    +{order.services.length - 2} more
                                                </div>
                                            )}
                                        </td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td>{getPriorityBadge(order.priority)}</td>
                                        <td>
                                            <div>{formatDate(order.dueDate)}</div>
                                            {isOverdue(order.dueDate, order.status) && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600' }}>
                                                    Overdue!
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: '600' }}>AED {order.total}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <button className="btn-icon" onClick={() => openEditModal(order)} title="Edit">
                                                    <Edit size={14} />
                                                </button>
                                                {order.status === 'Completed' && (
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => handleReceiptClick(order)}
                                                        title={(order.invoice_id || order.invoiceId) ? `View Invoice #${order.invoice_id || order.invoiceId}` : 'Generate Invoice'}
                                                        style={{
                                                            color: (order.invoice_id || order.invoiceId) ? 'var(--success)' : 'var(--accent)'
                                                        }}
                                                    >
                                                        <Receipt size={14} />
                                                    </button>
                                                )}
                                                {order.status !== 'Completed' && (
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => updateWorkOrderStatus(order.id, 'Completed')}
                                                        title="Mark as Completed"
                                                        style={{ color: 'var(--success)' }}
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleDelete(order.id)}
                                                    title="Delete"
                                                    style={{ color: 'var(--danger)' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No work orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingOrder ? 'Edit Work Order' : 'New Work Order'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingOrder ? 'Save Changes' : 'Create Work Order'}</Button>
                    </>
                }
            >
                {/* Customer Selection or New Customer */}
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-accent)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label className="form-label" style={{ margin: 0 }}>Customer Information</label>
                        <button
                            type="button"
                            onClick={() => {
                                setIsNewCustomer(!isNewCustomer);
                                if (!isNewCustomer) {
                                    setFormData({ ...formData, customerName: '', customerMobile: '', customerEmail: '' });
                                }
                            }}
                            style={{
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.75rem',
                                background: 'var(--accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                opacity: isNewCustomer ? 1 : 0.85
                            }}
                        >
                            {isNewCustomer ? '← Select Existing' : '+ New Customer'}
                        </button>
                    </div>

                    {!isNewCustomer ? (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <SearchableSelect
                                options={customerOptions}
                                value={formData.customerName ? customers.find(c => c.name === formData.customerName)?.id.toString() : ''}
                                onChange={handleCustomerSelect}
                                placeholder="Search customer..."
                                displayKey="name"
                                valueKey="id"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label className="form-label">Customer Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile Number *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.customerMobile}
                                    onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                                    placeholder="050-1234567"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Email (Optional)</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    placeholder="customer@example.com"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Beneficiary Section */}
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    background: 'var(--bg-accent)',
                    borderRadius: '8px',
                    border: '1px dashed var(--border)'
                }}>
                    <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                        👤 Beneficiary (Person receiving service - optional)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input
                            type="text"
                            className="input"
                            placeholder="Name (e.g., Ahmed Hassan)"
                            value={formData.beneficiaryName}
                            onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                        />
                        <input
                            type="text"
                            className="input"
                            placeholder="ID/Passport (optional)"
                            value={formData.beneficiaryIdNumber}
                            onChange={(e) => setFormData({ ...formData, beneficiaryIdNumber: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Services *</label>
                    {formData.services.map((serviceId, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <SearchableSelect
                                    options={serviceOptions}
                                    value={serviceId}
                                    onChange={(val) => handleServiceChange(index, val)}
                                    placeholder="Search service..."
                                    displayKey="name"
                                    valueKey="id"
                                />
                            </div>
                            <button
                                className="btn-icon"
                                onClick={() => handleRemoveService(index)}
                                style={{ color: 'var(--danger)' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <Button variant="secondary" onClick={handleAddService} style={{ width: '100%' }}>
                        <Plus size={16} /> Add Service
                    </Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <Select
                            options={[
                                { value: 'Low', label: 'Low' },
                                { value: 'Medium', label: 'Medium' },
                                { value: 'High', label: 'High' },
                                { value: 'Urgent', label: 'Urgent' }
                            ]}
                            value={formData.priority}
                            onChange={(val) => setFormData({ ...formData, priority: val })}
                            placeholder="Select priority"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Due Date</label>
                        <input
                            type="date"
                            className="input"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                        className="input"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Special instructions or notes..."
                        rows={3}
                    />
                </div>
            </Modal>

            {/* Confirmation Modal - Generate Invoice */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setSelectedOrderForInvoice(null);
                }}
                title={selectedOrderForInvoice?.invoiceId ? "📄 Invoice Already Exists" : "📝 Generate Invoice?"}
            >
                {selectedOrderForInvoice && (
                    <div style={{ padding: '0.5rem' }}>
                        {selectedOrderForInvoice.invoiceId ? (
                            // Invoice already exists
                            <>
                                <p style={{ marginBottom: '1rem' }}>
                                    Invoice <strong>#{selectedOrderForInvoice.invoiceId}</strong> has already been created for this work order.
                                </p>
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--bg-accent)',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>Customer:</strong> {selectedOrderForInvoice.customerName}
                                    </div>
                                    <div>
                                        <strong>Total:</strong> AED {selectedOrderForInvoice.total}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                                        Close
                                    </Button>
                                    <Button onClick={() => {
                                        setShowConfirmModal(false);
                                        navigate('/invoices');
                                    }}>
                                        Go to Invoices
                                    </Button>
                                </div>
                            </>
                        ) : (
                            // New invoice generation
                            <>
                                <p style={{ marginBottom: '1rem' }}>
                                    Work order <strong>#{selectedOrderForInvoice.id}</strong> is complete. Would you like to generate an invoice for this customer?
                                </p>
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--bg-accent)',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>Customer:</strong> {selectedOrderForInvoice.customerName}
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>Mobile:</strong> {selectedOrderForInvoice.customerMobile}
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>Services:</strong> {selectedOrderForInvoice.services?.length || 0} item(s)
                                    </div>
                                    <div style={{
                                        marginTop: '0.75rem',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid var(--border)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span>Service Charge:</span>
                                            <span>AED {selectedOrderForInvoice.serviceFee}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span>Government Fee:</span>
                                            <span>AED {selectedOrderForInvoice.govtFee}</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontWeight: '700',
                                            fontSize: '1.1rem',
                                            marginTop: '0.5rem',
                                            paddingTop: '0.5rem',
                                            borderTop: '1px dashed var(--border)'
                                        }}>
                                            <span>Total:</span>
                                            <span style={{ color: 'var(--accent)' }}>AED {selectedOrderForInvoice.total}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Options */}
                                <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                                    How will the customer pay?
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={handlePayNow}
                                        style={{
                                            flex: 1,
                                            minWidth: '140px',
                                            padding: '1rem',
                                            background: 'var(--success)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>💵</div>
                                        <div>Pay Now</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: '400', marginTop: '0.25rem' }}>
                                            Cash / Card - Immediate payment
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleCreditInvoice}
                                        style={{
                                            flex: 1,
                                            minWidth: '140px',
                                            padding: '1rem',
                                            background: 'var(--warning)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>📋</div>
                                        <div>Credit</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: '400', marginTop: '0.25rem' }}>
                                            Pay later - Track pending
                                        </div>
                                    </button>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Payment Modal - Pay Now */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="💵 Collect Payment"
            >
                {selectedOrderForInvoice && (
                    <div style={{ padding: '0.5rem' }}>
                        <div style={{
                            padding: '1rem',
                            background: 'var(--bg-accent)',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Customer:</strong> {selectedOrderForInvoice.customerName}
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontWeight: '700',
                                fontSize: '1.25rem',
                                marginTop: '0.5rem',
                                paddingTop: '0.5rem',
                                borderTop: '1px solid var(--border)'
                            }}>
                                <span>Total Due:</span>
                                <span style={{ color: 'var(--accent)' }}>AED {selectedOrderForInvoice.total}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Payment Method</label>
                            <Select
                                options={[
                                    { value: 'Cash', label: 'Cash' },
                                    { value: 'Card', label: 'Card' },
                                    { value: 'Bank Transfer', label: 'Bank Transfer' }
                                ]}
                                value={paymentType}
                                onChange={setPaymentType}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Amount Received (AED)</label>
                            <input
                                type="number"
                                className="input"
                                value={amountReceived}
                                onChange={(e) => setAmountReceived(e.target.value)}
                                placeholder="Enter amount"
                                style={{ fontSize: '1.25rem', fontWeight: '600', textAlign: 'right' }}
                            />
                        </div>

                        {parseFloat(amountReceived) >= selectedOrderForInvoice.total && (
                            <div style={{
                                padding: '0.75rem',
                                background: 'var(--success)',
                                color: 'white',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontWeight: '600'
                            }}>
                                <span>Change to Return:</span>
                                <span>AED {(parseFloat(amountReceived) - selectedOrderForInvoice.total).toFixed(2)}</span>
                            </div>
                        )}

                        {parseFloat(amountReceived) > 0 && parseFloat(amountReceived) < selectedOrderForInvoice.total && (
                            <div style={{
                                padding: '0.75rem',
                                background: 'var(--danger)',
                                color: 'white',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontWeight: '600'
                            }}>
                                ⚠️ Amount is less than total by AED {(selectedOrderForInvoice.total - parseFloat(amountReceived)).toFixed(2)}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => {
                                setShowPaymentModal(false);
                                setShowConfirmModal(true);
                            }}>
                                Back
                            </Button>
                            <Button
                                onClick={handleCashPayment}
                                disabled={parseFloat(amountReceived) < selectedOrderForInvoice.total}
                            >
                                Complete Payment & Print
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Invoice Preview Modal */}
            {showInvoicePreview && generatedInvoice && (
                <>
                    {/* Hide Govt Fee Toggle */}
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
                            id="hideGovtFeeWO"
                            checked={hideGovtFee}
                            onChange={(e) => setHideGovtFee(e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <label htmlFor="hideGovtFeeWO" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                            Hide Govt Fees
                        </label>
                    </div>
                    <InvoicePreview
                        invoice={generatedInvoice}
                        onClose={() => {
                            setShowInvoicePreview(false);
                            setGeneratedInvoice(null);
                            setSelectedOrderForInvoice(null);
                            setHideGovtFee(false);
                        }}
                        hideGovtFee={hideGovtFee}
                    />
                </>
            )}
        </div>
    );
};

export default WorkOrders;


