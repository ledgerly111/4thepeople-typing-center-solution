import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, ClipboardList, List, Briefcase, Users, Settings, BarChart3, Receipt, Wallet, Zap, Shield } from 'lucide-react';

const BottomNav = () => {
    const navItems = [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: Zap, label: 'Quick', path: 'quick-create' },
        { icon: Users, label: 'Customers', path: 'customers' },
        { icon: Briefcase, label: 'Services', path: 'services' },
        { icon: FileText, label: 'Invoices', path: 'invoices' },
        { icon: ClipboardList, label: 'Orders', path: 'work-orders' },
        { icon: Shield, label: 'AI Verify', path: 'ai-verify' },
        { icon: Wallet, label: 'Wallet', path: 'wallet' },
        { icon: Receipt, label: 'Expenses', path: 'expenses' },
        { icon: BarChart3, label: 'Reports', path: 'reports' },
        { icon: List, label: 'Trans', path: 'transactions' },
        { icon: Settings, label: 'Settings', path: 'settings' },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard'}
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
