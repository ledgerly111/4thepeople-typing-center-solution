import React from 'react';
import { CreditCard, TrendingUp, Pause } from 'lucide-react';

const FeeCard = ({ card, onTopUp, onEdit }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'var(--success)';
            case 'Inactive': return 'var(--text-muted)';
            case 'Suspended': return 'var(--danger)';
            default: return 'var(--text-muted)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Active': return <CreditCard size={16} />;
            case 'Inactive': return <Pause size={16} />;
            case 'Suspended': return <Pause size={16} />;
            default: return <CreditCard size={16} />;
        }
    };

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Status Badge */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: getStatusColor(card.status),
                background: `${getStatusColor(card.status)}15`,
                border: `1px solid ${getStatusColor(card.status)}30`
            }}>
                {getStatusIcon(card.status)}
                {card.status}
            </div>

            {/* Card Name */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    {card.card_type || 'Government Fee Card'}
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {card.card_name || card.cardName}
                </div>
            </div>

            {/* Balance */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Available Balance
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
                    AED {parseFloat(card.balance || 0).toFixed(2)}
                </div>
            </div>

            {/* Actions */}
            {card.status === 'Active' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => onTopUp(card)}
                        style={{
                            flex: 1,
                            padding: '0.625rem 1rem',
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <TrendingUp size={14} />
                        Top Up
                    </button>
                    <button
                        onClick={() => onEdit(card)}
                        style={{
                            padding: '0.625rem 1rem',
                            background: 'var(--bg-accent)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Edit
                    </button>
                </div>
            )}

            {/* Created Date */}
            <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
            }}>
                Created: {new Date(card.created_date || card.createdDate).toLocaleDateString()}
            </div>
        </div>
    );
};

export default FeeCard;
