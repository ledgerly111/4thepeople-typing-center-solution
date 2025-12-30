import React from 'react';
import Card from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div>
            <h2 style={{ marginBottom: '1rem' }}>Settings</h2>

            <Card title="Appearance">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: '600' }}>Theme</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Switch between light and dark mode
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--bg-accent)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontWeight: '500'
                        }}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        {theme === 'light' ? 'Dark' : 'Light'}
                    </button>
                </div>
            </Card>

            <Card title="About" style={{ marginTop: '1rem' }}>
                <div style={{ color: 'var(--text-secondary)' }}>
                    <p><strong>4 The People</strong> (4TP)</p>
                    <p>Typing Center Management System</p>
                    <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Built with React + Vite
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
