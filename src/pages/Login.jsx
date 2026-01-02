import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hardcoded admin credentials
    const ADMIN_CREDENTIALS = {
        name: 'aadhilsalim',
        email: 'aadhila003@gmail.com',
        password: 'aadhilsalim@8089385071'
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if credentials match admin
        if (
            formData.name === ADMIN_CREDENTIALS.name &&
            formData.email === ADMIN_CREDENTIALS.email &&
            formData.password === ADMIN_CREDENTIALS.password
        ) {
            // Success! Navigate to Super Admin panel
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('adminName', formData.name);
            navigate('/dashboard/super-admin');
        } else {
            // Invalid credentials
            setError('Invalid credentials. Please check your name, email, and password.');
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    {/* Header */}
                    <div className="login-header">
                        <div className="login-logo">
                            <div className="sidebar-logo">4TP</div>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to access the admin panel</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="login-error">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="name">
                                <User size={18} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                <Mail size={18} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <Lock size={18} />
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-small" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <Shield size={18} />
                                    Sign In to Admin Panel
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="login-footer">
                        <p>4TP - For The People</p>
                        <p className="login-note">Super Admin Access Only</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
