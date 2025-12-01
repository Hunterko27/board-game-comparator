

async function testApi() {
    const query = 'catan';
    const url = `http://localhost:3000/api/search?q=${query}`;
    console.log(`Testing API: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        const data = await response.json();
        console.log(`Found ${data.length} results.`);

        const shops = new Set(data.map((item: any) => item.shopName));
        console.log('Shops found:', Array.from(shops));

        if (shops.has('Nekonecno')) {
            console.log('SUCCESS: Nekonecno results found in API response.');
        } else {
            console.error('FAILURE: Nekonecno results NOT found in API response.');
        }

    } catch (error) {
        console.error('Error testing API:', error);
    }
}

testApi();
