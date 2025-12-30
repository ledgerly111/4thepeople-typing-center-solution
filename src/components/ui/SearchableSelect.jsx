import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchableSelect = ({
    options = [],
    value,
    onChange,
    placeholder = 'Search...',
    displayKey = 'name',
    valueKey = 'id',
    renderOption,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    // Find selected option
    const selectedOption = options.find(opt => opt[valueKey] === value);

    // Filter options based on search
    const filteredOptions = options.filter(opt =>
        opt[displayKey].toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        onChange(option[valueKey]);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
    };

    return (
        <div ref={wrapperRef} className={`searchable-select ${className}`}>
            <div
                className="searchable-select-input"
                onClick={() => setIsOpen(true)}
            >
                {isOpen ? (
                    <input
                        type="text"
                        className="searchable-select-search"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                ) : (
                    <span className={selectedOption ? '' : 'searchable-select-placeholder'}>
                        {selectedOption ? selectedOption[displayKey] : placeholder}
                    </span>
                )}

                <div className="searchable-select-icons">
                    {value && !isOpen && (
                        <button className="searchable-select-clear" onClick={handleClear}>
                            <X size={16} />
                        </button>
                    )}
                    <Search size={16} className="searchable-select-icon" />
                </div>
            </div>

            {isOpen && (
                <div className="searchable-select-dropdown">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option[valueKey]}
                                className={`searchable-select-option ${option[valueKey] === value ? 'selected' : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                {renderOption ? renderOption(option) : option[displayKey]}
                            </div>
                        ))
                    ) : (
                        <div className="searchable-select-empty">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
