export interface SearchResult {
    name: string;
    price: number;
    currency: string;
    availability: string;
    link: string;
    shopName: string;
    shippingCost?: number;
    imageUrl?: string;
}

export interface Scraper {
    name: string;
    search(query: string): Promise<SearchResult[]>;
}
