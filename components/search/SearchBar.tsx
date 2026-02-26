'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    const handleSearch = (searchQuery: string) => {
        if (searchQuery.trim()) {
            const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem('recentSearches', JSON.stringify(updated));

            const params = new URLSearchParams();
            params.set('search', searchQuery.trim());
            params.set('page', '1');

            router.push(`/cars?${params.toString()}`);
            setQuery('');
            setShowDropdown(false);
            inputRef.current?.blur();
        }
    };

    const clearSearch = () => {
        setQuery('');
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const removeRecentSearch = (searchToRemove: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s !== searchToRemove);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    return (
        <div className="relative w-full max-w-2xl" ref={dropdownRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(query);
                        }
                    }}
                    placeholder="Kërko sipas markës, modelit... (p.sh. Audi A6)"
                    className="w-full px-6 py-3 bg-surface-2/90 border border-medium rounded-lg 
                             focus:outline-none focus:border-ferrari-red focus:ring-1 focus:ring-ferrari-red/50
                             text-primary placeholder:text-muted pr-24 transition-all"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-12 top-3 text-muted hover:text-ferrari-red transition"
                    >
                        <X size={20} />
                    </button>
                )}
                <button
                    onClick={() => handleSearch(query)}
                    disabled={!query.trim()}
                    className="absolute right-3 top-3 text-muted hover:text-ferrari-red transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Search size={20} />
                </button>
            </div>

            {showDropdown && recentSearches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-elevated rounded-xl shadow-xl border border-medium p-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-xs font-medium text-muted px-3 py-2">Kërkimet e fundit</p>
                    {recentSearches.map((search, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between group hover:bg-surface-2 rounded-lg px-2"
                        >
                            <button
                                onClick={() => handleSearch(search)}
                                className="flex-1 text-left px-2 py-2.5 transition"
                            >
                                <span className="text-secondary group-hover:text-ferrari-red">{search}</span>
                            </button>
                            <button
                                onClick={(e) => removeRecentSearch(search, e)}
                                className="p-1.5 text-muted hover:text-error-text transition opacity-0 group-hover:opacity-100 rounded-lg hover:bg-error-bg"
                                title="Hiq nga kërkimet e fundit"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}