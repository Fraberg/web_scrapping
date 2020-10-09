const puppeteer = require('puppeteer');

async function scrapeProduct(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const [el] = await page.$x('//*[@id="main-image"]');
    const src = await el.getProperty('src');
    const srcTxt = await src.jsonValue();
    
    const [el2] = await page.$x('//*[@id="productTitle"]');
    const txt = await el2.getProperty('textContent');
    const txtTxt = await txt.jsonValue();

    console.log({txtTxt});

    browser.close();
}

scrapeProduct('https://www.amazon.fr/Black-Swan-Second-Improbable-Robustness/dp/B07KRMZ5JD/ref=sr_1_1?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&dchild=1&keywords=black+swan+second+edition&qid=1602254750&s=audible&sr=1-1');