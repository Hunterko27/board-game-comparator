'use client';

import { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string, exact: boolean) => void;
    isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [exact, setExact] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query, exact);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center mb-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a board game..."
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={isLoading}
                    suppressHydrationWarning
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="exact-match"
                    checked={exact}
                    onChange={(e) => setExact(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <label htmlFor="exact-match" className="text-sm text-gray-700 select-none cursor-pointer">
                    Exact match (strict filter)
                </label>
            </div>
        </form>
    );
}
