import React from 'react';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    type = 'button',
    disabled = false,
    ...props
}) => {
    const variantClass = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        icon: 'btn-icon',
    }[variant] || 'btn-primary';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
