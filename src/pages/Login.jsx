import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        setLoading(true);

        try {
            const { data, error: signInError } = await signIn(email, password);
            if (signInError) {
                setError(signInError.message);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            padding: '1rem'
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--accent)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: 'white'
                    }}>
                        4TP
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>4 The People</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
                        Typing Center Management
                    </p>
                </div>

                <Card>
                    <h2 style={{ margin: '0 0 1.5rem', textAlign: 'center' }}>
                        Welcome Back
                    </h2>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'var(--danger)',
                            color: 'white',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                    }}>
                        Contact your administrator if you need an account.
                    </div>
                </Card>

                <p style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    marginTop: '2rem'
                }}>
                    © 2025 4 The People. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
