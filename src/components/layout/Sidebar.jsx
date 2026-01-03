import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, FileText, ClipboardList, Receipt, BarChart3, List, Wallet, Settings, Zap, Shield, User, Truck } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' }, // Absolute path to dashboard
        { icon: Zap, label: 'Quick Create', path: 'quick-create' },
        { icon: Users, label: 'Customers', path: 'customers' },
        { icon: Truck, label: 'Suppliers', path: 'suppliers' },
        { icon: Briefcase, label: 'Services', path: 'services' },
        { icon: FileText, label: 'Invoices', path: 'invoices' },
        { icon: ClipboardList, label: 'Work Orders', path: 'work-orders' },
        { icon: Shield, label: 'AI Verify', path: 'ai-verify' },
        { icon: Wallet, label: 'Wallet', path: 'wallet' },
        { icon: Receipt, label: 'Expenses', path: 'expenses' },
        { icon: BarChart3, label: 'Reports', path: 'reports' },
        { icon: List, label: 'Transactions', path: 'transactions' },
        { icon: Settings, label: 'Settings', path: 'settings' },
    ];





    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">4TP</div>
                <div className="sidebar-version">4 The People</div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'} // Only match exactly for Dashboard
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div className="sidebar-user">
                <div className="user-avatar">
                    <User size={20} />
                </div>
                <div className="user-info">
                    <div className="user-name">Typing Center</div>
                    <div className="user-role">Administrator</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
