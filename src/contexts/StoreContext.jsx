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
    const [govtFeeCards, setGovtFeeCards] = useState([]);
    const [cardTransactions, setCardTransactions] = useState([]);
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

    const addCustomer = async (customer) => {
        const { data, error } = await supabase
            .from('customers')
            .insert([customer])
            .select()
            .single();

        if (error) {
            console.error('Error adding customer:', error);
            return null;
        }

        setCustomers(prev => [data, ...prev]);
        return data;
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
            return { success: false, error: error.message };
        }

        setInvoices(prev => [data, ...prev]);
        return { success: true, data };
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
            is_quick_sale: true,
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
            return { success: false, error: error.message };
        }

        setWorkOrders(prev => [data, ...prev]);
        return { success: true, data };
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
            type: inv.is_quick_sale ? 'Quick Sale' : 'Invoice',
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

    // ========== GOVERNMENT FEE CARDS ==========
    const fetchGovtFeeCards = async () => {
        const { data, error } = await supabase
            .from('govt_fee_cards')
            .select('*')
            .order('created_date', { ascending: false });

        if (error) {
            console.error('Error fetching cards:', error);
            return [];
        }

        setGovtFeeCards(data || []);
        return data || [];
    };

    const addGovtFeeCard = async (cardData) => {
        const { data, error } = await supabase
            .from('govt_fee_cards')
            .insert([cardData])
            .select()
            .single();

        if (error) {
            console.error('Error adding card:', error);
            return null;
        }

        setGovtFeeCards(prev => [data, ...prev]);
        return data;
    };

    const updateGovtFeeCard = async (cardId, updates) => {
        const { error } = await supabase
            .from('govt_fee_cards')
            .update(updates)
            .eq('id', cardId);

        if (error) {
            console.error('Error updating card:', error);
            return;
        }

        setGovtFeeCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updates } : c));
    };

    const topUpCard = async (cardId, amount, description) => {
        const { data: card, error: fetchError } = await supabase
            .from('govt_fee_cards')
            .select('*')
            .eq('id', cardId)
            .single();

        if (fetchError || !card) {
            console.error('Error fetching card:', fetchError);
            return null;
        }

        const balanceBefore = parseFloat(card.balance) || 0;
        const balanceAfter = balanceBefore + parseFloat(amount);

        const transaction = {
            card_id: cardId,
            transaction_type: 'Top-up',
            amount: parseFloat(amount),
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            description: description || 'Card top-up'
        };

        const { data: txData, error: txError } = await supabase
            .from('card_transactions')
            .insert([transaction])
            .select()
            .single();

        if (txError) {
            console.error('Error creating transaction:', txError);
            return null;
        }

        await updateGovtFeeCard(cardId, {
            balance: balanceAfter,
            last_transaction_date: new Date().toISOString()
        });

        return txData;
    };

    const deductFromCard = async (cardId, amount, workOrderId, description) => {
        const { data: card, error: fetchError } = await supabase
            .from('govt_fee_cards')
            .select('*')
            .eq('id', cardId)
            .single();

        if (fetchError || !card) {
            console.error('Error fetching card:', fetchError);
            return null;
        }

        const balanceBefore = parseFloat(card.balance) || 0;
        const deductAmount = parseFloat(amount);

        if (balanceBefore < deductAmount) {
            alert(`Insufficient card balance!\n\nRequired: AED ${deductAmount.toFixed(2)}\nAvailable: AED ${balanceBefore.toFixed(2)}`);
            return null;
        }

        const balanceAfter = balanceBefore - deductAmount;

        const transaction = {
            card_id: cardId,
            transaction_type: 'Deduction',
            amount: deductAmount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            description: description || 'Government fee payment',
            work_order_id: workOrderId
        };

        const { data: txData, error: txError } = await supabase
            .from('card_transactions')
            .insert([transaction])
            .select()
            .single();

        if (txError) {
            console.error('Error creating transaction:', txError);
            return null;
        }

        await updateGovtFeeCard(cardId, {
            balance: balanceAfter,
            last_transaction_date: new Date().toISOString()
        });

        return txData;
    };

    // Withdraw from card
    const withdrawFromCard = async (cardId, amount, description) => {
        const { data: card, error: fetchError } = await supabase
            .from('govt_fee_cards')
            .select('*')
            .eq('id', cardId)
            .single();

        if (fetchError || !card) {
            console.error('Error fetching card:', fetchError);
            return { success: false, error: 'Card not found' };
        }

        const balanceBefore = parseFloat(card.balance) || 0;
        const withdrawAmount = parseFloat(amount);

        if (balanceBefore < withdrawAmount) {
            return { success: false, error: `Insufficient balance. Available: AED ${balanceBefore.toFixed(2)}` };
        }

        const balanceAfter = balanceBefore - withdrawAmount;

        const transaction = {
            card_id: cardId,
            transaction_type: 'Withdrawal',
            amount: withdrawAmount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            description: description || 'Cash withdrawal',
            created_date: new Date().toISOString()
        };

        const { error: txError } = await supabase
            .from('card_transactions')
            .insert([transaction]);

        if (txError) {
            console.error('Error creating transaction:', txError);
            return { success: false, error: 'Failed to record transaction' };
        }

        await updateGovtFeeCard(cardId, {
            balance: balanceAfter,
            last_transaction_date: new Date().toISOString()
        });

        return { success: true };
    };

    // Transfer between cards
    const transferBetweenCards = async (fromCardId, toCardId, amount, description) => {
        const { data: fromCard } = await supabase.from('govt_fee_cards').select('*').eq('id', fromCardId).single();
        const { data: toCard } = await supabase.from('govt_fee_cards').select('*').eq('id', toCardId).single();

        if (!fromCard || !toCard) {
            return { success: false, error: 'Card not found' };
        }

        const transferAmount = parseFloat(amount);
        const fromBalance = parseFloat(fromCard.balance) || 0;

        if (fromBalance < transferAmount) {
            return { success: false, error: `Insufficient balance in source card. Available: AED ${fromBalance.toFixed(2)}` };
        }

        const toBalance = parseFloat(toCard.balance) || 0;

        // Create transfer out transaction
        await supabase.from('card_transactions').insert([{
            card_id: fromCardId,
            transaction_type: 'Transfer Out',
            amount: transferAmount,
            balance_before: fromBalance,
            balance_after: fromBalance - transferAmount,
            description: `Transfer to ${toCard.card_name}: ${description || ''}`,
            created_date: new Date().toISOString()
        }]);

        // Create transfer in transaction
        await supabase.from('card_transactions').insert([{
            card_id: toCardId,
            transaction_type: 'Transfer In',
            amount: transferAmount,
            balance_before: toBalance,
            balance_after: toBalance + transferAmount,
            description: `Transfer from ${fromCard.card_name}: ${description || ''}`,
            created_date: new Date().toISOString()
        }]);

        // Update balances
        await updateGovtFeeCard(fromCardId, { balance: fromBalance - transferAmount, last_transaction_date: new Date().toISOString() });
        await updateGovtFeeCard(toCardId, { balance: toBalance + transferAmount, last_transaction_date: new Date().toISOString() });

        return { success: true };
    };

    // Toggle govt fee linking
    const toggleGovtFeeLink = async (cardId, isLinked) => {
        const { error } = await supabase
            .from('govt_fee_cards')
            .update({ linked_to_govt_fees: isLinked })
            .eq('id', cardId);

        if (error) {
            console.error('Error updating link status:', error);
            return { success: false, error: 'Failed to update' };
        }

        setGovtFeeCards(prev => prev.map(c => c.id === cardId ? { ...c, linked_to_govt_fees: isLinked } : c));
        return { success: true };
    };

    // Get cards linked to govt fees
    const getLinkedCards = () => {
        return govtFeeCards.filter(c => c.linked_to_govt_fees && c.status === 'Active');
    };

    const getCardTransactions = async (cardId) => {
        const { data, error } = await supabase
            .from('card_transactions')
            .select('*')
            .eq('card_id', cardId)
            .order('created_date', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }

        return data || [];
    };

    return (
        <StoreContext.Provider value={{
            invoices,
            quickSales,
            workOrders,
            customers,
            addCustomer,
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
            govtFeeCards,
            fetchGovtFeeCards,
            addGovtFeeCard,
            updateGovtFeeCard,
            topUpCard,
            deductFromCard,
            withdrawFromCard,
            transferBetweenCards,
            toggleGovtFeeLink,
            getLinkedCards,
            getCardTransactions,
            refreshData: fetchAllData
        }}>
            {children}
        </StoreContext.Provider>
    );
};
