import React from 'react';
import Card from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Check } from 'lucide-react';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div>
            <h2 style={{ marginBottom: '1rem' }}>Settings</h2>

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
        </div>
    );
};

export default Settings;
