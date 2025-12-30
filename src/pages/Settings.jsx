import React from 'react';
import Card from '../components/ui/Card';
import { useTheme, ACCENT_COLORS } from '../contexts/ThemeContext';
import { Sun, Moon, Palette, Check } from 'lucide-react';

const Settings = () => {
    const { theme, toggleTheme, accentColor, changeAccentColor } = useTheme();

    return (
        <div>
            <h2 style={{ marginBottom: '1rem' }}>Settings</h2>

            {/* Theme Mode */}
            <Card title="Theme Mode">
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => theme !== 'light' && toggleTheme()}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem',
                            border: `2px solid ${theme === 'light' ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: '12px',
                            backgroundColor: theme === 'light' ? 'var(--bg-accent)' : 'transparent',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontWeight: '600'
                        }}
                    >
                        <Sun size={24} />
                        Light
                        {theme === 'light' && <Check size={16} style={{ color: 'var(--accent)' }} />}
                    </button>
                    <button
                        onClick={() => theme !== 'dark' && toggleTheme()}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem',
                            border: `2px solid ${theme === 'dark' ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: '12px',
                            backgroundColor: theme === 'dark' ? 'var(--bg-accent)' : 'transparent',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontWeight: '600'
                        }}
                    >
                        <Moon size={24} />
                        Dark
                        {theme === 'dark' && <Check size={16} style={{ color: 'var(--accent)' }} />}
                    </button>
                </div>
            </Card>

            {/* Accent Color */}
            <Card title="Accent Color" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Palette size={18} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Choose your preferred accent color
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {ACCENT_COLORS.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => changeAccentColor(color.value)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem',
                                border: `2px solid ${accentColor === color.value ? color.value : 'var(--border)'}`,
                                borderRadius: '10px',
                                backgroundColor: accentColor === color.value ? `${color.light}` : 'transparent',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: color.value,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {accentColor === color.value && <Check size={16} color="white" />}
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: accentColor === color.value ? color.value : 'var(--text-secondary)'
                            }}>
                                {color.name}
                            </span>
                        </button>
                    ))}
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
