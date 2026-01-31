import { SearchResult } from '@/lib/scrapers/types';

interface SearchResultsProps {
    results: SearchResult[];
}

export default function SearchResults({ results }: SearchResultsProps) {
    if (results.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="grid gap-4">
                {results.map((result, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-md flex items-start gap-4 hover:shadow-lg transition-shadow">
                        {result.imageUrl && (
                            <div className="w-24 h-24 flex-shrink-0">
                                <img src={result.imageUrl} alt={result.name} className="w-full h-full object-contain" />
                            </div>
                        )}
                        <div className="flex-grow">
                            <h3 className="text-lg font-semibold text-gray-800">
                                <a href={result.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                    {result.name}
                                </a>
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{result.shopName}</p>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${result.availability.toLowerCase().includes('skladom') || result.availability.toLowerCase().includes('na sklade')
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {result.availability}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                                {typeof result.price === 'number' && !isNaN(result.price) ? result.price.toFixed(2) : 'N/A'} {result.currency}
                                {result.currency === 'CZK' && (
                                    <span className="text-sm text-gray-500 ml-2 font-normal">
                                        (~ {(result.price * 0.04).toFixed(2)} EUR)
                                    </span>
                                )}
                            </div>
                            {result.shippingCost !== undefined && (
                                <div className="text-sm text-gray-500">+ {result.shippingCost.toFixed(2)} shipping</div>
                            )}
                            <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                            >
                                Visit Store
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
