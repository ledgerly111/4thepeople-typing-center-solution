import React, { createContext, useContext, useState } from 'react';
import { MOCK_INVOICES } from '../services/mockData';

const StoreContext = createContext();

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within StoreProvider');
    }
    return context;
};

export const StoreProvider = ({ children }) => {
    // Invoices state
    const [invoices, setInvoices] = useState(MOCK_INVOICES);

    // Quick sales / transactions without invoice
    const [quickSales, setQuickSales] = useState([]);

    // Add new invoice
    const addInvoice = (invoice) => {
        const getTodayDate = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const newInvoice = {
            ...invoice,
            id: Math.max(...invoices.map(i => i.id), 1000) + 1,
            date: invoice.date || getTodayDate(),
        };
        setInvoices([newInvoice, ...invoices]);
        return newInvoice;
    };

    // Update invoice status
    const updateInvoiceStatus = (invoiceId, status) => {
        setInvoices(invoices.map(inv =>
            inv.id === invoiceId ? { ...inv, status } : inv
        ));
    };

    // Add quick sale
    const addQuickSale = (sale) => {
        const newSale = {
            ...sale,
            id: `QS-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            type: 'Quick Sale'
        };
        setQuickSales([newSale, ...quickSales]);
        return newSale;
    };

    // Get all transactions (invoices + quick sales)
    const getAllTransactions = () => {
        const invoiceTransactions = invoices.map(inv => ({
            id: inv.id,
            date: inv.date,
            type: 'Invoice',
            customer: inv.customerName,
            total: inv.total,
            status: inv.status,
            paymentType: inv.paymentType || 'Cash'
        }));

        const quickSaleTransactions = quickSales.map(qs => ({
            id: qs.id,
            date: qs.date,
            type: 'Quick Sale',
            customer: 'Walk-in',
            total: qs.total,
            status: 'Paid',
            paymentType: 'Cash'
        }));

        return [...invoiceTransactions, ...quickSaleTransactions].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );
    };

    // Get today's sales total
    const getTodaysSales = () => {
        const today = new Date().toISOString().split('T')[0];

        const invoiceSales = invoices
            .filter(inv => inv.date === today && inv.status === 'Paid')
            .reduce((sum, inv) => sum + inv.total, 0);

        const quickSalesToday = quickSales
            .filter(qs => qs.date === today)
            .reduce((sum, qs) => sum + qs.total, 0);

        return invoiceSales + quickSalesToday;
    };

    return (
        <StoreContext.Provider value={{
            invoices,
            quickSales,
            addInvoice,
            updateInvoiceStatus,
            addQuickSale,
            getAllTransactions,
            getTodaysSales
        }}>
            {children}
        </StoreContext.Provider>
    );
};
