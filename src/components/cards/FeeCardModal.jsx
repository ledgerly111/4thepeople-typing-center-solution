import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const FeeCardModal = ({ isOpen, onClose, onSave, card = null }) => {
    const [formData, setFormData] = useState({
        cardName: '',
        initialBalance: 0,
        cardType: 'ICP Portal',
        status: 'Active',
        notes: ''
    });

    useEffect(() => {
        if (card) {
            setFormData({
                cardName: card.card_name || card.cardName || '',
                initialBalance: card.balance || 0,
                cardType: card.card_type || card.cardType || 'ICP Portal',
                status: card.status || 'Active',
                notes: card.notes || ''
            });
        } else {
            setFormData({
                cardName: '',
                initialBalance: 0,
                cardType: 'ICP Portal',
                status: 'Active',
                notes: ''
            });
        }
    }, [card, isOpen]);

    const handleSubmit = () => {
        if (!formData.cardName.trim()) {
            alert('Please enter a card name');
            return;
        }

        onSave({
            id: card?.id,
            card_name: formData.cardName,
            balance: card ? card.balance : parseFloat(formData.initialBalance) || 0,
            card_type: formData.cardType,
            status: formData.status,
            notes: formData.notes
        });

        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={card ? 'Edit Card' : 'Add Government Fee Card'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{card ? 'Save Changes' : 'Add Card'}</Button>
                </>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Card Name *</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., ICP Main Card, MOHRE Card"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Card Type</label>
                    <select
                        className="input"
                        value={formData.cardType}
                        onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                    >
                        <option value="ICP Portal">ICP Portal (Visa/Emirates ID)</option>
                        <option value="MOHRE">MOHRE (Labour)</option>
                        <option value="DED">DED (Business)</option>
                        <option value="General">General</option>
                    </select>
                </div>

                {!card && (
                    <div className="form-group">
                        <label className="form-label">Initial Balance (AED)</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={formData.initialBalance}
                            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                        className="input"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Notes (Optional)</label>
                    <textarea
                        className="input"
                        rows={3}
                        placeholder="Any additional notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default FeeCardModal;
