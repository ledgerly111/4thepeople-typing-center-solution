import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { getServices, MOCK_SERVICES } from '../services/mockData';
import { Plus, Tag, Edit, Trash2 } from 'lucide-react';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Immigration'
    });

    useEffect(() => {
        getServices().then((data) => {
            setServices(data);
            setLoading(false);
        });
    }, []);

    const openAddModal = () => {
        setEditingService(null);
        setFormData({ name: '', price: '', category: 'Immigration' });
        setIsModalOpen(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            price: service.price.toString(),
            category: service.category
        });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.price) {
            alert('Name and Price are required');
            return;
        }

        if (editingService) {
            setServices(services.map(s =>
                s.id === editingService.id
                    ? { ...s, ...formData, price: parseFloat(formData.price) }
                    : s
            ));
        } else {
            const newService = {
                id: Math.max(...services.map(s => s.id)) + 1,
                ...formData,
                price: parseFloat(formData.price)
            };
            setServices([...services, newService]);
        }

        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this service?')) {
            setServices(services.filter(s => s.id !== id));
        }
    };

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
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {services.map((service) => (
                        <Card key={service.id}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Tag size={14} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        {service.category}
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

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '0.75rem',
                                borderTop: '1px dashed var(--border)'
                            }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Fee:</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent)' }}>
                                    AED {service.price}
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
                    <label className="form-label">Price (AED) *</label>
                    <input
                        type="number"
                        className="input"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
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
            </Modal>
        </div>
    );
};

export default Services;
