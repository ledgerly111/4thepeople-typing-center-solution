import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, ClipboardList, List, Briefcase, Users, Settings, BarChart3, Receipt, Wallet, Zap } from 'lucide-react';

const BottomNav = () => {
    const navItems = [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: Zap, label: 'Quick', path: 'quick-create' },
        { icon: FileText, label: 'Invoices', path: 'invoices' },
        { icon: BarChart3, label: 'Reports', path: 'reports' },
        { icon: Settings, label: 'Settings', path: 'settings' },
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
