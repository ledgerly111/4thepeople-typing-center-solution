import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { TrendingUp } from 'lucide-react';

const TopUpModal = ({ isOpen, onClose, card, onTopUp }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        const topUpAmount = parseFloat(amount);

        if (isNaN(topUpAmount) || topUpAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        onTopUp({
            cardId: card.id,
            amount: topUpAmount,
            description: description || 'Card top-up'
        });

        setAmount('');
        setDescription('');
        onClose();
    };

    const handleClose = () => {
        setAmount('');
        setDescription('');
        onClose();
    };

    if (!card) return null;

    const newBalance = parseFloat(card.balance || 0) + parseFloat(amount || 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Top Up Card"
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>
                        <TrendingUp size={16} /> Add Funds
                    </Button>
                </>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                    padding: '1rem',
                    background: 'var(--bg-accent)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Card Name
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                        {card.card_name || card.cardName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Current Balance
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)' }}>
                        AED {parseFloat(card.balance || 0).toFixed(2)}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Top-Up Amount (AED) *</label>
                    <input
                        type="number"
                        className="input"
                        placeholder="Enter amount"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ fontSize: '1.25rem', fontWeight: '600' }}
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., Bank transfer, Cash deposit"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {amount && parseFloat(amount) > 0 && (
                    <div style={{
                        padding: '1rem',
                        background: 'var(--success)15',
                        border: '1px solid var(--success)30',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                New Balance After Top-Up
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--success)' }}>
                                AED {newBalance.toFixed(2)}
                            </div>
                        </div>
                        <TrendingUp size={32} style={{ color: 'var(--success)' }} />
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default TopUpModal;
