import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { supabase } from '../services/supabase';
import { useStore } from '../contexts/StoreContext';
import { Plus, Tag, Edit, Trash2 } from 'lucide-react';

const Services = () => {
    const { refreshData } = useStore();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        serviceFee: '',
        govtFee: '',
        category: 'Immigration'
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading services:', error);
        } else {
            setServices(data || []);
        }
        setLoading(false);
    };

    const openAddModal = () => {
        setEditingService(null);
        setFormData({ name: '', serviceFee: '', govtFee: '', category: 'Immigration' });
        setIsModalOpen(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            serviceFee: service.service_fee?.toString() || '',
            govtFee: service.govt_fee?.toString() || '',
            category: service.category || 'Immigration'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.serviceFee || !formData.govtFee) {
            alert('Name, Service Fee, and Government Fee are required');
            return;
        }

        const serviceFee = parseFloat(formData.serviceFee);
        const govtFee = parseFloat(formData.govtFee);

        if (editingService) {
            // Update existing service
            const { error } = await supabase
                .from('services')
                .update({
                    name: formData.name,
                    service_fee: serviceFee,
                    govt_fee: govtFee,
                    category: formData.category
                })
                .eq('id', editingService.id);

            if (error) {
                console.error('Error updating service:', error);
                alert('Failed to update service');
                return;
            }

            setServices(services.map(s =>
                s.id === editingService.id
                    ? { ...s, name: formData.name, service_fee: serviceFee, govt_fee: govtFee, category: formData.category, total: serviceFee + govtFee }
                    : s
            ));
        } else {
            // Add new service
            const { data, error } = await supabase
                .from('services')
                .insert([{
                    name: formData.name,
                    service_fee: serviceFee,
                    govt_fee: govtFee,
                    category: formData.category
                }])
                .select()
                .single();

            if (error) {
                console.error('Error adding service:', error);
                alert('Failed to add service');
                return;
            }

            setServices([data, ...services]);
            refreshData(); // Sync with StoreContext so Quick Sale & Work Orders see it
        }

        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this service?')) {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting service:', error);
                alert('Failed to delete service');
                return;
            }

            setServices(services.filter(s => s.id !== id));
            refreshData(); // Sync with StoreContext
        }
    };

    // Calculate total price for display in modal
    const totalPrice = (parseFloat(formData.serviceFee) || 0) + (parseFloat(formData.govtFee) || 0);

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ margin: 0 }}>Services</h2>
                <Button onClick={openAddModal}>
                    <Plus size={16} /> Add Service
                </Button>
            </div>

            {/* Services Grid */}
            {loading ? (
                <Card>
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Loading...
                    </div>
                </Card>
            ) : services.length === 0 ? (
                <Card>
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No services yet. Click "Add Service" to create one.
                    </div>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {services.map((service) => (
                        <Card key={service.id}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Tag size={14} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        {service.category || 'General'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button className="btn-icon" onClick={() => openEditModal(service)}>
                                        <Edit size={14} />
                                    </button>
                                    <button className="btn-icon" onClick={() => handleDelete(service.id)} style={{ color: 'var(--danger)' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>{service.name}</h3>

                            {/* Fee Breakdown */}
                            <div style={{
                                backgroundColor: 'var(--bg-accent)',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                marginBottom: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Service Charge:</span>
                                    <span>AED {service.service_fee || 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Government Fee:</span>
                                    <span>AED {service.govt_fee || 0}</span>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '0.75rem',
                                borderTop: '1px dashed var(--border)'
                            }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total:</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent)' }}>
                                    AED {service.total || (parseFloat(service.service_fee || 0) + parseFloat(service.govt_fee || 0))}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingService ? 'Edit Service' : 'Add Service'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingService ? 'Save Changes' : 'Add Service'}</Button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Service Name *</label>
                    <input
                        type="text"
                        className="input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Emirates ID Renewal"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Category</label>
                    <Select
                        options={[
                            { value: 'Immigration', label: 'Immigration' },
                            { value: 'EID', label: 'Emirates ID' },
                            { value: 'Health', label: 'Health' },
                            { value: 'Traffic', label: 'Traffic' },
                            { value: 'Other', label: 'Other' }
                        ]}
                        value={formData.category}
                        onChange={(val) => setFormData({ ...formData, category: val })}
                        placeholder="Select category"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Service Charge (Your Fee) *</label>
                    <input
                        type="number"
                        className="input"
                        value={formData.serviceFee}
                        onChange={(e) => setFormData({ ...formData, serviceFee: e.target.value })}
                        placeholder="0"
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Your profit/markup for this service
                    </small>
                </div>

                <div className="form-group">
                    <label className="form-label">Government Fee *</label>
                    <input
                        type="number"
                        className="input"
                        value={formData.govtFee}
                        onChange={(e) => setFormData({ ...formData, govtFee: e.target.value })}
                        placeholder="0"
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Official government charges (pass-through)
                    </small>
                </div>

                {/* Total Price Display */}
                {(formData.serviceFee || formData.govtFee) && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: '700'
                    }}>
                        <span>Total Price:</span>
                        <span style={{ fontSize: '1.25rem' }}>AED {totalPrice.toFixed(2)}</span>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Services;
