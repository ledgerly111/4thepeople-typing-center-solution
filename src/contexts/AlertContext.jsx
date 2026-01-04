import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = 'info') => {
        setAlert({ message, type });
    };

    const hideAlert = () => {
        setAlert(null);
    };

    // Expose a global alert function
    window.showAppAlert = showAlert;

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {alert && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '1rem'
                    }}
                    onClick={hideAlert}
                >
                    <div
                        style={{
                            background: 'var(--bg-card)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            maxWidth: '400px',
                            width: '100%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            animation: 'fadeIn 0.2s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: alert.type === 'success' ? 'rgba(34, 197, 94, 0.15)' :
                                    alert.type === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                                        alert.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' :
                                            'rgba(59, 130, 246, 0.15)',
                                flexShrink: 0
                            }}>
                                {alert.type === 'success' ? <CheckCircle size={24} style={{ color: 'var(--success)' }} /> :
                                    alert.type === 'error' ? <XCircle size={24} style={{ color: 'var(--danger)' }} /> :
                                        alert.type === 'warning' ? <AlertCircle size={24} style={{ color: '#f59e0b' }} /> :
                                            <Info size={24} style={{ color: '#3b82f6' }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem',
                                    color: 'var(--text-primary)',
                                    textTransform: 'capitalize'
                                }}>
                                    {alert.type}
                                </div>
                                <div style={{
                                    color: 'var(--text-muted)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5'
                                }}>
                                    {alert.message}
                                </div>
                            </div>
                            <button
                                onClick={hideAlert}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    padding: '0.25rem'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <button
                            onClick={hideAlert}
                            style={{
                                marginTop: '1.25rem',
                                width: '100%',
                                padding: '0.75rem',
                                border: 'none',
                                borderRadius: '8px',
                                background: 'var(--accent)',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
};

export default AlertProvider;
