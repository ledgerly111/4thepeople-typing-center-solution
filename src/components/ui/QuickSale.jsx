import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import SearchableSelect from './SearchableSelect';
import { MOCK_SERVICES } from '../../services/mockData';
import { Plus, Trash2, Printer, Check } from 'lucide-react';
import logo from '../../assets/4tplogo.svg';

const QuickSale = ({ isOpen, onClose, onComplete }) => {
    const [lineItems, setLineItems] = useState([]);
    const [amountReceived, setAmountReceived] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    const serviceOptions = MOCK_SERVICES.map(s => ({
        id: s.id,
        name: `${s.name} - AED ${s.price}`
    }));

    const addItem = () => {
        setLineItems([...lineItems, { serviceId: '', serviceFee: 0, govtFee: 0, price: 0, name: '' }]);
    };

    const updateItem = (index, serviceId) => {
        const newItems = [...lineItems];
        const service = MOCK_SERVICES.find(s => s.id === parseInt(serviceId));
        newItems[index] = {
            serviceId: serviceId,
            serviceFee: service ? service.serviceFee : 0,
            govtFee: service ? service.govtFee : 0,
            price: service ? service.price : 0,
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

    const handleComplete = () => {
        if (lineItems.length === 0 || lineItems.some(item => !item.serviceId)) {
            alert('Please add at least one service');
            return;
        }

        if (amountReceived && Number(amountReceived) < grandTotal) {
            alert('Amount received is less than total');
            return;
        }

        const receipt = {
            items: lineItems.map(item => ({
                name: item.name,
                serviceFee: item.serviceFee,
                govtFee: item.govtFee,
                price: item.price
            })),
            serviceFee: totalServiceFee,
            govtFee: totalGovtFee,
            total: grandTotal,
            amountReceived: Number(amountReceived) || grandTotal,
            change: change
        };

        setReceiptData({
            ...receipt,
            id: `QS-${Date.now()}`,
            date: new Date().toLocaleString()
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
        setShowReceipt(false);
        setReceiptData(null);
        onClose();
    };

    if (showReceipt && receiptData) {
        return (
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
                    <div className="receipt-content" id="receipt-print">
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <img src={logo} alt="4 The People" style={{ height: '50px', width: 'auto', marginBottom: '0.5rem' }} />
                            <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                Typing Center Services
                            </p>
                            <p style={{ margin: '0.5rem 0', fontSize: '0.75rem' }}>
                                {receiptData.date}
                            </p>
                        </div>

                        <div style={{ borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)', padding: '0.75rem 0', margin: '0.5rem 0' }}>
                            {receiptData.items.map((item, index) => (
                                <div key={index} style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                                        <span>{item.name}</span>
                                        <span>AED {item.price}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
                                        <span>Service: {item.serviceFee} | Govt: {item.govtFee}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '0.5rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                <span>Service Charges:</span>
                                <span>AED {receiptData.serviceFee}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                <span>Government Fees:</span>
                                <span>AED {receiptData.govtFee}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                <span>Total:</span>
                                <span style={{ color: 'var(--accent)' }}>AED {receiptData.total}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Received:</span>
                                <span>AED {receiptData.amountReceived}</span>
                            </div>
                            {receiptData.change > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: '600' }}>
                                    <span>Change:</span>
                                    <span>AED {receiptData.change.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Thank you for your visit!
                            </p>
                        </div>
                    </div>

                    <div className="modal-footer no-print">
                        <Button variant="secondary" onClick={handlePrintReceipt}>
                            <Printer size={16} /> Print
                        </Button>
                        <Button onClick={handleClose}>
                            <Check size={16} /> Done
                        </Button>
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
                    <Button onClick={handleComplete} disabled={amountReceived && Number(amountReceived) < grandTotal}>
                        <Check size={16} /> Complete Sale
                    </Button>
                </>
            }
        >
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
            )}
        </Modal>
    );
};

export default QuickSale;
