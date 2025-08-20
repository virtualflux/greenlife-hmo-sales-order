import { useState, useRef, useEffect } from 'react';

const SearchableDropdown = ({
    data,
    isLoading = false,
    onSelect,
    placeholder = "Select an item",
    loadingText = "Loading...",
    noOptionsText = "No options available", disabled = false
}: {
    data: { name: string; value: any }[]; isLoading?: boolean; onSelect: (value: { name: string; value: any }) => void;
    placeholder?: string;
    loadingText?: string;
    noOptionsText?: string;
    disabled?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState({ name: "", value: "" });
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on search term
    const filteredOptions = data
        ? data.filter(option =>
            option.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (option: { name: string; value: any }) => {
        const pickedOption = data.find(item => item.value == option.value)
        if (pickedOption) {
            setSelectedOption(pickedOption);
        }
        setSearchTerm('');
        setIsOpen(false);
        if (onSelect) {
            onSelect(option);
        }
    };

    useEffect(() => {
        if (disabled && isOpen) {
            setIsOpen(false);
        }
    }, [disabled, isOpen]);

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Dropdown toggle */}
            <div
                className={`flex items-center justify-between p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${disabled
                    ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                    : 'bg-white cursor-pointer text-gray-800 hover:border-gray-400'
                    }`}
                onClick={handleToggle}
            >
                <span className={selectedOption ? "text-gray-800" : "text-gray-500"}>
                    {selectedOption.name ? selectedOption.name : placeholder}
                </span>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-primary border border-gray-300 rounded-md shadow-lg">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-200">
                        <input
                            type="text"
                            className="w-full p-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Options list */}
                    <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-3 text-center text-gray-500">{loadingText}</div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">{noOptionsText}</div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className="p-3 cursor-pointer hover:bg-blue-50 transition-colors"
                                    onClick={() => handleSelect(option)}
                                >
                                    <div className="font-medium text-gray-800">{option.name}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;