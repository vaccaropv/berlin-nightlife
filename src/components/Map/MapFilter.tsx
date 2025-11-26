import { useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Check, Search, MapPin, Music, User } from 'lucide-react';
import { MOCK_VENUES, MOCK_EVENTS, Venue } from '../../data/mockData';
import './MapFilter.css';

export interface FilterState {
    queue: string[];
    doorPolicy: string[];
    price: string[];
    genre: string[];
    type: string[];
}

interface MapFilterProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onVenueSelect: (venue: Venue) => void;
}

const FILTER_OPTIONS = {
    queue: ['No Queue', 'Short', 'Medium', 'Long', 'Full'],
    doorPolicy: ['Relaxed', 'Standard', 'Strict', 'Very Strict'],
    price: ['< €15', '€15-25', '> €25'],
    genre: ['Techno', 'House', 'Disco', 'Industrial', 'Open Air', 'Fetish'],
    type: ['Club', 'Bar', 'Open Air']
};

interface Suggestion {
    type: 'venue' | 'artist' | 'genre' | 'neighborhood' | 'special';
    label: string;
    subLabel?: string;
    value: string;
    data?: any;
}

export default function MapFilter({ filters, onFilterChange, onVenueSelect }: MapFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const newSuggestions: Suggestion[] = [];

        // 1. Clubs
        MOCK_VENUES.forEach(venue => {
            if (venue.name.toLowerCase().includes(query) || venue.shortName?.toLowerCase().includes(query)) {
                newSuggestions.push({
                    type: 'venue',
                    label: venue.name,
                    subLabel: venue.type,
                    value: venue.id,
                    data: venue
                });
            }
        });

        // 2. Artists (from events)
        const artists = new Set<string>();
        MOCK_EVENTS.forEach(event => {
            event.lineup.forEach(artist => {
                if (artist.toLowerCase().includes(query)) {
                    artists.add(artist);
                }
            });
        });
        artists.forEach(artist => {
            newSuggestions.push({
                type: 'artist',
                label: artist,
                subLabel: 'Artist / DJ',
                value: artist
            });
        });

        // 3. Genres
        FILTER_OPTIONS.genre.forEach(genre => {
            if (genre.toLowerCase().includes(query)) {
                newSuggestions.push({
                    type: 'genre',
                    label: genre,
                    subLabel: 'Music Genre',
                    value: genre
                });
            }
        });

        // 4. Neighborhoods (Simple check)
        const neighborhoods = ['Friedrichshain', 'Kreuzberg', 'Mitte', 'Neukölln', 'Treptow'];
        neighborhoods.forEach(hood => {
            if (hood.toLowerCase().includes(query)) {
                newSuggestions.push({
                    type: 'neighborhood',
                    label: `${hood} clubs`,
                    subLabel: 'Neighborhood',
                    value: hood
                });
            }
        });

        // 5. Special
        if ('open until 6am'.includes(query)) {
            newSuggestions.push({
                type: 'special',
                label: 'Open until 6am',
                value: 'open_late'
            });
        }
        if ('free entry'.includes(query)) {
            newSuggestions.push({
                type: 'special',
                label: 'Free entry tonight',
                value: 'free_entry'
            });
        }

        setSuggestions(newSuggestions.slice(0, 8)); // Limit to 8 suggestions
    }, [searchQuery]);

    const handleSuggestionClick = (suggestion: Suggestion) => {
        setSearchQuery('');
        setShowSuggestions(false);

        if (suggestion.type === 'venue' && suggestion.data) {
            onVenueSelect(suggestion.data);
        } else if (suggestion.type === 'genre') {
            onFilterChange({ ...filters, genre: [suggestion.value] });
            setIsOpen(true); // Open filter panel to show applied filter
            setExpandedSection('genre');
        } else if (suggestion.type === 'special') {
            if (suggestion.value === 'free_entry') {
                onFilterChange({ ...filters, price: ['< €15'] });
                setIsOpen(true);
                setExpandedSection('price');
            }
            // Add more special logic here if needed
        }
        // For neighborhood/artist, we might need more complex filtering logic in App.tsx
        // For now, we'll just log it or maybe filter by text if we had a text filter
    };

    const toggleFilter = (category: keyof FilterState, value: string) => {
        const currentValues = filters[category];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        onFilterChange({
            ...filters,
            [category]: newValues
        });
    };

    const clearFilters = () => {
        onFilterChange({
            queue: [],
            doorPolicy: [],
            price: [],
            genre: [],
            type: []
        });
    };

    const activeFilterCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'venue': return <MapPin size={14} />;
            case 'artist': return <User size={14} />;
            case 'genre': return <Music size={14} />;
            default: return <Search size={14} />;
        }
    };

    return (
        <div className="map-controls-container">
            <div className="search-bar-container" ref={searchRef}>
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search clubs, artists, genre..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                    />
                    {searchQuery && (
                        <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown glass-panel">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={`${suggestion.type}-${suggestion.value}-${index}`}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <div className="suggestion-icon">
                                    {getIconForType(suggestion.type)}
                                </div>
                                <div className="suggestion-content">
                                    <span className="suggestion-label">{suggestion.label}</span>
                                    {suggestion.subLabel && <span className="suggestion-sublabel">{suggestion.subLabel}</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={`map-filter-container ${isOpen ? 'open' : ''}`}>
                <button
                    className={`filter-toggle-btn ${activeFilterCount > 0 ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Filter size={20} />
                    {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
                </button>

                {isOpen && (
                    <div className="filter-panel glass-panel">
                        <div className="filter-header">
                            <h3>Filter Map</h3>
                            <div className="filter-actions">
                                {activeFilterCount > 0 && (
                                    <button className="clear-btn" onClick={clearFilters}>
                                        Clear
                                    </button>
                                )}
                                <button className="close-btn" onClick={() => setIsOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="filter-content">
                            {Object.entries(FILTER_OPTIONS).map(([key, options]) => {
                                const category = key as keyof FilterState;
                                const isExpanded = expandedSection === category;
                                const selectedCount = filters[category].length;

                                return (
                                    <div key={category} className="filter-section">
                                        <button
                                            className="section-header"
                                            onClick={() => toggleSection(category)}
                                        >
                                            <span className="section-title">
                                                {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                {selectedCount > 0 && <span className="section-badge">{selectedCount}</span>}
                                            </span>
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {isExpanded && (
                                            <div className="section-options">
                                                {options.map(option => (
                                                    <button
                                                        key={option}
                                                        className={`option-chip ${filters[category].includes(option) ? 'selected' : ''}`}
                                                        onClick={() => toggleFilter(category, option)}
                                                    >
                                                        {filters[category].includes(option) && <Check size={12} />}
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
