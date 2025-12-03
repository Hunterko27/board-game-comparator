

async function testApi() {
    const query = 'catan';
    const url = `http://localhost:3000/api/search?q=${query}`;
    console.log(`Testing API: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const allResults: any[] = [];

        if (!reader) throw new Error('No response body');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const batch = JSON.parse(line);
                        allResults.push(...batch);
                    } catch (e) {
                        console.error('Error parsing JSON line:', e);
                    }
                }
            }
        }

        console.log(`Found ${allResults.length} results.`);

        const shops = new Set(allResults.map((item: any) => item.shopName));
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
