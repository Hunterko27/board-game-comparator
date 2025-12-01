# Board Game Comparator

A Next.js application to compare board game prices across multiple Slovak e-shops.

## Supported Shops
- iHrysko.sk
- Ludopolis.sk
- Funtastic.sk
- Megaknihy.sk
- Albi.sk
- Hrackyshop.sk
- Vesely-drak.sk
- Dracik.sk
- Imago.cz (sk version)
- Nekonecno.sk
- Gorila.sk
- Xzone.sk
- Alza.sk

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

### Running Tests

To run the full suite of scraper tests:
```bash
npx ts-node --project tsconfig.test.json test_all_scrapers.ts
```
