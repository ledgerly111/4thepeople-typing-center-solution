import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { StoreProvider } from './contexts/StoreContext';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Services from './pages/Services';
import Invoices from './pages/Invoices';
import WorkOrders from './pages/WorkOrders';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import Wallet from './pages/Wallet';
import WorkOrderCreate from './pages/WorkOrderCreate';
import InvoiceCreate from './pages/InvoiceCreate';
import CustomerDetail from './pages/CustomerDetail';
import QuickCreate from './pages/QuickCreate';
import AIDocumentVerification from './pages/AIDocumentVerification';
import './App.css';

// ===========================================
// AUTH IS DISABLED FOR TESTING
// Set this to TRUE when you want to enable login
// ===========================================
const AUTH_ENABLED = false;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
          <Router>
            <Routes>
              {/* Login route - always available */}
              <Route path="/login" element={<Login />} />

              {/* Main app routes - NO protection for now */}
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="quick-create" element={<QuickCreate />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/:id" element={<CustomerDetail />} />
                <Route path="services" element={<Services />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices/create" element={<InvoiceCreate />} />
                <Route path="work-orders" element={<WorkOrders />} />
                <Route path="work-orders/create" element={<WorkOrderCreate />} />
                <Route path="ai-verify" element={<AIDocumentVerification />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="reports" element={<Reports />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="settings" element={<Settings />} />
                <Route path="super-admin" element={<SuperAdmin />} />
              </Route>
            </Routes>
          </Router>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
