import React from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../../assets/4tplogo.svg';

const Header = () => {
    const location = useLocation();

    // Get page title based on current route
    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return 'Dashboard';
            case '/customers': return 'Customers';
            case '/services': return 'Services';
            case '/invoices': return 'Invoices';
            case '/transactions': return 'Transactions';
            case '/settings': return 'Settings';
            default: return '4 The People';
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <img src={logo} alt="4TP Logo" className="header-logo" style={{ height: '56px', width: 'auto' }} />
                <span className="header-title">{getPageTitle()}</span>
            </div>
        </header>
    );
};

export default Header;
