import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import Button from './Button';
import { Printer, Download, X, Receipt } from 'lucide-react';
import logo from '../../assets/4tplogo.svg';

const InvoicePreview = ({ invoice, onClose, hideGovtFee: initialHideGovtFee = false, isReceiptMode: initialReceiptMode = false }) => {
    const invoiceRef = useRef(null);
    const receiptRef = useRef(null);
    const [hideGovtFee, setHideGovtFee] = React.useState(initialHideGovtFee);
    const [isReceiptMode, setIsReceiptMode] = React.useState(initialReceiptMode);

    // Normalize invoice data
    const normalizedInvoice = {
        ...invoice,
        items: invoice.items || [],
        total: parseFloat(invoice.total || 0),
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const element = isReceiptMode ? receiptRef.current : invoiceRef.current;
        const opt = {
            margin: isReceiptMode ? 2 : 10,
            filename: `${isReceiptMode ? 'Receipt' : 'Invoice'}-${invoice.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: isReceiptMode ? [80, 200] : 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    // Calculate totals
    const totalServiceFee = normalizedInvoice.service_fee || normalizedInvoice.serviceFee ||
        (Array.isArray(normalizedInvoice.items) ? normalizedInvoice.items.reduce((sum, item) => sum + parseFloat(item.serviceFee || item.service_fee || 0), 0) : 0);
    const totalGovtFee = normalizedInvoice.govt_fee || normalizedInvoice.govtFee ||
        (Array.isArray(normalizedInvoice.items) ? normalizedInvoice.items.reduce((sum, item) => sum + parseFloat(item.govtFee || item.govt_fee || 0), 0) : 0);

    // Check if beneficiary is different from customer
    const customerName = invoice.customer_name || invoice.customerName || '';
    const beneficiaryName = invoice.beneficiary_name || invoice.beneficiaryName || '';
    const beneficiaryId = invoice.beneficiary_id_number || invoice.beneficiaryIdNumber || '';
    const hasDifferentBeneficiary = beneficiaryName && beneficiaryName !== customerName && beneficiaryName !== 'Walk-in Customer';

    // =====================
    // THERMAL RECEIPT RENDER
    // =====================
    const renderThermalReceipt = () => (
        <div ref={receiptRef} style={{
            width: '72mm',
            padding: '8px',
            margin: '0 auto',
            background: '#fff',
            fontFamily: "'Courier New', monospace",
            fontSize: '11px',
            color: '#000',
            lineHeight: '1.4',
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>4 THE PEOPLE</div>
                <div style={{ fontSize: '10px' }}>Typing Center Services</div>
                <div style={{ fontSize: '9px', marginTop: '4px' }}>Tel: 04-XXX-XXXX</div>
            </div>

            {/* Receipt Info */}
            <div style={{ marginBottom: '8px', fontSize: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Receipt #:</span>
                    <span style={{ fontWeight: 'bold' }}>{invoice.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Date:</span>
                    <span>{invoice.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Status:</span>
                    <span style={{ fontWeight: 'bold' }}>{invoice.status}</span>
                </div>
            </div>

            {/* Customer */}
            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', marginBottom: '8px', fontSize: '10px' }}>
                <div><strong>Customer:</strong> {customerName}</div>
                {(invoice.customer_mobile || invoice.customerMobile) && (
                    <div>Mobile: {invoice.customer_mobile || invoice.customerMobile}</div>
                )}
                {hasDifferentBeneficiary && (
                    <div style={{ marginTop: '4px' }}>
                        <strong>Beneficiary:</strong> {beneficiaryName}
                        {beneficiaryId && <div>ID: {beneficiaryId}</div>}
                    </div>
                )}
            </div>

            {/* Items */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>ITEMS:</div>
                {Array.isArray(invoice.items) && invoice.items.length > 0 ? invoice.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                            {index + 1}. {item.name}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>{(item.price || (item.serviceFee || 0) + (item.govtFee || 0)).toFixed(2)}</span>
                    </div>
                )) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                        <span>Services</span>
                        <span style={{ fontWeight: 'bold' }}>{(invoice.total || 0).toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px dashed #000', paddingTop: '6px', marginBottom: '8px' }}>
                {!hideGovtFee && (totalServiceFee > 0 || totalGovtFee > 0) && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                            <span>Service:</span>
                            <span>{totalServiceFee.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                            <span>Govt Fee:</span>
                            <span>{totalGovtFee.toFixed(2)}</span>
                        </div>
                    </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginTop: '4px', padding: '4px 0', borderTop: '1px solid #000' }}>
                    <span>TOTAL (AED):</span>
                    <span>{(invoice.total || 0).toFixed(2)}</span>
                </div>
            </div>

            {/* Payment Info */}
            {invoice.status === 'Paid' && (
                <div style={{ fontSize: '10px', marginBottom: '8px' }}>
                    {(invoice.amount_received || invoice.amountReceived) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Received:</span>
                            <span>{(invoice.amount_received || invoice.amountReceived || 0).toFixed(2)}</span>
                        </div>
                    )}
                    {(invoice.change || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Change:</span>
                            <span>{(invoice.change || 0).toFixed(2)}</span>
                        </div>
                    )}
                    {(invoice.payment_type || invoice.paymentType) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Payment:</span>
                            <span>{invoice.payment_type || invoice.paymentType}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '8px', fontSize: '9px' }}>
                <div style={{ fontWeight: 'bold' }}>Thank You!</div>
                <div>Visit Again</div>
                <div style={{ marginTop: '8px', fontSize: '8px' }}>*** {new Date().toLocaleString()} ***</div>
            </div>
        </div>
    );

    // =====================
    // PROFESSIONAL INVOICE STYLES
    // =====================
    const styles = {
        paper: {
            background: '#fff',
            padding: '40px',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: '14px',
            color: '#333',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '3px solid #f97316',
        },
        companySection: { flex: 1 },
        logo: { height: '60px', marginBottom: '8px' },
        companyTagline: { fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' },
        invoiceTitle: { textAlign: 'right' },
        invoiceLabel: { fontSize: '28px', fontWeight: '800', color: '#f97316', margin: 0, letterSpacing: '2px' },
        invoiceNumber: { fontSize: '16px', color: '#374151', margin: '8px 0 4px 0' },
        invoiceDate: { fontSize: '13px', color: '#6b7280' },
        statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginTop: '8px' },
        paidBadge: { background: '#dcfce7', color: '#166534' },
        pendingBadge: { background: '#fef3c7', color: '#92400e' },
        quotationBadge: { background: '#e0e7ff', color: '#3730a3' },
        partiesSection: { display: 'grid', gridTemplateColumns: hasDifferentBeneficiary ? '1fr 1fr' : '1fr', gap: '24px', marginBottom: '30px' },
        partyCard: { background: '#f9fafb', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f97316' },
        partyLabel: { fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0', fontWeight: '600' },
        partyName: { fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' },
        partyDetail: { fontSize: '13px', color: '#4b5563', margin: '2px 0' },
        table: { width: '100%', borderCollapse: 'collapse', marginBottom: '24px' },
        tableHeader: { background: '#1f2937', color: '#fff' },
        th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
        thRight: { textAlign: 'right' },
        td: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '13px' },
        tdRight: { textAlign: 'right' },
        totalsSection: { marginLeft: 'auto', width: '300px' },
        totalsRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' },
        totalsRowMuted: { color: '#6b7280' },
        grandTotal: { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f97316', color: '#fff', borderRadius: '8px', fontSize: '18px', fontWeight: '700', marginTop: '8px' },
        footer: { marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' },
        footerThank: { fontSize: '14px', color: '#374151', fontWeight: '600', margin: '0 0 8px 0' },
        footerNote: { fontSize: '11px', color: '#9ca3af', margin: 0 },
        paymentInfo: { marginTop: '16px', padding: '12px 16px', background: '#dcfce7', borderRadius: '8px', borderLeft: '4px solid #22c55e' },
        paymentRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' },
    };

    const getStatusStyle = () => {
        if (invoice.status === 'Paid') return { ...styles.statusBadge, ...styles.paidBadge };
        if (invoice.status === 'Quotation') return { ...styles.statusBadge, ...styles.quotationBadge };
        return { ...styles.statusBadge, ...styles.pendingBadge };
    };

    // =====================
    // PROFESSIONAL INVOICE RENDER
    // =====================
    const renderInvoice = () => (
        <div ref={invoiceRef} style={styles.paper}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.companySection}>
                    <img src={logo} alt="4 The People" style={styles.logo} />
                    <p style={styles.companyTagline}>Document Services & Typing Center</p>
                </div>
                <div style={styles.invoiceTitle}>
                    <h1 style={styles.invoiceLabel}>
                        {invoice.status === 'Quotation' ? 'QUOTATION' : 'INVOICE'}
                    </h1>
                    <p style={styles.invoiceNumber}><strong>#{invoice.id}</strong></p>
                    <p style={styles.invoiceDate}>Date: {invoice.date}</p>
                    <span style={getStatusStyle()}>{invoice.status}</span>
                </div>
            </div>

            {/* Bill To / Service For Section */}
            <div style={styles.partiesSection}>
                <div style={styles.partyCard}>
                    <p style={styles.partyLabel}>Bill To</p>
                    <p style={styles.partyName}>{customerName}</p>
                    {(invoice.customer_mobile || invoice.customerMobile) && (
                        <p style={styles.partyDetail}>Tel: {invoice.customer_mobile || invoice.customerMobile}</p>
                    )}
                    {(invoice.customer_email || invoice.customerEmail) && (
                        <p style={styles.partyDetail}>Email: {invoice.customer_email || invoice.customerEmail}</p>
                    )}
                </div>

                {hasDifferentBeneficiary && (
                    <div style={{ ...styles.partyCard, borderLeftColor: '#8b5cf6' }}>
                        <p style={styles.partyLabel}>Service For (Beneficiary)</p>
                        <p style={styles.partyName}>{beneficiaryName}</p>
                        {beneficiaryId && <p style={styles.partyDetail}>ID: {beneficiaryId}</p>}
                    </div>
                )}
            </div>

            {/* Reference Number */}
            {(invoice.reference_number || invoice.referenceNumber) && (
                <div style={{ marginBottom: '20px', padding: '8px 12px', background: '#f3f4f6', borderRadius: '6px', fontSize: '13px' }}>
                    <strong>Reference:</strong> {invoice.reference_number || invoice.referenceNumber}
                </div>
            )}

            {/* Line Items Table */}
            <table style={styles.table}>
                <thead style={styles.tableHeader}>
                    <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Description</th>
                        {!hideGovtFee && <th style={{ ...styles.th, ...styles.thRight }}>Service</th>}
                        {!hideGovtFee && <th style={{ ...styles.th, ...styles.thRight }}>Govt Fee</th>}
                        <th style={{ ...styles.th, ...styles.thRight }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(invoice.items) && invoice.items.length > 0 ? invoice.items.map((item, index) => (
                        <tr key={index}>
                            <td style={styles.td}>{index + 1}</td>
                            <td style={styles.td}>{item.name}</td>
                            {!hideGovtFee && <td style={{ ...styles.td, ...styles.tdRight }}>AED {(item.serviceFee || item.service_fee || 0).toFixed(2)}</td>}
                            {!hideGovtFee && <td style={{ ...styles.td, ...styles.tdRight }}>AED {(item.govtFee || item.govt_fee || 0).toFixed(2)}</td>}
                            <td style={{ ...styles.td, ...styles.tdRight, fontWeight: '600' }}>AED {(item.price || (item.serviceFee || 0) + (item.govtFee || 0)).toFixed(2)}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td style={styles.td}>1</td>
                            <td style={styles.td}>Services Rendered</td>
                            {!hideGovtFee && <td style={{ ...styles.td, ...styles.tdRight }}>AED {totalServiceFee.toFixed(2)}</td>}
                            {!hideGovtFee && <td style={{ ...styles.td, ...styles.tdRight }}>AED {totalGovtFee.toFixed(2)}</td>}
                            <td style={{ ...styles.td, ...styles.tdRight, fontWeight: '600' }}>AED {(invoice.total || 0).toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Totals */}
            <div style={styles.totalsSection}>
                {!hideGovtFee && (totalServiceFee > 0 || totalGovtFee > 0) && (
                    <>
                        <div style={{ ...styles.totalsRow, ...styles.totalsRowMuted }}>
                            <span>Service Charges:</span>
                            <span>AED {totalServiceFee.toFixed(2)}</span>
                        </div>
                        <div style={{ ...styles.totalsRow, ...styles.totalsRowMuted }}>
                            <span>Government Fees:</span>
                            <span>AED {totalGovtFee.toFixed(2)}</span>
                        </div>
                    </>
                )}
                <div style={styles.grandTotal}>
                    <span>TOTAL</span>
                    <span>AED {(invoice.total || 0).toFixed(2)}</span>
                </div>
            </div>

            {/* Payment Info */}
            {invoice.status === 'Paid' && (invoice.amount_received || invoice.amountReceived) > 0 && (
                <div style={styles.paymentInfo}>
                    <div style={styles.paymentRow}>
                        <span>Amount Received:</span>
                        <span><strong>AED {(invoice.amount_received || invoice.amountReceived || 0).toFixed(2)}</strong></span>
                    </div>
                    {(invoice.change || 0) > 0 && (
                        <div style={styles.paymentRow}>
                            <span>Change Given:</span>
                            <span><strong>AED {(invoice.change || 0).toFixed(2)}</strong></span>
                        </div>
                    )}
                    {(invoice.payment_type || invoice.paymentType) && (
                        <div style={styles.paymentRow}>
                            <span>Payment Method:</span>
                            <span><strong>{invoice.payment_type || invoice.paymentType}</strong></span>
                        </div>
                    )}
                </div>
            )}

            {/* Notes */}
            {invoice.notes && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#fffbeb', borderRadius: '6px', fontSize: '12px' }}>
                    <strong>Notes:</strong> {invoice.notes}
                </div>
            )}

            {/* Footer */}
            <div style={styles.footer}>
                <p style={styles.footerThank}>Thank you for choosing 4 The People!</p>
                <p style={styles.footerNote}>This is a computer-generated document. No signature required.</p>
            </div>
        </div>
    );

    return (
        <div className="invoice-preview-overlay">
            {/* Action Bar */}
            <div className="invoice-actions no-print" style={{ flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <input type="checkbox" checked={hideGovtFee} onChange={(e) => setHideGovtFee(e.target.checked)} />
                        Hide Govt Fees
                    </label>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button onClick={() => setIsReceiptMode(false)} variant={!isReceiptMode ? 'primary' : 'secondary'}>
                        <Printer size={16} /> Invoice
                    </Button>
                    <Button onClick={() => setIsReceiptMode(true)} variant={isReceiptMode ? 'primary' : 'secondary'}>
                        <Receipt size={16} /> Thermal Receipt
                    </Button>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button onClick={handlePrint}><Printer size={16} /> Print</Button>
                    <Button onClick={handleDownloadPDF}><Download size={16} /> Download PDF</Button>
                    <Button variant="secondary" onClick={onClose}><X size={16} /> Close</Button>
                </div>
            </div>

            {/* Content - Show either Invoice or Receipt based on mode */}
            {isReceiptMode ? renderThermalReceipt() : renderInvoice()}
        </div>
    );
};

export default InvoicePreview;
