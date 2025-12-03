'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Sidebar from './components/Sidebar';
import BackToTop from './components/BackToTop';
import { SearchResult } from '@/lib/scrapers/types';

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string, exact: boolean) => {
    setIsLoading(true);
    setError('');
    setResults([]);
    setHasSearched(false);

    try {
      setHasSearched(true);

      // Split scrapers into 32 batches to prevent server timeouts
      const TOTAL_BATCHES = 32;
      const batchPromises = [];

      for (let i = 0; i < TOTAL_BATCHES; i++) {
        batchPromises.push((async () => {
          try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&exact=${exact}&batchId=${i}&totalBatches=${TOTAL_BATCHES}`);
            if (!response.ok) throw new Error(`Batch ${i} failed`);
            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (!line.trim()) continue;
                try {
                  const newResults: SearchResult[] = JSON.parse(line);
                  setResults(prev => {
                    const combined = [...prev, ...newResults];
                    return combined.sort((a, b) => {
                      const priceA = a.currency === 'CZK' ? a.price * 0.04 : a.price;
                      const priceB = b.currency === 'CZK' ? b.price * 0.04 : b.price;
                      return priceA - priceB;
                    });
                  });
                } catch (e) {
                  console.error('Error parsing JSON line:', e);
                }
              }
            }
          } catch (err) {
            console.error(`Error in batch ${i}:`, err);
          }
        })());
      }

      await Promise.all(batchPromises);

    } catch (err) {
      setError('Some results might be missing. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'url(/bg-boardgames.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Board Game Price Comparator
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Find the best deals for your favorite board games across Slovak and Czech e-shops.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="text-center text-red-600 mb-8">
            {error}
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && !error && (
          <div className="text-center text-gray-600 mt-8">
            <p className="text-xl">No results found for your search.</p>
            <p className="mt-2">Try checking your spelling or using different keywords.</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start gap-8">
          {results.length > 0 && <Sidebar results={results} />}
          <SearchResults results={results} />
        </div>

        <BackToTop />
      </div>
    </main>
  );
}
