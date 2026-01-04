import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import logo from '../../assets/4tplogo.svg';

const Header = () => {
    return (
        <header className="header">
            <div className="header-left">
                <img src={logo} alt="4TP Logo" className="header-logo" style={{ height: '56px', width: 'auto' }} />
                <span className="header-title">4 The People</span>
            </div>

            {/* Quick Create Button */}
            <Link
                to="/dashboard/quick-create"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
                    transition: 'all 0.2s ease'
                }}
                title="Quick Create"
            >
                <Plus size={24} />
            </Link>
        </header>
    );
};

export default Header;
