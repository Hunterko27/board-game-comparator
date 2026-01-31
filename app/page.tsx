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
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const handleSearch = async (query: string, exact: boolean) => {
    setIsLoading(true);
    setError('');
    setResults([]);
    setHasSearched(false);

    // Split scrapers into 32 batches for maximum isolation (1 scraper per batch)
    const TOTAL_BATCHES = 32;
    const CONCURRENCY_LIMIT = 2; // Reduced to prevent resource exhaustion

    setProgress({ completed: 0, total: TOTAL_BATCHES });

    try {
      setHasSearched(true);
      let completedBatches = 0;

      const processBatch = async (batchId: number) => {
        try {
          let attempts = 0;
          const maxAttempts = 3;

          while (attempts <= maxAttempts) {
            try {
              const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&exact=${exact}&batchId=${batchId}&totalBatches=${TOTAL_BATCHES}`);

              if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`Status ${response.status}: ${text.slice(0, 100)}`);
              }

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
                    const data = JSON.parse(line);

                    if (data.type === 'error') {
                      console.warn(`Scraper Error [${data.scraper}]: ${data.message}`);
                      setError(prev => {
                        const errorLine = `[${data.scraper}]: ${data.message}`;
                        // Prevent duplicate error messages
                        if (prev.includes(errorLine)) return prev;
                        return prev ? `${prev} | ${errorLine}` : errorLine;
                      });
                      continue;
                    }

                    const newResults: SearchResult[] = data;
                    setResults(prev => {
                      const combined = [...prev, ...newResults];
                      const unique = Array.from(new Map(combined.map(item => [item.link, item])).values());
                      return unique.sort((a, b) => {
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

              return; // Success, exit retry loop

            } catch (err: any) {
              console.error(`Error in batch ${batchId} (Attempt ${attempts + 1}):`, err);

              if (attempts === maxAttempts) {
                setError(prev => prev ? `${prev} | Batch ${batchId}: ${err.message}` : `Error: ${err.message}`);
              }

              if (attempts < maxAttempts) {
                console.log(`Retrying batch ${batchId}...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
                attempts++;
              } else {
                break;
              }
            }
          }
        } finally {
          // Always increment progress, even if we return early on success
          setProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
        }
      };

      // Process batches in chunks to respect browser connection limits
      for (let i = 0; i < TOTAL_BATCHES; i += CONCURRENCY_LIMIT) {
        const chunk = [];
        for (let j = 0; j < CONCURRENCY_LIMIT && i + j < TOTAL_BATCHES; j++) {
          chunk.push(processBatch(i + j));
        }
        await Promise.all(chunk);
      }

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

        {/* Progress Indicator */}
        {isLoading && progress.total > 0 && (
          <div className="text-center mt-4 mb-4">
            <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-600">
              Searching... {progress.completed}/{progress.total} batches completed
            </div>
          </div>
        )}

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
