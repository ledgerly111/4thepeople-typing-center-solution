import React, { createContext, useContext, useState } from 'react';
import { MOCK_INVOICES, MOCK_WORK_ORDERS } from '../services/mockData';

const StoreContext = createContext();

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within StoreProvider');
    }
    return context;
};

// Helper to get today's date string
const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const StoreProvider = ({ children }) => {
    // Initialize invoices with today's date for mock data
    const today = getTodayDate();
    const initialInvoices = MOCK_INVOICES.map((inv, index) => ({
        ...inv,
        // Make mock data more recent for demo purposes
        date: index === 0 ? today : inv.date
    }));

    const [invoices, setInvoices] = useState(initialInvoices);
    const [quickSales, setQuickSales] = useState([]);
    const [workOrders, setWorkOrders] = useState(MOCK_WORK_ORDERS);

    // Add new invoice
    const addInvoice = (invoice) => {
        const newInvoice = {
            ...invoice,
            id: Math.max(...invoices.map(i => i.id), 1000) + 1,
            date: invoice.date || getTodayDate(),
            createdAt: new Date().toISOString()
        };
        setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
        return newInvoice;
    };

    // Update invoice status
    const updateInvoiceStatus = (invoiceId, status) => {
        setInvoices(prevInvoices =>
            prevInvoices.map(inv =>
                inv.id === invoiceId ? { ...inv, status } : inv
            )
        );
    };

    // Add quick sale
    const addQuickSale = (sale) => {
        const newSale = {
            ...sale,
            id: `QS-${Date.now()}`,
            date: getTodayDate(),
            time: new Date().toLocaleTimeString(),
            type: 'Quick Sale',
            createdAt: new Date().toISOString()
        };
        setQuickSales(prevSales => [newSale, ...prevSales]);
        return newSale;
    };

    // Work Order Management
    const addWorkOrder = (workOrder) => {
        const newWorkOrder = {
            ...workOrder,
            id: Math.max(...workOrders.map(wo => wo.id), 2000) + 1,
            createdDate: getTodayDate(),
            completedDate: null,
            status: workOrder.status || 'Pending'
        };
        setWorkOrders(prevOrders => [newWorkOrder, ...prevOrders]);
        return newWorkOrder;
    };

    const updateWorkOrder = (workOrderId, updates) => {
        setWorkOrders(prevOrders =>
            prevOrders.map(wo =>
                wo.id === workOrderId ? { ...wo, ...updates } : wo
            )
        );
    };

    const updateWorkOrderStatus = (workOrderId, status) => {
        setWorkOrders(prevOrders =>
            prevOrders.map(wo =>
                wo.id === workOrderId
                    ? {
                        ...wo,
                        status,
                        completedDate: status === 'Completed' ? getTodayDate() : wo.completedDate
                    }
                    : wo
            )
        );
    };

    const deleteWorkOrder = (workOrderId) => {
        setWorkOrders(prevOrders => prevOrders.filter(wo => wo.id !== workOrderId));
    };

    // Get pending work orders count
    const getPendingWorkOrdersCount = () => {
        return workOrders.filter(wo => wo.status !== 'Completed').length;
    };

    // Get overdue work orders count
    const getOverdueWorkOrdersCount = () => {
        const today = getTodayDate();
        return workOrders.filter(wo =>
            wo.status !== 'Completed' && wo.dueDate && wo.dueDate < today
        ).length;
    };

    // Get all transactions (invoices + quick sales) sorted by date
    const getAllTransactions = () => {
        const invoiceTransactions = invoices.map(inv => ({
            id: inv.id,
            date: inv.date,
            type: 'Invoice',
            customer: inv.customerName,
            total: inv.total,
            status: inv.status,
            paymentType: inv.paymentType || 'Cash',
            createdAt: inv.createdAt || inv.date
        }));

        const quickSaleTransactions = quickSales.map(qs => ({
            id: qs.id,
            date: qs.date,
            type: 'Quick Sale',
            customer: 'Walk-in',
            total: qs.total,
            status: 'Paid',
            paymentType: 'Cash',
            createdAt: qs.createdAt || qs.date
        }));

        // Sort by createdAt descending (newest first)
        return [...invoiceTransactions, ...quickSaleTransactions].sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date);
            const dateB = new Date(b.createdAt || b.date);
            return dateB - dateA;
        });
    };

    // Get recent transactions (for Dashboard - last 5 by creation time)
    const getRecentTransactions = (limit = 5) => {
        const allItems = [
            ...invoices.map(inv => ({
                id: inv.id,
                customer: inv.customerName,
                service: Array.isArray(inv.items) && inv.items[0] ? inv.items[0].name : 'Services',
                amount: inv.total,
                status: inv.status,
                date: inv.date,
                type: 'Invoice',
                createdAt: inv.createdAt || inv.date
            })),
            ...quickSales.map(qs => ({
                id: qs.id,
                customer: 'Walk-in',
                service: Array.isArray(qs.items) && qs.items[0] ? qs.items[0].name : 'Quick Sale',
                amount: qs.total,
                status: 'Paid',
                date: qs.date,
                type: 'Quick Sale',
                createdAt: qs.createdAt || qs.date
            }))
        ];

        // Sort by createdAt descending and take limit
        return allItems
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, limit);
    };

    // Get today's sales total
    const getTodaysSales = () => {
        const today = getTodayDate();

        const invoiceSales = invoices
            .filter(inv => inv.date === today && inv.status === 'Paid')
            .reduce((sum, inv) => sum + (inv.total || 0), 0);

        const quickSalesToday = quickSales
            .filter(qs => qs.date === today)
            .reduce((sum, qs) => sum + (qs.total || 0), 0);

        return invoiceSales + quickSalesToday;
    };

    // Get pending amount
    const getPendingAmount = () => {
        return invoices
            .filter(inv => inv.status === 'Pending')
            .reduce((sum, inv) => sum + (inv.total || 0), 0);
    };

    // Get pending count
    const getPendingCount = () => {
        return invoices.filter(inv => inv.status === 'Pending').length;
    };

    return (
        <StoreContext.Provider value={{
            invoices,
            quickSales,
            workOrders,
            addInvoice,
            updateInvoiceStatus,
            addQuickSale,
            addWorkOrder,
            updateWorkOrder,
            updateWorkOrderStatus,
            deleteWorkOrder,
            getPendingWorkOrdersCount,
            getOverdueWorkOrdersCount,
            getAllTransactions,
            getRecentTransactions,
            getTodaysSales,
            getPendingAmount,
            getPendingCount
        }}>
            {children}
        </StoreContext.Provider>
    );
};

