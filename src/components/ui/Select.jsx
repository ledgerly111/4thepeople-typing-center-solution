import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({
    options = [],
    value,
    onChange,
    placeholder = 'Select...',
    displayKey = 'label',
    valueKey = 'value'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Get selected option
    const selectedOption = options.find(opt =>
        typeof opt === 'object' ? opt[valueKey] === value : opt === value
    );

    const getDisplayValue = (option) => {
        if (!option) return placeholder;
        return typeof option === 'object' ? option[displayKey] : option;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        const newValue = typeof option === 'object' ? option[valueKey] : option;
        onChange(newValue);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="custom-select">
            <button
                type="button"
                className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedOption ? 'selected' : 'placeholder'}>
                    {getDisplayValue(selectedOption)}
                </span>
                <ChevronDown size={16} className={`custom-select-arrow ${isOpen ? 'rotate' : ''}`} />
            </button>

            <div className={`custom-select-dropdown ${isOpen ? 'show' : ''}`}>
                {options.map((option, index) => {
                    const optValue = typeof option === 'object' ? option[valueKey] : option;
                    const optLabel = typeof option === 'object' ? option[displayKey] : option;
                    const isSelected = optValue === value;

                    return (
                        <div
                            key={optValue || index}
                            className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {optLabel}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Select;
