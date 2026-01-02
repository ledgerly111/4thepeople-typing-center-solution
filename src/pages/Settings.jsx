import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Sun, Moon, Check, Receipt, ReceiptText, AlertTriangle, LogOut } from 'lucide-react';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { taxEnabled, toggleTax, TAX_RATE } = useStore();
    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [pendingTaxValue, setPendingTaxValue] = useState(null);

    const handleTaxToggle = (newValue) => {
        // If user is trying to change the current setting, show confirmation
        if (newValue !== taxEnabled) {
            setPendingTaxValue(newValue);
            setShowConfirmModal(true);
        }
    };

    const confirmTaxChange = () => {
        toggleTax(pendingTaxValue);
        setShowConfirmModal(false);
        setPendingTaxValue(null);
    };

    const cancelTaxChange = () => {
        setShowConfirmModal(false);
        setPendingTaxValue(null);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1rem' }}>Settings</h2>

            {/* Tax / VAT Setting */}
            <Card title="Tax / VAT (5%)" style={{ marginBottom: '1rem' }}>
                {/* Warning Alert */}
                <div style={{
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid var(--warning)',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'flex-start'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: 'var(--warning)' }}>
                            Warning: Global Setting
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            This affects ALL invoices, receipts, and reports system-wide. When disabled, no tax will be calculated on any service fees.
                        </p>
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        When enabled, 5% VAT will be applied to service fees on all invoices.
                        Government fees are always 0% VAT (pass-through).
                    </p>
                </div>

                {/* Button Group - Simplified */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        type="button"
                        onClick={() => handleTaxToggle(true)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem',
                            border: `2px solid ${taxEnabled ? 'var(--success)' : 'var(--border)'}`,
                            borderRadius: '12px',
                            backgroundColor: taxEnabled ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                            cursor: 'pointer',
                            color: taxEnabled ? 'var(--success)' : 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            fontSize: '1rem'
                        }}
                    >
                        <Receipt size={28} />
                        VAT Enabled
                        <span style={{ fontSize: '0.75rem', fontWeight: '400' }}>5% on Service Fees</span>
                        {taxEnabled && <Check size={18} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTaxToggle(false)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem',
                            border: `2px solid ${!taxEnabled ? 'var(--warning)' : 'var(--border)'}`,
                            borderRadius: '12px',
                            backgroundColor: !taxEnabled ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                            cursor: 'pointer',
                            color: !taxEnabled ? 'var(--warning)' : 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            fontSize: '1rem'
                        }}
                    >
                        <ReceiptText size={28} />
                        VAT Disabled
                        <span style={{ fontSize: '0.75rem', fontWeight: '400' }}>No Tax Applied</span>
                        {!taxEnabled && <Check size={18} />}
                    </button>
                </div>
            </Card>

            {/* Theme Mode */}
            <Card title="Theme">
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => theme !== 'light' && toggleTheme()}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem',
                            border: `2px solid ${theme === 'light' ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: '12px',
                            backgroundColor: theme === 'light' ? 'var(--bg-accent)' : 'transparent',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Sun size={28} />
                        Light
                        {theme === 'light' && <Check size={18} style={{ color: 'var(--accent)' }} />}
                    </button>
                    <button
                        onClick={() => theme !== 'dark' && toggleTheme()}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.25rem',
                            border: `2px solid ${theme === 'dark' ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: '12px',
                            backgroundColor: theme === 'dark' ? 'var(--bg-accent)' : 'transparent',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Moon size={28} />
                        Dark
                        {theme === 'dark' && <Check size={18} style={{ color: 'var(--accent)' }} />}
                    </button>
                </div>
            </Card>

            {/* Logout Section */}
            <Card title="Account" style={{ marginTop: '1rem' }}>
                <Button
                    variant="secondary"
                    onClick={() => setShowLogoutModal(true)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <LogOut size={18} />
                    Logout
                </Button>
            </Card>

            {/* About */}
            <Card title="About" style={{ marginTop: '1rem' }}>
                <div style={{ color: 'var(--text-secondary)' }}>
                    <p style={{ margin: 0 }}><strong>4 The People</strong> (4TP)</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Typing Center Management System</p>
                    <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Version 1.0.0 • Built with React + Vite
                    </p>
                </div>
            </Card>

            {/* Tax Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={cancelTaxChange}
                title="Confirm Tax Setting Change"
            >
                <div style={{ padding: '1rem' }}>
                    <p style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
                        {pendingTaxValue
                            ? 'Enable 5% VAT on all service fees? This will affect all future invoices and reports.'
                            : 'Disable VAT completely? No tax will be calculated on any service fees.'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={cancelTaxChange}>
                            Cancel
                        </Button>
                        <Button onClick={confirmTaxChange}>
                            Confirm Change
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Confirm Logout"
            >
                <div style={{ padding: '1rem' }}>
                    <p style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
                        Are you sure you want to logout? You'll be redirected to the landing page.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleLogout}>
                            Yes, Logout
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
