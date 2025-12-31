import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { supabase } from '../services/supabase';
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

    const loadCustomers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading customers:', error);
        } else {
            setCustomers(data || []);
        }
        setLoading(false);
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile?.includes(searchTerm)
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

    const handleSubmit = async () => {
        if (!formData.name || !formData.mobile) {
            alert('Name and Mobile are required');
            return;
        }

        // Only send fields that exist in the database
        const customerData = {
            name: formData.name,
            mobile: formData.mobile,
            email: formData.email || null
        };

        if (editingCustomer) {
            // Update existing customer
            const { error } = await supabase
                .from('customers')
                .update(customerData)
                .eq('id', editingCustomer.id);

            if (error) {
                console.error('Error updating customer:', error);
                alert('Failed to update customer');
                return;
            }

            setCustomers(customers.map(c =>
                c.id === editingCustomer.id
                    ? { ...c, ...customerData }
                    : c
            ));
        } else {
            // Add new customer
            const { data, error } = await supabase
                .from('customers')
                .insert([customerData])
                .select()
                .single();

            if (error) {
                console.error('Error adding customer:', error);
                alert('Failed to add customer');
                return;
            }

            setCustomers([data, ...customers]);
        }

        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            const { error } = await supabase
                .from('customers')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting customer:', error);
                alert('Failed to delete customer');
                return;
            }

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
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input"
                        style={{ paddingLeft: '36px', width: '100%' }}
                    />
                </div>
            </Card>

            {/* Customers List */}
            <Card>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Loading customers...
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        {searchTerm ? 'No customers found matching your search' : 'No customers yet. Click "Add New" to create one.'}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Email</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td style={{ fontWeight: '500' }}>{customer.name}</td>
                                        <td>{customer.mobile}</td>
                                        <td>{customer.email || '-'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                <button className="btn-icon" onClick={() => openEditModal(customer)} title="Edit">
                                                    <Edit size={14} />
                                                </button>
                                                <button className="btn-icon" onClick={() => handleDelete(customer.id)} title="Delete" style={{ color: 'var(--danger)' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            >
                <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Customer name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Mobile *</label>
                    <input
                        type="tel"
                        className="input"
                        placeholder="050-1234567"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email (Optional)</label>
                    <input
                        type="email"
                        className="input"
                        placeholder="customer@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {editingCustomer ? 'Update' : 'Add Customer'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Customers;
