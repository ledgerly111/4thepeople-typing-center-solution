import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Home, Users, Briefcase, FileText, ClipboardList, List, Settings, BarChart3, Receipt, Shield, LogOut, Wallet, Zap } from 'lucide-react';

const Sidebar = () => {
    const { profile, isSuperAdmin, signOut } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: Zap, label: 'Quick Create', path: '/quick-create' },
        { icon: Users, label: 'Customers', path: '/customers' },
        { icon: Briefcase, label: 'Services', path: '/services' },
        { icon: FileText, label: 'Invoices', path: '/invoices' },
        { icon: ClipboardList, label: 'Work Orders', path: '/work-orders' },
        { icon: Shield, label: 'AI Verify', path: '/ai-verify' },
        { icon: Wallet, label: 'Wallet', path: '/wallet' },
        { icon: Receipt, label: 'Expenses', path: '/expenses' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: List, label: 'Transactions', path: '/transactions' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        await signOut();
        localStorage.clear(); // Clear all stored data
        setShowLogoutModal(false);
        navigate('/'); // Redirect to landing page
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
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
                    onClick={handleLogoutClick}
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

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={showLogoutModal}
                onClose={cancelLogout}
                title="Confirm Logout"
            >
                <div style={{ padding: '1rem' }}>
                    <p style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
                        Are you sure you want to logout? You'll need to sign in again to access the dashboard.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={cancelLogout}>
                            Cancel
                        </Button>
                        <Button onClick={confirmLogout}>
                            Yes, Logout
                        </Button>
                    </div>
                </div>
            </Modal>
        </aside>
    );
};

export default Sidebar;
