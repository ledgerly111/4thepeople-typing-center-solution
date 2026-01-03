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
import Landing from './pages/Landing';
import Suppliers from './pages/Suppliers';
import './App.css';

// ===========================================
// AUTH IS DISABLED FOR TESTING
// Set this to TRUE when you want to enable login
// ===========================================
const AUTH_ENABLED = false;

function App() {
  // Check for required environment variables
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '600px', background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h1 style={{ color: '#e11d48', marginTop: 0 }}>⚠️ Deployment Configuration Missing</h1>
          <p style={{ fontSize: '1.1rem', color: '#374151' }}>The application cannot connect to the database because environment variables are missing.</p>

          <div style={{ textAlign: 'left', background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0' }}>
            <p style={{ fontWeight: '600', marginTop: 0 }}>Please add these variables to your Cloudflare/Vercel settings:</p>
            <code style={{ display: 'block', padding: '0.5rem 0', color: '#2563eb' }}>VITE_SUPABASE_URL</code>
            <code style={{ display: 'block', padding: '0.5rem 0', color: '#2563eb' }}>VITE_SUPABASE_ANON_KEY</code>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>After adding the variables, trigger a new deployment (Redeploy).</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
          <Router>
            <Routes>
              {/* Landing Page - Public */}
              <Route path="/" element={<Landing />} />

              {/* Login route - always available */}
              <Route path="/login" element={<Login />} />

              {/* Main app routes - ERP Dashboard */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="quick-create" element={<QuickCreate />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/:id" element={<CustomerDetail />} />
                <Route path="suppliers" element={<Suppliers />} />
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
