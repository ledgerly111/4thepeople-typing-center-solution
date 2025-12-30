import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { getCustomers, MOCK_CUSTOMERS } from '../services/mockData';
import { Search, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        type: 'Individual'
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = () => {
        setLoading(true);
        getCustomers().then((data) => {
            setCustomers(data);
            setLoading(false);
        });
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile.includes(searchTerm)
    );

    const openAddModal = () => {
        setEditingCustomer(null);
        setFormData({ name: '', mobile: '', email: '', type: 'Individual' });
        setIsModalOpen(true);
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            mobile: customer.mobile,
            email: customer.email,
            type: customer.type
        });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.mobile) {
            alert('Name and Mobile are required');
            return;
        }

        if (editingCustomer) {
            // Update existing customer
            setCustomers(customers.map(c =>
                c.id === editingCustomer.id
                    ? { ...c, ...formData }
                    : c
            ));
        } else {
            // Add new customer
            const newCustomer = {
                id: Math.max(...customers.map(c => c.id)) + 1,
                ...formData,
                status: 'Active'
            };
            setCustomers([...customers, newCustomer]);
        }

        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            setCustomers(customers.filter(c => c.id !== id));
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ margin: 0 }}>Customers</h2>
                <Button onClick={openAddModal}>
                    <Plus size={16} /> Add New
                </Button>
            </div>

            {/* Search */}
            <Card style={{ marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search by name or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
            </Card>

            {/* Customer List */}
            <Card>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Loading...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer.id}>
                                            <td>
                                                <div style={{ fontWeight: '600' }}>{customer.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{customer.email}</div>
                                            </td>
                                            <td style={{ fontFamily: 'monospace' }}>{customer.mobile}</td>
                                            <td>
                                                <span className={`badge ${customer.type === 'Corporate' ? 'badge-warning' : 'badge-success'}`}>
                                                    {customer.type}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ color: customer.status === 'Active' ? 'var(--success)' : 'var(--danger)' }}>
                                                    {customer.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <button className="btn-icon" onClick={() => openEditModal(customer)}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="btn-icon" onClick={() => handleDelete(customer.id)} style={{ color: 'var(--danger)' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No customers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingCustomer ? 'Save Changes' : 'Add Customer'}</Button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                        type="text"
                        className="input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter customer name"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Mobile *</label>
                    <input
                        type="text"
                        className="input"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="050-1234567"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Type</label>
                    <Select
                        options={[
                            { value: 'Individual', label: 'Individual' },
                            { value: 'Corporate', label: 'Corporate' }
                        ]}
                        value={formData.type}
                        onChange={(val) => setFormData({ ...formData, type: val })}
                        placeholder="Select type"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Customers;
