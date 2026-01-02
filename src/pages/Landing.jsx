import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Wallet, FileCheck, CheckCircle } from 'lucide-react';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/dashboard'); // Bypassing login for now - goes directly to dashboard
    };

    const features = [
        {
            icon: <Zap size={32} />,
            title: 'Lightning Quick Create',
            description: 'Scan Emirates ID and create invoices in seconds. Auto-extract customer data with AI-powered OCR.',
            image: '/landing/quick_create_feature_1767383108836.png'
        },
        {
            icon: <Shield size={32} />,
            title: 'AI Document Verification',
            description: 'Detect fraud, extract data, and ensure compliance with ICP/GDRFA requirements before submission.',
            image: '/landing/ai_verification_feature_1767383124490.png'
        },
        {
            icon: <BarChart3 size={32} />,
            title: 'Smart Reports & Analytics',
            description: 'Real-time insights into revenue, profits, expenses, and tax. Make informed business decisions.',
            image: '/landing/reports_analytics_feature_1767383142238.png'
        },
        {
            icon: <Wallet size={32} />,
            title: 'Wallet & Cash Management',
            description: 'Track expenses, manage cash flow, and monitor government fees all in one place.',
            image: '/landing/wallet_management_feature_1767383159203.png'
        }
    ];

    const benefits = [
        'Reduce invoice creation time by 90%',
        'Eliminate government portal rejections',
        '5% VAT calculation built-in',
        'Work Orders & Customer Management',
        'Multi-payment method support',
        'Real-time profit tracking'
    ];

    return (
        <div className="landing">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="logo-large">
                            <div className="sidebar-logo">4TP</div>
                            <span className="logo-subtitle">For The People</span>
                        </div>
                        <h1 className="hero-title">
                            The Ultimate ERP for<br />
                            <span className="gradient-text">UAE Typing Centers</span>
                        </h1>
                        <p className="hero-description">
                            Stop wasting time on manual data entry. Scan documents, create invoices instantly,
                            verify compliance with AI, and manage your entire typing center from one powerful platform.
                        </p>
                        <div className="hero-cta">
                            <button className="cta-button primary" onClick={handleLogin}>
                                Get Started <ArrowRight size={20} />
                            </button>
                            <button className="cta-button secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                                See Features
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <div className="stat-number">90%</div>
                                <div className="stat-label">Faster Invoicing</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">100%</div>
                                <div className="stat-label">Compliance Ready</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">Cloud Access</div>
                            </div>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src="/landing/hero_typing_center_1767383088966.png" alt="Modern Typing Center" />
                        <div className="floating-card card-1">
                            <FileCheck size={20} style={{ color: 'var(--success)' }} />
                            <span>Invoice Created</span>
                        </div>
                        <div className="floating-card card-2">
                            <Shield size={20} style={{ color: 'var(--accent)' }} />
                            <span>AI Verification</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <div className="section-header">
                    <h2>Everything You Need to Run Your Typing Center</h2>
                    <p>Powerful features designed specifically for UAE typing centers</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="feature-image">
                                <img src={feature.image} alt={feature.title} />
                            </div>
                            <div className="feature-content">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits">
                <div className="benefits-container">
                    <div className="benefits-text">
                        <h2>Why Typing Centers Choose 4TP</h2>
                        <p className="benefits-subtitle">
                            Built by typing center owners, for typing center owners.
                            Every feature solves a real problem you face daily.
                        </p>
                        <ul className="benefits-list">
                            {benefits.map((benefit, index) => (
                                <li key={index}>
                                    <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="cta-button primary" onClick={handleLogin}>
                            Start Your Free Trial <ArrowRight size={20} />
                        </button>
                    </div>
                    <div className="benefits-visual">
                        <div className="benefit-card">
                            <div className="benefit-number">2.5s</div>
                            <div className="benefit-label">Average Invoice Creation</div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-number">Zero</div>
                            <div className="benefit-label">Manual Data Entry</div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-number">AED</div>
                            <div className="benefit-label">Multi-Currency Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="final-cta">
                <div className="cta-container">
                    <h2>Ready to Transform Your Typing Center?</h2>
                    <p>Join typing centers across the UAE and streamline your operations today</p>
                    <button className="cta-button primary large" onClick={handleLogin}>
                        Get Started Now <ArrowRight size={24} />
                    </button>
                    <p className="cta-note">No credit card required • UAE-focused features • 24/7 support</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="sidebar-logo">4TP</div>
                        <p>For The People</p>
                        <p className="footer-tagline">The Ultimate ERP for UAE Typing Centers</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-section">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#" onClick={handleLogin}>Login</a>
                        </div>
                        <div className="footer-section">
                            <h4>Support</h4>
                            <a href="#">Documentation</a>
                            <a href="#">Contact Us</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 4TP. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
