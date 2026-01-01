import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import SearchableSelect from './SearchableSelect';
import Select from './Select';
import { useStore } from '../../contexts/StoreContext';
import { Plus, Trash2, Printer, Check, CreditCard } from 'lucide-react';

const QuickSale = ({ isOpen, onClose, onComplete }) => {
    const { services, govtFeeCards, fetchGovtFeeCards, deductFromCard } = useStore();
    const [lineItems, setLineItems] = useState([]);
    const [amountReceived, setAmountReceived] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [hideGovtFee, setHideGovtFee] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState('');

    // Beneficiary info (person receiving the service)
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [beneficiaryId, setBeneficiaryId] = useState('');

    // Fetch cards on mount
    useEffect(() => {
        fetchGovtFeeCards();
    }, []);

    const serviceOptions = (services || []).map(s => ({
        id: s.id,
        name: `${s.name} - AED ${s.total || (s.service_fee + s.govt_fee)}`
    }));

    const addItem = () => {
        setLineItems([...lineItems, { serviceId: '', serviceFee: 0, govtFee: 0, price: 0, name: '' }]);
    };

    const updateItem = (index, serviceId) => {
        const newItems = [...lineItems];
        const service = (services || []).find(s => s.id === parseInt(serviceId));
        newItems[index] = {
            serviceId: serviceId,
            serviceFee: service ? (service.service_fee || service.serviceFee) : 0,
            govtFee: service ? (service.govt_fee || service.govtFee) : 0,
            price: service ? (service.total || (service.service_fee + service.govt_fee)) : 0,
            name: service ? service.name : ''
        };
        setLineItems(newItems);
    };

    const removeItem = (index) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    // Calculate totals
    const totalServiceFee = lineItems.reduce((sum, item) => sum + Number(item.serviceFee || 0), 0);
    const totalGovtFee = lineItems.reduce((sum, item) => sum + Number(item.govtFee || 0), 0);
    const grandTotal = totalServiceFee + totalGovtFee;
    const change = amountReceived ? Math.max(0, Number(amountReceived) - grandTotal) : 0;

    const handleComplete = async () => {
        if (lineItems.length === 0 || lineItems.some(item => !item.serviceId)) {
            alert('Please add at least one service');
            return;
        }

        // Allow partial payments - just calculate what was received
        const receivedAmount = Number(amountReceived) || grandTotal;
        const changeAmount = Math.max(0, receivedAmount - grandTotal);

        // Deduct govt fees from selected card if any
        let cardUsed = null;
        if (selectedCardId && totalGovtFee > 0) {
            const deductResult = await deductFromCard(
                parseInt(selectedCardId),
                totalGovtFee,
                null, // No work order for quick sale
                `Quick Sale govt fee - ${beneficiaryName || 'Walk-in'}`
            );
            if (!deductResult) {
                // Deduction failed - alert shown by deductFromCard
                return;
            }
            cardUsed = govtFeeCards.find(c => c.id === parseInt(selectedCardId));
        }

        // Use snake_case for Supabase columns
        const receipt = {
            items: lineItems.map(item => ({
                name: item.name,
                serviceFee: item.serviceFee,
                govtFee: item.govtFee,
                price: item.price
            })),
            service_fee: totalServiceFee,
            govt_fee: totalGovtFee,
            total: grandTotal,
            amount_received: receivedAmount,
            change: changeAmount,
            beneficiary_name: beneficiaryName || null,
            beneficiary_id_number: beneficiaryId || null,
            govt_fee_card_id: selectedCardId ? parseInt(selectedCardId) : null,
            govt_fee_card_name: cardUsed?.card_name || null
        };

        setReceiptData({
            ...receipt,
            id: `QS-${Date.now()}`,
            date: new Date().toLocaleString(),
            cardUsed: cardUsed?.card_name
        });
        setShowReceipt(true);

        if (onComplete) {
            onComplete(receipt);
        }
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleClose = () => {
        setLineItems([]);
        setAmountReceived('');
        setBeneficiaryName('');
        setBeneficiaryId('');
        setHideGovtFee(false);
        setSelectedCardId('');
        setShowReceipt(false);
        setReceiptData(null);
        onClose();
    };

    if (showReceipt && receiptData) {
        return (
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
                    <div className="thermal-receipt" id="receipt-print">
                        <div className="thermal-header">
                            <div className="thermal-logo">4TP</div>
                            <div className="thermal-company-name">4 The People</div>
                            <div className="thermal-tagline">Typing & Document Services</div>
                        </div>

                        <div className="thermal-info">
                            <div className="thermal-row">
                                <span className="thermal-row-label">Receipt #:</span>
                                <span className="thermal-row-value">{receiptData.id}</span>
                            </div>
                            <div className="thermal-row">
                                <span className="thermal-row-label">Date:</span>
                                <span className="thermal-row-value">{receiptData.date}</span>
                            </div>
                            {receiptData.beneficiary_name && (
                                <>
                                    <div className="thermal-row">
                                        <span className="thermal-row-label">Beneficiary:</span>
                                        <span className="thermal-row-value">{receiptData.beneficiary_name}</span>
                                    </div>
                                    {receiptData.beneficiary_id_number && (
                                        <div className="thermal-row">
                                            <span className="thermal-row-label">ID/Passport:</span>
                                            <span className="thermal-row-value">{receiptData.beneficiary_id_number}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <hr className="thermal-divider" />

                        <div className="thermal-items">
                            {receiptData.items.map((item, index) => (
                                <div key={index} className="thermal-item">
                                    <div className="thermal-item-name">{item.name}</div>
                                    <div className="thermal-item-details">
                                        <span>Svc: {item.serviceFee}</span>
                                        <span>Gov: {item.govtFee}</span>
                                        <span>= {item.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <hr className="thermal-divider" />

                        <div className="thermal-totals">
                            {!hideGovtFee && (
                                <>
                                    <div className="thermal-total-row">
                                        <span className="thermal-total-label">Service Fee:</span>
                                        <span className="thermal-total-value">AED {receiptData.service_fee}</span>
                                    </div>
                                    <div className="thermal-total-row">
                                        <span className="thermal-total-label">Govt Fee:</span>
                                        <span className="thermal-total-value">AED {receiptData.govt_fee}</span>
                                    </div>
                                </>
                            )}
                            <div className="thermal-total-row thermal-grand-total">
                                <span>TOTAL:</span>
                                <span>AED {receiptData.total}</span>
                            </div>
                        </div>

                        <div className="thermal-payment">
                            <div className="thermal-total-row">
                                <span className="thermal-total-label">Received:</span>
                                <span className="thermal-total-value">AED {receiptData.amount_received}</span>
                            </div>
                            {receiptData.change > 0 && (
                                <div className="thermal-total-row">
                                    <span className="thermal-total-label">Change:</span>
                                    <span className="thermal-total-value">AED {receiptData.change.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="thermal-footer">
                            <div className="thermal-footer-thanks">Thank You!</div>
                            <div>For inquiries call: 050-XXXXXXX</div>
                        </div>
                    </div>

                    <div className="modal-footer no-print" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input
                                type="checkbox"
                                checked={hideGovtFee}
                                onChange={(e) => setHideGovtFee(e.target.checked)}
                                style={{ width: '16px', height: '16px' }}
                            />
                            Hide Government Fees
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                            <Button variant="secondary" onClick={handlePrintReceipt} style={{ flex: 1 }}>
                                <Printer size={16} /> Print
                            </Button>
                            <Button onClick={handleClose} style={{ flex: 1 }}>
                                <Check size={16} /> Done
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Quick Sale"
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleComplete}>
                        <Check size={16} /> Complete Sale
                    </Button>
                </>
            }
        >
            {/* Beneficiary Section */}
            <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'var(--bg-accent)',
                borderRadius: '8px',
                border: '1px dashed var(--border)'
            }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                    👤 Beneficiary (Person receiving service)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Name (e.g., Ahmed Hassan)"
                        value={beneficiaryName}
                        onChange={(e) => setBeneficiaryName(e.target.value)}
                    />
                    <input
                        type="text"
                        className="input"
                        placeholder="ID/Passport (optional)"
                        value={beneficiaryId}
                        onChange={(e) => setBeneficiaryId(e.target.value)}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Services</label>
                {lineItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <SearchableSelect
                                options={serviceOptions}
                                value={item.serviceId}
                                onChange={(val) => updateItem(index, val)}
                                placeholder="Search service..."
                                displayKey="name"
                                valueKey="id"
                            />
                        </div>
                        <button
                            className="btn-icon"
                            onClick={() => removeItem(index)}
                            style={{ color: 'var(--danger)' }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                <Button variant="secondary" onClick={addItem} style={{ width: '100%' }}>
                    <Plus size={16} /> Add Service
                </Button>
            </div>

            {/* Fee Breakdown */}
            {lineItems.length > 0 && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-accent)',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Fee Breakdown
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                        <span>Service Charge</span>
                        <span>AED {totalServiceFee}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span>Government Fee</span>
                        <span>AED {totalGovtFee}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                        <span>Total:</span>
                        <span style={{ color: 'var(--accent)' }}>AED {grandTotal}</span>
                    </div>
                </div>
            )}

            {/* Amount Received */}
            {grandTotal > 0 && (
                <>
                    {/* Card Selection */}
                    {totalGovtFee > 0 && (
                        <div className="form-group">
                            <label className="form-label">💳 Deduct Govt Fee From Card</label>
                            <Select
                                options={[
                                    { value: '', label: 'Select Card (optional)' },
                                    ...govtFeeCards
                                        .filter(c => c.status === 'Active')
                                        .map(c => ({
                                            value: c.id.toString(),
                                            label: `${c.card_name} - AED ${parseFloat(c.balance || 0).toFixed(2)}`
                                        }))
                                ]}
                                value={selectedCardId}
                                onChange={setSelectedCardId}
                            />
                            {selectedCardId && (
                                <div style={{
                                    marginTop: '0.5rem',
                                    padding: '0.5rem',
                                    background: 'var(--bg-accent)',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    💳 AED {totalGovtFee.toFixed(2)} will be deducted from this card
                                </div>
                            )}
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">💰 Amount Received</label>
                        <input
                            type="number"
                            className="input"
                            placeholder={`Enter amount (min AED ${grandTotal})`}
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                            style={{ fontSize: '1.1rem', fontWeight: '600' }}
                        />
                        {amountReceived && Number(amountReceived) >= grandTotal && (
                            <div style={{
                                marginTop: '0.5rem',
                                padding: '0.75rem',
                                backgroundColor: 'var(--success)',
                                color: 'white',
                                borderRadius: '6px',
                                fontWeight: '600',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>💵 Change to Return:</span>
                                <span>AED {change.toFixed(2)}</span>
                            </div>
                        )}
                        {amountReceived && Number(amountReceived) < grandTotal && (
                            <div style={{
                                marginTop: '0.5rem',
                                padding: '0.75rem',
                                backgroundColor: 'var(--danger)',
                                color: 'white',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                            }}>
                                ⚠️ Short by AED {(grandTotal - Number(amountReceived)).toFixed(2)}
                            </div>
                        )}
                    </div>
                </>
            )}
        </Modal>
    );
};

export default QuickSale;
