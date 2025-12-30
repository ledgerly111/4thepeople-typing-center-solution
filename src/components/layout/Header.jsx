import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
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
                <span className="header-logo">4TP</span>
                <span className="header-title">{getPageTitle()}</span>
            </div>

            <div className="header-actions">
                <button className="btn-icon" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <Link to="/settings" className="btn-icon desktop-only" title="Settings">
                    <Settings size={20} />
                </Link>
            </div>
        </header>
    );
};

export default Header;
