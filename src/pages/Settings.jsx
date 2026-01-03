import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Sun, Moon, Check, Receipt, ReceiptText, LogOut, Download, Smartphone, Monitor, Share } from 'lucide-react';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { taxEnabled, toggleTax, TAX_RATE } = useStore();
    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [pendingTaxValue, setPendingTaxValue] = useState(null);

    // PWA Install state
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Detect mobile
        const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(mobile);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Show the browser's install prompt
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsInstalled(true);
            }
            setDeferredPrompt(null);
        } else {
            // Show instructions modal
            setShowInstallModal(true);
        }
    };

    const handleTaxToggle = (newValue) => {
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

            {/* Install App Section */}
            <Card title="Install App" style={{ marginBottom: '1rem' }}>
                {isInstalled ? (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid var(--success)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <Check size={24} style={{ color: 'var(--success)' }} />
                        <div>
                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--success)' }}>App Installed!</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                You're using the installed version of 4TP ERP.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Install 4TP ERP as an app on your device for faster access and offline support.
                        </p>
                        <Button
                            onClick={handleInstallClick}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)'
                            }}
                        >
                            <Download size={20} />
                            {deferredPrompt ? 'Install App' : 'How to Install'}
                        </Button>
                    </>
                )}
            </Card>

            {/* Tax / VAT Setting */}
            <Card title="Tax / VAT (5%)" style={{ marginBottom: '1rem' }}>
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
                            This affects ALL invoices, receipts, and reports system-wide.
                        </p>
                    </div>
                </div>

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
            <Modal isOpen={showConfirmModal} onClose={cancelTaxChange} title="Confirm Tax Setting Change">
                <div style={{ padding: '1rem' }}>
                    <p style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
                        {pendingTaxValue
                            ? 'Enable 5% VAT on all service fees? This will affect all future invoices and reports.'
                            : 'Disable VAT completely? No tax will be calculated on any service fees.'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={cancelTaxChange}>Cancel</Button>
                        <Button onClick={confirmTaxChange}>Confirm Change</Button>
                    </div>
                </div>
            </Modal>

            {/* Logout Confirmation Modal */}
            <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Confirm Logout">
                <div style={{ padding: '1rem' }}>
                    <p style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
                        Are you sure you want to logout?
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
                        <Button onClick={handleLogout}>Yes, Logout</Button>
                    </div>
                </div>
            </Modal>

            {/* Install Instructions Modal */}
            <Modal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} title="Install 4TP ERP">
                <div style={{ padding: '1rem' }}>
                    {isIOS ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Smartphone size={24} style={{ color: 'var(--accent)' }} />
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>iPhone / iPad</h3>
                            </div>
                            <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                                <li>Tap the <strong>Share</strong> button <Share size={14} style={{ verticalAlign: 'middle' }} /> at the bottom of Safari</li>
                                <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                                <li>Tap <strong>"Add"</strong> in the top right corner</li>
                                <li>The app icon will appear on your home screen!</li>
                            </ol>
                        </>
                    ) : isMobile ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Smartphone size={24} style={{ color: 'var(--accent)' }} />
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Android Phone / Tablet</h3>
                            </div>
                            <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                                <li>Tap the <strong>menu icon</strong> (⋮) in Chrome</li>
                                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></li>
                                <li>Tap <strong>"Install"</strong> to confirm</li>
                                <li>The app will be installed like a regular app!</li>
                            </ol>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Monitor size={24} style={{ color: 'var(--accent)' }} />
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Desktop (Chrome / Edge)</h3>
                            </div>
                            <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                                <li>Look for the <strong>install icon</strong> (+) in the address bar</li>
                                <li>Or click the <strong>menu icon</strong> (⋮) and select <strong>"Install 4TP ERP"</strong></li>
                                <li>Click <strong>"Install"</strong> to confirm</li>
                                <li>The app will open in its own window!</li>
                            </ol>
                        </>
                    )}

                    <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'var(--bg-accent)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong>Benefits of installing:</strong>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                            <li>Launch from home screen or desktop</li>
                            <li>Works even with poor internet</li>
                            <li>Fullscreen experience (no browser bars)</li>
                            <li>Faster loading times</li>
                        </ul>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => setShowInstallModal(false)}
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        Got it!
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
