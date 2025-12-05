import { Scraper } from './lib/scrapers/types';
import { AlzaScraper } from './lib/scrapers/alza';
import { AlbiScraper } from './lib/scrapers/albi';
import { MegaknihyScraper } from './lib/scrapers/megaknihy';
import { PlanetaHerScraper } from './lib/scrapers/planetaher';
import { SvetHerScraper } from './lib/scrapers/svether';
import { FuntasticScraper } from './lib/scrapers/funtastic';
import { NekonecnoScraper } from './lib/scrapers/nekonecno';
import { RerollScraper } from './lib/scrapers/reroll';
import { ImagoCZScraper } from './lib/scrapers/imago_cz';
import { VeselyDrakScraper } from './lib/scrapers/vesely_drak';
import { HrasScraper } from './lib/scrapers/hras';
import { GorilaScraper } from './lib/scrapers/gorila';
import { DracikScraper } from './lib/scrapers/dracik';
import { IhryskoScraper } from './lib/scrapers/ihrysko';
import { TlamaGamesScraper } from './lib/scrapers/tlamagames';
import { DeskolandScraper } from './lib/scrapers/deskoland';
import { LudopolisScraper } from './lib/scrapers/ludopolis';
import { HryDoRukyScraper } from './lib/scrapers/hrydoruky';
import { SvetDeskovychHerScraper } from './lib/scrapers/svet_deskovych_her';
import { TabletopScraper } from './lib/scrapers/tabletop';
import { OdhryScraper } from './lib/scrapers/odhry';
import { CechHracuScraper } from './lib/scrapers/cechhracu';
import { FyftScraper } from './lib/scrapers/fyft';
import { HrackyshopScraper } from './lib/scrapers/hrackyshop';
import { NadesceScraper } from './lib/scrapers/nadesce';
import { BohemianGamesScraper } from './lib/scrapers/bohemiangames';
import { MysiDoupeScraper } from './lib/scrapers/mysidoupe';
import { XzoneScraper } from './lib/scrapers/xzone';

// Map of results from user's screenshot
const userResults: Record<string, number> = {
    'Svět Her': 38,
    'Deskoland': 27,
    'TlamaGames': 24,
    'Hras': 21,
    'Gorila': 20,
    'Vesely Drak': 19,
    'Hry Do Ruky': 15,
    'Ludopolis': 14,
    'iHrysko': 14,
    'Svět deskovych her': 12,
    'Dráčik': 12,
    'Tabletop': 12,
    'Odhry': 9,
    'CechHracu': 7,
    'Fyft': 7,
    'Hrackyshop': 6,
    'Na Desce': 4,
    'Bohemian Games': 3,
    'Imago CZ': 3,
    'MysiDoupe': 1,
    'Xzone': 1,
    // Missing in screenshot
    'Alza': 0,
    'Albi': 0,
    'Megaknihy': 0,
    'Planeta Her': 0,
    'Funtastic': 0,
    'Nekonecno': 0,
    'Reroll': 0,
};

const scrapers: Scraper[] = [
    new AlzaScraper(),
    new AlbiScraper(),
    new MegaknihyScraper(),
    new PlanetaHerScraper(),
    new SvetHerScraper(),
    new FuntasticScraper(),
    new NekonecnoScraper(),
    new RerollScraper(),
    new ImagoCZScraper(),
    new VeselyDrakScraper(),
    new HrasScraper(),
    new GorilaScraper(),
    new DracikScraper(),
    new IhryskoScraper(),
    new TlamaGamesScraper(),
    new DeskolandScraper(),
    new LudopolisScraper(),
    new HryDoRukyScraper(),
    new SvetDeskovychHerScraper(),
    new TabletopScraper(),
    new OdhryScraper(),
    new CechHracuScraper(),
    new FyftScraper(),
    new HrackyshopScraper(),
    new NadesceScraper(),
    new BohemianGamesScraper(),
    new MysiDoupeScraper(),
    new XzoneScraper()
];

async function run() {
    console.log('Analyzing expected results for query "catan"...');
    console.log('------------------------------------------------');
    console.log('| Scraper | User (Actual) | Local (Expected) | Status |');
    console.log('|---------|---------------|------------------|--------|');

    let totalUser = 0;
    let totalExpected = 0;

    for (const scraper of scrapers) {
        try {
            const start = Date.now();
            const results = await scraper.search('catan');
            const duration = Date.now() - start;

            const userCount = userResults[scraper.name] || 0;
            const expectedCount = results.length;

            totalUser += userCount;
            totalExpected += expectedCount;

            let status = 'OK';
            if (userCount === 0 && expectedCount > 0) status = 'MISSING';
            else if (userCount < expectedCount * 0.5) status = 'LOW';
            else if (userCount > expectedCount * 1.5) status = 'HIGH';

            console.log(`| ${scraper.name.padEnd(15)} | ${userCount.toString().padEnd(13)} | ${expectedCount.toString().padEnd(16)} | ${status.padEnd(6)} | (${duration}ms)`);
        } catch (e) {
            console.log(`| ${scraper.name.padEnd(15)} | ${userResults[scraper.name] || 0} | ERROR            | FAIL   |`);
        }
    }

    console.log('------------------------------------------------');
    console.log(`Total User: ${totalUser}`);
    console.log(`Total Expected: ${totalExpected}`);
    console.log(`Gap: ${totalExpected - totalUser}`);
}

run();
