import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell } from 'lucide-react';
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
                <button className="btn-icon" onClick={() => alert('Notifications')}>
                    <Bell size={20} />
                </button>
                <button className="btn-icon" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </div>
        </header>
    );
};

export default Header;
