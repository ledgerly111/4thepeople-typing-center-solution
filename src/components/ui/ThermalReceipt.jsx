import React, { useRef } from 'react';
import { Printer } from 'lucide-react';

const ThermalReceipt = ({ invoice, onClose }) => {
    const receiptRef = useRef(null);

    const handlePrint = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=300,height=600');

        if (!printWindow) {
            alert('Please allow popups for this site to print');
            return;
        }

        const receiptHTML = receiptRef.current.innerHTML;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt #${invoice.id || 'N/A'}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 10px;
                        line-height: 1.4;
                        width: 72mm;
                        max-width: 72mm;
                        padding: 4mm;
                        background: white;
                        color: black;
                    }
                    .thermal-header {
                        text-align: center;
                        margin-bottom: 8px;
                        padding-bottom: 8px;
                        border-bottom: 1px dashed #000;
                    }
                    .thermal-logo {
                        font-size: 16px;
                        font-weight: 700;
                        margin-bottom: 2px;
                    }
                    .thermal-company-name {
                        font-size: 11px;
                        font-weight: 600;
                    }
                    .thermal-tagline {
                        font-size: 9px;
                        margin-top: 2px;
                    }
                    .thermal-divider {
                        border: none;
                        border-top: 1px dashed #000;
                        margin: 6px 0;
                    }
                    .thermal-info {
                        margin-bottom: 8px;
                    }
                    .thermal-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 2px;
                    }
                    .thermal-row-label {
                        font-size: 9px;
                    }
                    .thermal-row-value {
                        font-size: 9px;
                        font-weight: 600;
                        text-align: right;
                    }
                    .thermal-items {
                        margin: 8px 0;
                    }
                    .thermal-item {
                        margin-bottom: 4px;
                    }
                    .thermal-item-name {
                        font-size: 10px;
                        font-weight: 600;
                    }
                    .thermal-item-details {
                        display: flex;
                        justify-content: space-between;
                        font-size: 9px;
                        padding-left: 8px;
                    }
                    .thermal-totals {
                        margin-top: 8px;
                        padding-top: 8px;
                        border-top: 1px dashed #000;
                    }
                    .thermal-total-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 2px;
                    }
                    .thermal-total-label {
                        font-size: 9px;
                    }
                    .thermal-total-value {
                        font-size: 9px;
                        font-weight: 600;
                    }
                    .thermal-grand-total {
                        font-size: 14px !important;
                        font-weight: 700 !important;
                        margin-top: 4px;
                        padding-top: 4px;
                        border-top: 1px solid #000;
                    }
                    .thermal-payment {
                        margin-top: 8px;
                        padding-top: 8px;
                        border-top: 1px dashed #000;
                    }
                    .thermal-footer {
                        text-align: center;
                        margin-top: 12px;
                        padding-top: 8px;
                        border-top: 1px dashed #000;
                        font-size: 9px;
                    }
                    .thermal-footer-thanks {
                        font-size: 11px;
                        font-weight: 600;
                        margin-bottom: 4px;
                    }
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        body {
                            width: 72mm;
                        }
                    }
                </style>
            </head>
            <body>
                ${receiptHTML}
            </body>
            </html>
        `);

        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };

        // Fallback for browsers that don't trigger onload
        setTimeout(() => {
            if (!printWindow.closed) {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        }, 500);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return new Date().toLocaleDateString('en-GB');
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = () => {
        return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const items = invoice.items || [];
    const serviceFee = parseFloat(invoice.service_fee || invoice.serviceFee || 0);
    const govtFee = parseFloat(invoice.govt_fee || invoice.govtFee || 0);
    const total = parseFloat(invoice.total || 0);
    const amountReceived = parseFloat(invoice.amount_received || invoice.amountReceived || 0);
    const change = parseFloat(invoice.change || 0);

    return (
        <div style={{ padding: '1rem' }}>
            {/* Print Button */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                    onClick={handlePrint}
                    style={{
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                    }}
                >
                    <Printer size={16} /> Print Receipt
                </button>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        Close
                    </button>
                )}
            </div>

            {/* Receipt Preview - Also used for printing */}
            <div
                ref={receiptRef}
                style={{
                    width: '280px',
                    margin: '0 auto',
                    padding: '1rem',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '11px',
                    color: 'black'
                }}
            >
                {/* Header */}
                <div className="thermal-header" style={{ textAlign: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dashed #000' }}>
                    <div className="thermal-logo" style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>4TP</div>
                    <div className="thermal-company-name" style={{ fontSize: '12px', fontWeight: '600' }}>4 The People</div>
                    <div className="thermal-tagline" style={{ fontSize: '10px', marginTop: '2px' }}>Typing & Document Services</div>
                </div>

                {/* Invoice Info */}
                <div className="thermal-info" style={{ marginBottom: '8px' }}>
                    <div className="thermal-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span className="thermal-row-label">Invoice #:</span>
                        <span className="thermal-row-value" style={{ fontWeight: '600' }}>{invoice.id || 'N/A'}</span>
                    </div>
                    <div className="thermal-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span className="thermal-row-label">Date:</span>
                        <span className="thermal-row-value" style={{ fontWeight: '600' }}>{formatDate(invoice.date)}</span>
                    </div>
                    <div className="thermal-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span className="thermal-row-label">Time:</span>
                        <span className="thermal-row-value" style={{ fontWeight: '600' }}>{formatTime()}</span>
                    </div>
                </div>

                <hr className="thermal-divider" style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

                {/* Customer */}
                <div className="thermal-info" style={{ marginBottom: '8px' }}>
                    <div className="thermal-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span className="thermal-row-label">Customer:</span>
                        <span className="thermal-row-value" style={{ fontWeight: '600' }}>{invoice.customer_name || invoice.customerName || 'Walk-in'}</span>
                    </div>
                    {(invoice.customer_mobile || invoice.customerMobile) && (
                        <div className="thermal-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span className="thermal-row-label">Mobile:</span>
                            <span className="thermal-row-value" style={{ fontWeight: '600' }}>{invoice.customer_mobile || invoice.customerMobile}</span>
                        </div>
                    )}
                </div>

                <hr className="thermal-divider" style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

                {/* Items */}
                <div className="thermal-items" style={{ margin: '8px 0' }}>
                    <div style={{ fontWeight: '700', fontSize: '11px', marginBottom: '4px' }}>ITEMS:</div>
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <div key={index} className="thermal-item" style={{ marginBottom: '4px' }}>
                                <div className="thermal-item-name" style={{ fontWeight: '600' }}>{item.name || `Item ${index + 1}`}</div>
                                <div className="thermal-item-details" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', paddingLeft: '8px' }}>
                                    <span>Svc: {parseFloat(item.serviceFee || item.service_fee || 0).toFixed(2)}</span>
                                    <span>Gov: {parseFloat(item.govtFee || item.govt_fee || 0).toFixed(2)}</span>
                                    <span>= {parseFloat(item.price || item.total || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="thermal-item" style={{ marginBottom: '4px' }}>
                            <div className="thermal-item-name" style={{ fontWeight: '600' }}>Services</div>
                            <div className="thermal-item-details" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', paddingLeft: '8px' }}>
                                <span></span>
                                <span>AED {total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <hr className="thermal-divider" style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

                {/* Totals */}
                <div className="thermal-totals" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #000' }}>
                    <div className="thermal-total-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span className="thermal-total-label">Service Fee:</span>
                        <span className="thermal-total-value" style={{ fontWeight: '600' }}>AED {serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="thermal-total-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span className="thermal-total-label">Govt Fee:</span>
                        <span className="thermal-total-value" style={{ fontWeight: '600' }}>AED {govtFee.toFixed(2)}</span>
                    </div>
                    <div className="thermal-total-row thermal-grand-total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #000' }}>
                        <span>TOTAL:</span>
                        <span>AED {total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="thermal-payment" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #000' }}>
                    <div className="thermal-total-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span className="thermal-total-label">Payment:</span>
                        <span className="thermal-total-value" style={{ fontWeight: '600' }}>{invoice.payment_type || invoice.paymentType || 'Cash'}</span>
                    </div>
                    {invoice.status !== 'Pending' && (
                        <>
                            <div className="thermal-total-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span className="thermal-total-label">Received:</span>
                                <span className="thermal-total-value" style={{ fontWeight: '600' }}>AED {amountReceived.toFixed(2)}</span>
                            </div>
                            {change > 0 && (
                                <div className="thermal-total-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span className="thermal-total-label">Change:</span>
                                    <span className="thermal-total-value" style={{ fontWeight: '600' }}>AED {change.toFixed(2)}</span>
                                </div>
                            )}
                        </>
                    )}
                    {invoice.status === 'Pending' && (
                        <div className="thermal-total-row" style={{ marginTop: '4px', textAlign: 'center' }}>
                            <span style={{ fontWeight: '700', fontSize: '12px' }}>** CREDIT - UNPAID **</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="thermal-footer" style={{ textAlign: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #000', fontSize: '10px' }}>
                    <div className="thermal-footer-thanks" style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Thank You!</div>
                    <div>For inquiries call: 050-XXXXXXX</div>
                    <div style={{ marginTop: '4px' }}>www.4thepeople.ae</div>
                </div>
            </div>
        </div>
    );
};

export default ThermalReceipt;
