import React, { useState, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FeeCard from '../components/cards/FeeCard';
import FeeCardModal from '../components/cards/FeeCardModal';
import TopUpModal from '../components/cards/TopUpModal';
import { CreditCard, Plus } from 'lucide-react';

const GovtFeeCards = () => {
    const { govtFeeCards, fetchGovtFeeCards, addGovtFeeCard, topUpCard } = useStore();
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [editingCard, setEditingCard] = useState(null);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        await fetchGovtFeeCards();
    };

    const handleAddCard = () => {
        setEditingCard(null);
        setIsCardModalOpen(true);
    };

    const handleEditCard = (card) => {
        setEditingCard(card);
        setIsCardModalOpen(true);
    };

    const handleSaveCard = async (cardData) => {
        await addGovtFeeCard(cardData);
        setIsCardModalOpen(false);
        loadCards();
    };

    const handleTopUp = (card) => {
        setSelectedCard(card);
        setIsTopUpModalOpen(true);
    };

    const handleTopUpSubmit = async (data) => {
        await topUpCard(data.cardId, data.amount, data.description);
        setIsTopUpModalOpen(false);
        loadCards();
    };

    const totalBalance = govtFeeCards.reduce((sum, card) => sum + parseFloat(card.balance || 0), 0);
    const activeCards = govtFeeCards.filter(c => c.status === 'Active');

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>Government Fee Cards</h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                            Manage your prepaid cards for government portal payments
                        </p>
                    </div>
                    <Button onClick={handleAddCard}>
                        <Plus size={16} /> Add Card
                    </Button>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <Card>
                        <div style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Total Balance
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
                                AED {totalBalance.toFixed(2)}
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Active Cards
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                                {activeCards.length} / {govtFeeCards.length}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Cards Grid */}
            {govtFeeCards.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {govtFeeCards.map(card => (
                        <FeeCard
                            key={card.id}
                            card={card}
                            onTopUp={handleTopUp}
                            onEdit={handleEditCard}
                        />
                    ))}
                </div>
            ) : (
                <Card>
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <CreditCard size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>No Cards Yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Add your first government fee card to start tracking balances
                        </p>
                        <Button onClick={handleAddCard}>
                            <Plus size={16} /> Add Your First Card
                        </Button>
                    </div>
                </Card>
            )}

            {/* Modals */}
            <FeeCardModal
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
                onSave={handleSaveCard}
                card={editingCard}
            />

            <TopUpModal
                isOpen={isTopUpModalOpen}
                onClose={() => setIsTopUpModalOpen(false)}
                card={selectedCard}
                onTopUp={handleTopUpSubmit}
            />
        </div>
    );
};

export default GovtFeeCards;
