import { SearchResult } from '@/lib/scrapers/types';

interface SidebarProps {
    results: SearchResult[];
}

export default function Sidebar({ results }: SidebarProps) {
    // Calculate counts per shop
    const shopCounts = results.reduce((acc, result) => {
        acc[result.shopName] = (acc[result.shopName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedShops = Object.entries(shopCounts).sort((a, b) => b[1] - a[1]);
    const totalResults = results.length;

    if (totalResults === 0) {
        return null;
    }

    return (
        <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow-md sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Results Summary</h2>
                <div className="mb-4">
                    <div className="flex justify-between items-center font-semibold">
                        <span>Total</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {totalResults}
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    {sortedShops.map(([shopName, count]) => (
                        <div key={shopName} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{shopName}</span>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                {count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
