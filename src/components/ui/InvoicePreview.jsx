import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import Button from './Button';
import { Printer, Download, X } from 'lucide-react';
import logo from '../../assets/4tplogo.svg';

const InvoicePreview = ({ invoice, onClose, hideGovtFee: initialHideGovtFee = false, isReceiptMode: initialReceiptMode = false }) => {
    const invoiceRef = useRef(null);
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
        const element = invoiceRef.current;
        const opt = {
            margin: 10,
            filename: `Invoice-${invoice.id}.pdf`,
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

    // Professional invoice styles (inline for PDF generation)
    const styles = {
        paper: {
            background: '#fff',
            padding: isReceiptMode ? '15px' : '40px',
            maxWidth: isReceiptMode ? '80mm' : '800px',
            margin: '0 auto',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: isReceiptMode ? '11px' : '14px',
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
        companySection: {
            flex: 1,
        },
        logo: {
            height: isReceiptMode ? '40px' : '60px',
            marginBottom: '8px',
        },
        companyName: {
            fontSize: isReceiptMode ? '14px' : '18px',
            fontWeight: '700',
            color: '#1f2937',
            margin: 0,
        },
        companyTagline: {
            fontSize: isReceiptMode ? '10px' : '12px',
            color: '#6b7280',
            margin: '4px 0 0 0',
        },
        invoiceTitle: {
            textAlign: 'right',
        },
        invoiceLabel: {
            fontSize: isReceiptMode ? '18px' : '28px',
            fontWeight: '800',
            color: '#f97316',
            margin: 0,
            letterSpacing: '2px',
        },
        invoiceNumber: {
            fontSize: isReceiptMode ? '12px' : '16px',
            color: '#374151',
            margin: '8px 0 4px 0',
        },
        invoiceDate: {
            fontSize: isReceiptMode ? '10px' : '13px',
            color: '#6b7280',
        },
        statusBadge: {
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: isReceiptMode ? '10px' : '12px',
            fontWeight: '600',
            marginTop: '8px',
        },
        paidBadge: {
            background: '#dcfce7',
            color: '#166534',
        },
        pendingBadge: {
            background: '#fef3c7',
            color: '#92400e',
        },
        quotationBadge: {
            background: '#e0e7ff',
            color: '#3730a3',
        },
        partiesSection: {
            display: 'grid',
            gridTemplateColumns: hasDifferentBeneficiary ? '1fr 1fr' : '1fr',
            gap: '24px',
            marginBottom: '30px',
        },
        partyCard: {
            background: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            borderLeft: '4px solid #f97316',
        },
        partyLabel: {
            fontSize: isReceiptMode ? '9px' : '11px',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: '0 0 8px 0',
            fontWeight: '600',
        },
        partyName: {
            fontSize: isReceiptMode ? '13px' : '16px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 4px 0',
        },
        partyDetail: {
            fontSize: isReceiptMode ? '10px' : '13px',
            color: '#4b5563',
            margin: '2px 0',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '24px',
        },
        tableHeader: {
            background: '#1f2937',
            color: '#fff',
        },
        th: {
            padding: isReceiptMode ? '8px 6px' : '12px 16px',
            textAlign: 'left',
            fontSize: isReceiptMode ? '9px' : '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        thRight: {
            textAlign: 'right',
        },
        td: {
            padding: isReceiptMode ? '8px 6px' : '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: isReceiptMode ? '10px' : '13px',
        },
        tdRight: {
            textAlign: 'right',
        },
        totalsSection: {
            marginLeft: 'auto',
            width: isReceiptMode ? '100%' : '300px',
        },
        totalsRow: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            fontSize: isReceiptMode ? '11px' : '14px',
        },
        totalsRowMuted: {
            color: '#6b7280',
        },
        grandTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#f97316',
            color: '#fff',
            borderRadius: '8px',
            fontSize: isReceiptMode ? '14px' : '18px',
            fontWeight: '700',
            marginTop: '8px',
        },
        footer: {
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center',
        },
        footerThank: {
            fontSize: isReceiptMode ? '11px' : '14px',
            color: '#374151',
            fontWeight: '600',
            margin: '0 0 8px 0',
        },
        footerNote: {
            fontSize: isReceiptMode ? '9px' : '11px',
            color: '#9ca3af',
            margin: 0,
        },
        paymentInfo: {
            marginTop: '16px',
            padding: '12px 16px',
            background: '#dcfce7',
            borderRadius: '8px',
            borderLeft: '4px solid #22c55e',
        },
        paymentRow: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: isReceiptMode ? '10px' : '13px',
            padding: '4px 0',
        },
    };

    const getStatusStyle = () => {
        if (invoice.status === 'Paid') return { ...styles.statusBadge, ...styles.paidBadge };
        if (invoice.status === 'Quotation') return { ...styles.statusBadge, ...styles.quotationBadge };
        return { ...styles.statusBadge, ...styles.pendingBadge };
    };

    return (
        <div className="invoice-preview-overlay">
            {/* Action Bar - Hidden in Print */}
            <div className="invoice-actions no-print" style={{ flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <input type="checkbox" checked={hideGovtFee} onChange={(e) => setHideGovtFee(e.target.checked)} />
                        Hide Govt Fees
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <input type="checkbox" checked={isReceiptMode} onChange={(e) => setIsReceiptMode(e.target.checked)} />
                        Print as Receipt
                    </label>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button onClick={handlePrint}><Printer size={16} /> Print</Button>
                    <Button onClick={handleDownloadPDF}><Download size={16} /> Download PDF</Button>
                    <Button variant="secondary" onClick={onClose}><X size={16} /> Close</Button>
                </div>
            </div>

            {/* Invoice Content */}
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
                    {/* Customer (Bill To) */}
                    <div style={styles.partyCard}>
                        <p style={styles.partyLabel}>Bill To</p>
                        <p style={styles.partyName}>{customerName}</p>
                        {(invoice.customer_mobile || invoice.customerMobile) && (
                            <p style={styles.partyDetail}>📞 {invoice.customer_mobile || invoice.customerMobile}</p>
                        )}
                        {(invoice.customer_email || invoice.customerEmail) && (
                            <p style={styles.partyDetail}>✉️ {invoice.customer_email || invoice.customerEmail}</p>
                        )}
                    </div>

                    {/* Beneficiary (Service For) - Only shown if different from customer */}
                    {hasDifferentBeneficiary && (
                        <div style={{ ...styles.partyCard, borderLeftColor: '#8b5cf6' }}>
                            <p style={styles.partyLabel}>Service For (Beneficiary)</p>
                            <p style={styles.partyName}>{beneficiaryName}</p>
                            {beneficiaryId && (
                                <p style={styles.partyDetail}>🆔 {beneficiaryId}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Reference Number if exists */}
                {(invoice.reference_number || invoice.referenceNumber) && (
                    <div style={{ marginBottom: '20px', padding: '8px 12px', background: '#f3f4f6', borderRadius: '6px', fontSize: isReceiptMode ? '10px' : '13px' }}>
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

                {/* Totals Section */}
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

                {/* Payment Info (for paid invoices) */}
                {invoice.status === 'Paid' && (invoice.amount_received || invoice.amountReceived) > 0 && (
                    <div style={styles.paymentInfo}>
                        <div style={styles.paymentRow}>
                            <span>💵 Amount Received:</span>
                            <span><strong>AED {(invoice.amount_received || invoice.amountReceived || 0).toFixed(2)}</strong></span>
                        </div>
                        {(invoice.change || 0) > 0 && (
                            <div style={styles.paymentRow}>
                                <span>💰 Change Given:</span>
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
                    <div style={{ marginTop: '20px', padding: '12px', background: '#fffbeb', borderRadius: '6px', fontSize: isReceiptMode ? '10px' : '12px' }}>
                        <strong>Notes:</strong> {invoice.notes}
                    </div>
                )}

                {/* Footer */}
                <div style={styles.footer}>
                    <p style={styles.footerThank}>Thank you for choosing 4 The People!</p>
                    <p style={styles.footerNote}>This is a computer-generated document. No signature required.</p>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
