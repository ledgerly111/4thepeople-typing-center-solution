import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, FileText, ClipboardList, List, Settings, BarChart3, Receipt } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Customers', path: '/customers' },
        { icon: Briefcase, label: 'Services', path: '/services' },
        { icon: FileText, label: 'Invoices', path: '/invoices' },
        { icon: ClipboardList, label: 'Work Orders', path: '/work-orders' },
        { icon: Receipt, label: 'Expenses', path: '/expenses' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: List, label: 'Transactions', path: '/transactions' },
        { icon: Settings, label: 'Settings', path: '/settings' },
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
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                Logged in as Admin
            </div>
        </aside>
    );
};

export default Sidebar;
