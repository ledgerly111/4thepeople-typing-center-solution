import React from 'react';

const Card = ({ children, title, className = '', actions }) => {
    return (
        <div className={`card ${className}`}>
            {(title || actions) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
