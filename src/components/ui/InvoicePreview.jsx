import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import Button from './Button';
import { Printer, Download, X } from 'lucide-react';

const InvoicePreview = ({ invoice, onClose }) => {
    const invoiceRef = useRef(null);

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
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="invoice-preview-overlay">
            {/* Action Bar - Hidden in Print */}
            <div className="invoice-actions no-print">
                <Button onClick={handlePrint}>
                    <Printer size={16} /> Print
                </Button>
                <Button onClick={handleDownloadPDF}>
                    <Download size={16} /> Download PDF
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    <X size={16} /> Close
                </Button>
            </div>

            {/* Invoice Content - This gets printed/converted to PDF */}
            <div ref={invoiceRef} className="invoice-paper">
                {/* Header */}
                <div className="invoice-header">
                    <div className="invoice-company">
                        <h1 className="invoice-company-name">4 The People</h1>
                        <p className="invoice-company-subtitle">Typing Center Services</p>
                    </div>
                    <div className="invoice-meta">
                        <h2 className="invoice-title">INVOICE</h2>
                        <table className="invoice-meta-table">
                            <tbody>
                                <tr>
                                    <td>Invoice #:</td>
                                    <td><strong>{invoice.id}</strong></td>
                                </tr>
                                <tr>
                                    <td>Date:</td>
                                    <td>{invoice.date}</td>
                                </tr>
                                <tr>
                                    <td>Status:</td>
                                    <td className={invoice.status === 'Paid' ? 'status-paid' : 'status-pending'}>
                                        {invoice.status}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="invoice-customer">
                    <h3>Bill To:</h3>
                    <p className="customer-name">{invoice.customerName}</p>
                    {invoice.customerMobile && <p>{invoice.customerMobile}</p>}
                    {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
                </div>

                {/* Line Items */}
                <table className="invoice-items">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Description</th>
                            <th className="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(invoice.items) ? invoice.items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td className="text-right">AED {item.price.toFixed(2)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td>1</td>
                                <td>Services</td>
                                <td className="text-right">AED {invoice.total.toFixed(2)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="invoice-totals">
                    <div className="totals-row">
                        <span>Subtotal:</span>
                        <span>AED {invoice.total.toFixed(2)}</span>
                    </div>
                    <div className="totals-row muted">
                        <span>VAT (0%):</span>
                        <span>AED 0.00</span>
                    </div>
                    <div className="totals-row total">
                        <span>Total:</span>
                        <span>AED {invoice.total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="invoice-footer">
                    <p>Thank you for your business!</p>
                    <p className="footer-note">This is a computer-generated invoice.</p>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
