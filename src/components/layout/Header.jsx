import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import logo from '../../assets/4tplogo.svg';

const Header = () => {
    const location = useLocation();

    // Get page title based on current route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/dashboard/') return 'Dashboard';
        if (path.includes('customers')) return 'Customers';
        if (path.includes('services')) return 'Services';
        if (path.includes('invoices')) return 'Invoices';
        if (path.includes('transactions')) return 'Transactions';
        if (path.includes('settings')) return 'Settings';
        if (path.includes('work-orders')) return 'Work Orders';
        if (path.includes('wallet')) return 'Wallet';
        if (path.includes('expenses')) return 'Expenses';
        if (path.includes('reports')) return 'Reports';
        if (path.includes('suppliers')) return 'Suppliers';
        if (path.includes('quick-create')) return 'Quick Create';
        if (path.includes('ai-verify')) return 'AI Verify';
        return '4 The People';
    };

    return (
        <header className="header">
            <div className="header-left">
                <img src={logo} alt="4TP Logo" className="header-logo" style={{ height: '56px', width: 'auto' }} />
                <span className="header-title">{getPageTitle()}</span>
            </div>

            {/* Quick Create Button */}
            <Link
                to="/dashboard/quick-create"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
                    transition: 'all 0.2s ease'
                }}
                title="Quick Create"
            >
                <Plus size={24} />
            </Link>
        </header>
    );
};

export default Header;
