import React, { useState, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import {
    Wallet, Plus, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight,
    Link2, Unlink, CreditCard, TrendingUp, TrendingDown, History
} from 'lucide-react';

const WalletPage = () => {
    const {
        govtFeeCards,
        fetchGovtFeeCards,
        addGovtFeeCard,
        updateGovtFeeCard,
        topUpCard,
        withdrawFromCard,
        transferBetweenCards,
        toggleGovtFeeLink,
        getCardTransactions
    } = useStore();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [cardForm, setCardForm] = useState({ card_name: '', card_type: 'ICP', status: 'Active', notes: '' });
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [targetCardId, setTargetCardId] = useState('');

    useEffect(() => {
        fetchGovtFeeCards();
    }, []);

    const totalBalance = govtFeeCards.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
    const activeCards = govtFeeCards.filter(c => c.status === 'Active');
    const linkedCards = govtFeeCards.filter(c => c.linked_to_govt_fees);

    const handleAddCard = async () => {
        if (!cardForm.card_name) {
            alert('Please enter card name');
            return;
        }
        setLoading(true);
        await addGovtFeeCard({ ...cardForm, balance: 0, created_date: new Date().toISOString() });
        setCardForm({ card_name: '', card_type: 'ICP', status: 'Active', notes: '' });
        setShowAddModal(false);
        setLoading(false);
    };

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter valid amount');
            return;
        }
        setLoading(true);
        await topUpCard(selectedCard.id, parseFloat(amount), description || 'Deposit');
        await fetchGovtFeeCards();
        setAmount('');
        setDescription('');
        setShowDepositModal(false);
        setLoading(false);
    };

    const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter valid amount');
            return;
        }
        setLoading(true);
        const result = await withdrawFromCard(selectedCard.id, parseFloat(amount), description || 'Withdrawal');
        if (!result.success) {
            alert(result.error);
            setLoading(false);
            return;
        }
        await fetchGovtFeeCards();
        setAmount('');
        setDescription('');
        setShowWithdrawModal(false);
        setLoading(false);
    };

    const handleTransfer = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter valid amount');
            return;
        }
        if (!targetCardId) {
            alert('Please select target card');
            return;
        }
        setLoading(true);
        const result = await transferBetweenCards(selectedCard.id, targetCardId, parseFloat(amount), description);
        if (!result.success) {
            alert(result.error);
            setLoading(false);
            return;
        }
        await fetchGovtFeeCards();
        setAmount('');
        setDescription('');
        setTargetCardId('');
        setShowTransferModal(false);
        setLoading(false);
    };

    const handleToggleLink = async (card) => {
        setLoading(true);
        await toggleGovtFeeLink(card.id, !card.linked_to_govt_fees);
        setLoading(false);
    };

    const openHistory = async (card) => {
        setSelectedCard(card);
        const txns = await getCardTransactions(card.id);
        setTransactions(txns);
        setShowHistoryModal(true);
    };

    const cardTypes = [
        { value: 'ICP', label: 'ICP (eChannels)' },
        { value: 'MOHRE', label: 'MOHRE (Tasheel)' },
        { value: 'GDRFA', label: 'GDRFA (Amer)' },
        { value: 'DED', label: 'DED' },
        { value: 'Other', label: 'Other' }
    ];

    const getCardGradient = (cardType) => {
        const gradients = {
            'ICP': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'MOHRE': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'GDRFA': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'DED': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'Other': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        };
        return gradients[cardType] || gradients['Other'];
    };

    return (
        <div className="page">
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Wallet</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Manage your government portal cards</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={18} /> Add Card
                </Button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <Card>
                    <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Balance</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>AED {totalBalance.toFixed(2)}</div>
                    </div>
                </Card>
                <Card>
                    <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Cards</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700' }}>{activeCards.length}</div>
                    </div>
                </Card>
                <Card>
                    <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Linked to Govt Fees</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>{linkedCards.length}</div>
                    </div>
                </Card>
            </div>

            {/* Cards Grid */}
            {govtFeeCards.length === 0 ? (
                <Card>
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <CreditCard size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No wallet cards yet. Click "Add Card" to create one.</p>
                    </div>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {govtFeeCards.map(card => (
                        <div key={card.id} style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            background: 'var(--bg-card)'
                        }}>
                            {/* Card Header with Gradient */}
                            <div style={{
                                background: getCardGradient(card.card_type),
                                padding: '1.5rem',
                                color: 'white',
                                position: 'relative'
                            }}>
                                {card.linked_to_govt_fees && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: 'rgba(255,255,255,0.25)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Link2 size={12} /> LINKED
                                    </div>
                                )}
                                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.25rem' }}>{card.card_type}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>{card.card_name}</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>AED {parseFloat(card.balance || 0).toFixed(2)}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
                                    {card.status === 'Active' ? '● Active' : '○ Inactive'}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                <button
                                    onClick={() => { setSelectedCard(card); setShowDepositModal(true); }}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: 'var(--success)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <ArrowDownCircle size={18} />
                                    Deposit
                                </button>
                                <button
                                    onClick={() => { setSelectedCard(card); setShowWithdrawModal(true); }}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: 'var(--danger)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <ArrowUpCircle size={18} />
                                    Withdraw
                                </button>
                                <button
                                    onClick={() => { setSelectedCard(card); setShowTransferModal(true); }}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: 'var(--accent)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <ArrowLeftRight size={18} />
                                    Transfer
                                </button>
                                <button
                                    onClick={() => openHistory(card)}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        color: 'var(--text)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <History size={18} />
                                    History
                                </button>
                            </div>

                            {/* Link Toggle */}
                            <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <button
                                    onClick={() => handleToggleLink(card)}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px dashed var(--border)',
                                        borderRadius: '8px',
                                        background: card.linked_to_govt_fees ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                        color: card.linked_to_govt_fees ? 'var(--success)' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {card.linked_to_govt_fees ? (
                                        <><Unlink size={16} /> Unlink from Govt Fees</>
                                    ) : (
                                        <><Link2 size={16} /> Link to Govt Fees</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Card Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Card">
                <div className="form-group">
                    <label className="form-label">Card Name *</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., ICP Main Card"
                        value={cardForm.card_name}
                        onChange={(e) => setCardForm({ ...cardForm, card_name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Card Type</label>
                    <Select
                        options={cardTypes}
                        value={cardForm.card_type}
                        onChange={(val) => setCardForm({ ...cardForm, card_type: val })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Notes (Optional)</label>
                    <textarea
                        className="input"
                        rows={2}
                        placeholder="Any notes..."
                        value={cardForm.notes}
                        onChange={(e) => setCardForm({ ...cardForm, notes: e.target.value })}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</Button>
                    <Button onClick={handleAddCard} disabled={loading} style={{ flex: 1 }}>
                        {loading ? 'Adding...' : 'Add Card'}
                    </Button>
                </div>
            </Modal>

            {/* Deposit Modal */}
            <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title={`Deposit to ${selectedCard?.card_name}`}>
                <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Balance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>AED {parseFloat(selectedCard?.balance || 0).toFixed(2)}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Amount (AED) *</label>
                    <input
                        type="number"
                        className="input"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="0.01"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., Top-up from bank"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                {amount && parseFloat(amount) > 0 && (
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', marginTop: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
                            New Balance: <strong>AED {(parseFloat(selectedCard?.balance || 0) + parseFloat(amount)).toFixed(2)}</strong>
                        </div>
                    </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <Button variant="secondary" onClick={() => setShowDepositModal(false)} style={{ flex: 1 }}>Cancel</Button>
                    <Button onClick={handleDeposit} disabled={loading} style={{ flex: 1, background: 'var(--success)' }}>
                        <TrendingUp size={16} /> {loading ? 'Processing...' : 'Deposit'}
                    </Button>
                </div>
            </Modal>

            {/* Withdraw Modal */}
            <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title={`Withdraw from ${selectedCard?.card_name}`}>
                <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Balance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>AED {parseFloat(selectedCard?.balance || 0).toFixed(2)}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Amount (AED) *</label>
                    <input
                        type="number"
                        className="input"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        max={selectedCard?.balance || 0}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., Cash withdrawal"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                {amount && parseFloat(amount) > 0 && (
                    <div style={{
                        padding: '1rem',
                        background: parseFloat(amount) > parseFloat(selectedCard?.balance || 0) ? 'rgba(220, 38, 38, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                        marginTop: '1rem'
                    }}>
                        <div style={{ fontSize: '0.85rem', color: parseFloat(amount) > parseFloat(selectedCard?.balance || 0) ? 'var(--danger)' : 'var(--success)' }}>
                            {parseFloat(amount) > parseFloat(selectedCard?.balance || 0)
                                ? 'Insufficient balance!'
                                : `New Balance: AED ${(parseFloat(selectedCard?.balance || 0) - parseFloat(amount)).toFixed(2)}`
                            }
                        </div>
                    </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <Button variant="secondary" onClick={() => setShowWithdrawModal(false)} style={{ flex: 1 }}>Cancel</Button>
                    <Button
                        onClick={handleWithdraw}
                        disabled={loading || parseFloat(amount) > parseFloat(selectedCard?.balance || 0)}
                        style={{ flex: 1, background: 'var(--danger)' }}
                    >
                        <TrendingDown size={16} /> {loading ? 'Processing...' : 'Withdraw'}
                    </Button>
                </div>
            </Modal>

            {/* Transfer Modal */}
            <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title={`Transfer from ${selectedCard?.card_name}`}>
                <div style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available Balance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>AED {parseFloat(selectedCard?.balance || 0).toFixed(2)}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Transfer To *</label>
                    <Select
                        options={govtFeeCards
                            .filter(c => c.id !== selectedCard?.id)
                            .map(c => ({ value: c.id, label: `${c.card_name} (AED ${parseFloat(c.balance || 0).toFixed(2)})` }))
                        }
                        value={targetCardId}
                        onChange={setTargetCardId}
                        placeholder="Select target card"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Amount (AED) *</label>
                    <input
                        type="number"
                        className="input"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        max={selectedCard?.balance || 0}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., Balance adjustment"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <Button variant="secondary" onClick={() => setShowTransferModal(false)} style={{ flex: 1 }}>Cancel</Button>
                    <Button
                        onClick={handleTransfer}
                        disabled={loading || !targetCardId || parseFloat(amount) > parseFloat(selectedCard?.balance || 0)}
                        style={{ flex: 1 }}
                    >
                        <ArrowLeftRight size={16} /> {loading ? 'Processing...' : 'Transfer'}
                    </Button>
                </div>
            </Modal>

            {/* History Modal */}
            <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title={`${selectedCard?.card_name} - Transaction History`} size="large">
                {transactions.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No transactions yet
                    </div>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {transactions.map((tx, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                borderBottom: '1px solid var(--border)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {tx.transaction_type.includes('Top') || tx.transaction_type.includes('In') ? (
                                            <TrendingUp size={16} style={{ color: 'var(--success)' }} />
                                        ) : (
                                            <TrendingDown size={16} style={{ color: 'var(--danger)' }} />
                                        )}
                                        {tx.transaction_type}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {tx.description} • {new Date(tx.created_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontWeight: '600',
                                        color: tx.transaction_type.includes('Top') || tx.transaction_type.includes('In') ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {tx.transaction_type.includes('Top') || tx.transaction_type.includes('In') ? '+' : '-'}AED {parseFloat(tx.amount).toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Balance: AED {parseFloat(tx.balance_after).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WalletPage;
