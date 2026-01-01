import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, ClipboardList, List, Briefcase, Users, Settings, BarChart3, Receipt, Wallet } from 'lucide-react';

const BottomNav = () => {
    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: FileText, label: 'Invoices', path: '/invoices' },
        { icon: ClipboardList, label: 'Orders', path: '/work-orders' },
        { icon: Wallet, label: 'Wallet', path: '/wallet' },
        { icon: Receipt, label: 'Expenses', path: '/expenses' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: List, label: 'Sales', path: '/transactions' },
        { icon: Briefcase, label: 'Services', path: '/services' },
        { icon: Users, label: 'Customers', path: '/customers' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                    <item.icon size={18} className="bottom-nav-icon" />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
