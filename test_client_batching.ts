import { spawn } from 'child_process';

const query = 'catan';
const totalBatches = 8;

async function testBatch(batchId: number) {
    const url = `http://localhost:3000/api/search?q=${query}&batchId=${batchId}&totalBatches=${totalBatches}`;
    console.log(`Testing Batch ${batchId}...`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let resultCount = 0;

        while (true) {
            const { done, value } = await reader?.read()!;
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                const data = JSON.parse(line);
                resultCount += data.length;
            }
        }

        console.log(`Batch ${batchId} finished. Found ${resultCount} results.`);
        return resultCount;
    } catch (error) {
        console.error(`Batch ${batchId} failed:`, error);
        return 0;
    }
}

async function runTest() {
    console.log('Starting parallel batch test...');
    const promises = [];
    for (let i = 0; i < totalBatches; i++) {
        promises.push(testBatch(i));
    }

    const results = await Promise.all(promises);
    const total = results.reduce((a, b) => a + b, 0);
    console.log(`Total results found: ${total}`);
}

runTest();
