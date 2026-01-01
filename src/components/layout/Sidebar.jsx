import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Users, Briefcase, FileText, ClipboardList, List, Settings, BarChart3, Receipt, Shield, LogOut, Wallet } from 'lucide-react';

const Sidebar = () => {
    const { profile, isSuperAdmin, signOut } = useAuth();

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Customers', path: '/customers' },
        { icon: Briefcase, label: 'Services', path: '/services' },
        { icon: FileText, label: 'Invoices', path: '/invoices' },
        { icon: ClipboardList, label: 'Work Orders', path: '/work-orders' },
        { icon: Wallet, label: 'Wallet', path: '/wallet' },
        { icon: Receipt, label: 'Expenses', path: '/expenses' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: List, label: 'Transactions', path: '/transactions' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await signOut();
        }
    };

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
                <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    {profile?.full_name || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {profile?.role === 'super_admin' && '🛡️ Super Admin'}
                    {profile?.role === 'org_admin' && '👤 Admin'}
                    {profile?.role === 'staff' && '👷 Staff'}
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        width: '100%',
                        justifyContent: 'center'
                    }}
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
