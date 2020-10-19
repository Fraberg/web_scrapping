const puppeteer = require('puppeteer');
const fs        = require('fs');
const config    = require('./config.json');
const cookies   = require('./cookies.json');


// const firefoxOptions = {
//     product: 'firefox',
//     extraPrefsFirefox: {
//         // Enable additional Firefox logging from its protocol implementation
//         // 'remote.log.level': 'Trace',
//     },
//     // Make browser logs visible
//     dumpio: true,
// };
  
(async () => {

    /* */
    let browser = await puppeteer.launch({ headless: false });
    // let browser = await puppeteer.launch(firefoxOptions, { headless: false });
    let page = await browser.newPage();

    /* */
    // if (Object.keys(cookies).length) {

    //     /* */
    //     await page.setCookie(...cookies);

    //     /* */
    //     await page.goto('https://www.linkedin.com/uas/login?', { waitUntil: 'networkidle2' });

    // } else {

        /* */
        await page.goto('https://www.linkedin.com/uas/login?', { waitUntil: 'networkidle0' });

        /* */
        await page.type('#username', config.mail, { delay: 30 });
        await page.type('#password', config.password, { delay: 30 });

        /* */
        // await page.click('#submit');
        
        await Promise.all([
            await page.click('#app__container > main > div:nth-child(3) > form > div.login__form_action_container > button')
        ]);

        /* */
        await page.waitForNavigation({ waitUntil: 'networkidle0'});
        await page.waitFor(15000);

        try {
            console.log("trying to login ...");
            await page.waitFor('#global-nav');            
            console.log("successfully logged in");
        } catch (error) {
            console.log("failed to login");
            process.exit(0);
        }

        /* */
        let currentCookies = await page.cookies();

        /* */
        fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));
        
    // }
    
    // debugger

})();