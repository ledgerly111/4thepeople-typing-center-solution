import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

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
    const [invoices, setInvoices] = useState([]);
    const [quickSales, setQuickSales] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [services, setServices] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchInvoices(),
                fetchWorkOrders(),
                fetchCustomers(),
                fetchServices(),
                fetchExpenses()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // ========== CUSTOMERS ==========
    const fetchCustomers = async () => {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customers:', error);
        } else {
            setCustomers(data || []);
        }
    };

    // ========== SERVICES ==========
    const fetchServices = async () => {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching services:', error);
        } else {
            setServices(data || []);
        }
    };

    // ========== EXPENSES ==========
    const fetchExpenses = async () => {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching expenses:', error);
        } else {
            setExpenses(data || []);
        }
    };

    const addExpense = async (expense) => {
        const { data, error } = await supabase
            .from('expenses')
            .insert([expense])
            .select()
            .single();

        if (error) {
            console.error('Error adding expense:', error);
            return null;
        }

        setExpenses(prev => [data, ...prev]);
        return data;
    };

    const deleteExpense = async (expenseId) => {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', expenseId);

        if (error) {
            console.error('Error deleting expense:', error);
            return;
        }

        setExpenses(prev => prev.filter(e => e.id !== expenseId));
    };

    // ========== INVOICES ==========
    const fetchInvoices = async () => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching invoices:', error);
        } else {
            setInvoices(data || []);
        }
    };

    const addInvoice = async (invoice) => {
        const newInvoice = {
            ...invoice,
            date: invoice.date || getTodayDate(),
        };

        const { data, error } = await supabase
            .from('invoices')
            .insert([newInvoice])
            .select()
            .single();

        if (error) {
            console.error('Error adding invoice:', error);
            return null;
        }

        setInvoices(prev => [data, ...prev]);
        return data;
    };

    const updateInvoiceStatus = async (invoiceId, status) => {
        const { error } = await supabase
            .from('invoices')
            .update({ status })
            .eq('id', invoiceId);

        if (error) {
            console.error('Error updating invoice:', error);
            return;
        }

        setInvoices(prev =>
            prev.map(inv => inv.id === invoiceId ? { ...inv, status } : inv)
        );
    };

    // ========== QUICK SALES ========== 
    // Quick sales are stored as invoices with a special flag
    const addQuickSale = async (sale) => {
        const newSale = {
            ...sale,
            customer_name: 'Walk-in Customer',
            date: getTodayDate(),
            status: 'Paid',
            payment_type: 'Cash',
        };

        const { data, error } = await supabase
            .from('invoices')
            .insert([newSale])
            .select()
            .single();

        if (error) {
            console.error('Error adding quick sale:', error);
            return null;
        }

        setQuickSales(prev => [data, ...prev]);
        setInvoices(prev => [data, ...prev]);
        return data;
    };

    // ========== WORK ORDERS ==========
    const fetchWorkOrders = async () => {
        const { data, error } = await supabase
            .from('work_orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching work orders:', error);
        } else {
            setWorkOrders(data || []);
        }
    };

    const addWorkOrder = async (workOrder) => {
        const newWorkOrder = {
            ...workOrder,
            created_date: getTodayDate(),
            status: workOrder.status || 'Pending',
        };

        const { data, error } = await supabase
            .from('work_orders')
            .insert([newWorkOrder])
            .select()
            .single();

        if (error) {
            console.error('Error adding work order:', error);
            return null;
        }

        setWorkOrders(prev => [data, ...prev]);
        return data;
    };

    const updateWorkOrder = async (workOrderId, updates) => {
        const { error } = await supabase
            .from('work_orders')
            .update(updates)
            .eq('id', workOrderId);

        if (error) {
            console.error('Error updating work order:', error);
            return;
        }

        setWorkOrders(prev =>
            prev.map(wo => wo.id === workOrderId ? { ...wo, ...updates } : wo)
        );
    };

    const updateWorkOrderStatus = async (workOrderId, status) => {
        const updates = {
            status,
            completed_date: status === 'Completed' ? getTodayDate() : null
        };

        const { error } = await supabase
            .from('work_orders')
            .update(updates)
            .eq('id', workOrderId);

        if (error) {
            console.error('Error updating work order status:', error);
            return;
        }

        setWorkOrders(prev =>
            prev.map(wo =>
                wo.id === workOrderId
                    ? { ...wo, ...updates }
                    : wo
            )
        );
    };

    const deleteWorkOrder = async (workOrderId) => {
        const { error } = await supabase
            .from('work_orders')
            .delete()
            .eq('id', workOrderId);

        if (error) {
            console.error('Error deleting work order:', error);
            return;
        }

        setWorkOrders(prev => prev.filter(wo => wo.id !== workOrderId));
    };

    // ========== HELPER FUNCTIONS ==========
    const getPendingWorkOrdersCount = () => {
        return workOrders.filter(wo => wo.status !== 'Completed').length;
    };

    const getOverdueWorkOrdersCount = () => {
        const today = getTodayDate();
        return workOrders.filter(wo =>
            wo.status !== 'Completed' && wo.due_date && wo.due_date < today
        ).length;
    };

    const getAllTransactions = () => {
        const invoiceTransactions = invoices.map(inv => ({
            id: inv.id,
            date: inv.date,
            type: 'Invoice',
            customer: inv.customer_name,
            total: inv.total,
            status: inv.status,
            paymentType: inv.payment_type || 'Cash',
            createdAt: inv.created_at || inv.date
        }));

        return invoiceTransactions.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date);
            const dateB = new Date(b.createdAt || b.date);
            return dateB - dateA;
        });
    };

    const getRecentTransactions = (limit = 5) => {
        const allItems = invoices.map(inv => ({
            id: inv.id,
            customer: inv.customer_name,
            service: Array.isArray(inv.items) && inv.items[0] ? inv.items[0].name : 'Services',
            amount: inv.total,
            status: inv.status,
            date: inv.date,
            type: inv.work_order_id ? 'Invoice' : 'Quick Sale',
            createdAt: inv.created_at || inv.date
        }));

        return allItems
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, limit);
    };

    const getTodaysSales = () => {
        const today = getTodayDate();
        return invoices
            .filter(inv => inv.date === today && inv.status === 'Paid')
            .reduce((sum, inv) => sum + (inv.total || 0), 0);
    };

    const getPendingAmount = () => {
        return invoices
            .filter(inv => inv.status === 'Pending')
            .reduce((sum, inv) => sum + (inv.total || 0), 0);
    };

    const getPendingCount = () => {
        return invoices.filter(inv => inv.status === 'Pending').length;
    };

    return (
        <StoreContext.Provider value={{
            invoices,
            quickSales,
            workOrders,
            customers,
            services,
            expenses,
            loading,
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
            getPendingCount,
            addExpense,
            deleteExpense,
            refreshData: fetchAllData
        }}>
            {children}
        </StoreContext.Provider>
    );
};
