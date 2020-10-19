'use strict'

const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('./config.json');
// read
const xlsxFile = require('read-excel-file/node');
// write
const Excel = require('exceljs')
let workbook = new Excel.Workbook()
let worksheet = workbook.addWorksheet('links')
// color
const chalk = require('chalk');

worksheet.columns = [
    { header: 'Name', key: 'name' },
    { header: 'Site', key: 'site' },
    { header: 'Linkedin', key: 'linkedin' },
    { header: 'Taille', key: 'taille' },
    { header: 'Comptes', key: 'comptes' }
]

let urls = [];

// 1. get urls
(async () => {
    await xlsxFile('./levillagebyca_data.xlsx')
    .then((rows) => {
        for (var i = 1, len = rows.length; i < /*2*/len; i++) {
            console.log(rows[i][1]);
            urls.push(rows[i][1])
            worksheet.addRow({name: rows[i][0], site: rows[i][1], linkedin: "na", taille: "na", comptes: "na"});
        }
        console.table(urls);
        workbook.xlsx.writeFile('linkedin.xlsx');
    })
})();

// 2. goto(linkedin) once + goto(url) then fetch linkedin link
(async () => {
    
    /* -------------------------------- */
    let browser = await puppeteer.launch({
        args: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--window-size=1920x1080'] 
    });
    let page = await browser.newPage();

    /* */
    await page.goto('https://www.linkedin.com/uas/login?', { waitUntil: 'domcontentloaded' });

    /* */
    await page.type('#username', config.mail, { delay: 30 });
    await page.type('#password', config.password, { delay: 30 });
    
    await Promise.all([
        await page.click('#app__container > main > div:nth-child(3) > form > div.login__form_action_container > button')
    ]);

    /* */
    await page.waitForNavigation({ waitUntil: 'domcontentloaded'});
    await page.waitForTimeout(5000);

    try {
        console.log("trying to login ...");
        await page.waitFor('#global-nav');            
        console.log("successfully logged in");
    } catch (error) {
        console.log("failed to login");
        process.exit(0);
    }

    /* -------------------------------- */
    let row_index = 2;
    for (let url of urls) {

        console.log("\nscrapping company " + row_index - 1 + " : " + url);
        try {
            // catch if refused connection
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            // else continue
            try {
                try {
                    console.log(chalk.blue("    get hrefs inside page: " + url));
                    const hrefs = await page.evaluate(
                        () => Array.from(
                            document.querySelectorAll('a[href]'),
                            a => a.getAttribute('href')
                        )
                    );
                    // console.log(hrefs);

                    const cell_linkedin_link = worksheet.getCell('C' + row_index);
                    const cell_taille = worksheet.getCell('D' + row_index);
                    const cell_nb_employees = worksheet.getCell('E' + row_index);

                    let found = false;
                    for (var i = 0; i < hrefs.length; i++) {
                        if (hrefs[i].startsWith("https://www.linkedin.com/company/")) {

                            console.log(chalk.green("    found href linkedin: " + hrefs[i]));
                            found = true;
                            try {
                                cell_linkedin_link.value = hrefs[i];
                            } catch (error) {
                                console.log(chalk.red("    error hrefs[i]: " + error));
                            }

                            console.log("    browsing linkedin ...");
                            await page.goto(hrefs[i], { waitUntil: 'domcontentloaded' });
                            await page.waitForTimeout(3000);

                            // get elements innerText
                            try {
                                
                                let selector_taille = 'body > div.application-outlet > div.authentication-outlet > div > div.org-organization-page__container > div.org-grid.mt5 > div.org-grid__core-rail--wide.mb6 > div.org-grid__core-rail--no-margin-left > div:nth-child(1) > section > dl > dd.org-about-company-module__company-size-definition-text.t-14.t-black--light.mb1.fl';
                                
                                // if already present on page
                                try {
                                    await page.waitForSelector(selector_taille)
                                    await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
                                    await page.waitForTimeout(3000)
                                } catch (error) {
                                // if not present
                                    try {
                                        console.log("    clicking on tout voir button ...");
                                        await Promise.all([
                                            await page.click('#ember83'),
                                        ]);
                                        await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
                                        await page.waitForTimeout(3000)
                                    } catch (error) {
                                        console.log("    error to handle 1");
                                    }
                                    // ...
                                    try {
                                        console.log("    also clicking on other tout voir button ...");
                                        await Promise.all([
                                            await page.click('#ember85'),
                                        ]);
                                        await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
                                        await page.waitForTimeout(3000)
                                    } catch (error) {
                                        console.log("    error to handle 2");
                                    }
                                }

                                console.log("    searching for selector_taille");
                                let selector_taille = 'body > div.application-outlet > div.authentication-outlet > div > div.org-organization-page__container > div.org-grid.mt5 > div.org-grid__core-rail--wide.mb6 > div.org-grid__core-rail--no-margin-left > div:nth-child(1) > section > dl > dd.org-about-company-module__company-size-definition-text.t-14.t-black--light.mb1.fl';
                                try {
                                    await page.waitForSelector(selector_taille)
                                } catch (error) {
                                    console.log(chalk.red("    loading #ember85 ... " + error));
                                    await page.click('#ember85')
                                }
                                let taille = "";
                                try {
                                    const element_taille = await page.$(selector_taille)
                                    taille = await page.evaluate(el => el.textContent, element_taille)
                                    taille = taille.trim();
                                    console.log(chalk.green("    taille: " + taille));
                                    cell_taille.value = taille;
                                } catch (error) {
                                    console.log(chalk.red("    error taille: " + error));
                                }

                                console.log("    searching for selector_nb_employees");
                                let selector_nb_employees = 'body > div.application-outlet > div.authentication-outlet > div > div.org-organization-page__container > div.org-grid.mt5 > div.org-grid__core-rail--wide.mb6 > div.org-grid__core-rail--no-margin-left > div:nth-child(1) > section > dl > dd.org-page-details__employees-on-linkedin-count.t-14.t-black--light.mb5';
                                // await page.waitForSelector(selector_nb_employees)
                                let nb_employees = "";
                                try {
                                    const element_nb_employees = await page.$(selector_nb_employees)
                                    nb_employees = await page.evaluate(el => el.textContent, element_nb_employees)
                                    const searchTerm = 'Inclut des membres';
                                    const indexOfFirst = nb_employees.indexOf(searchTerm);
                                    if (indexOfFirst != -1) {
                                        nb_employees = nb_employees.substring(0, indexOfFirst - 1)
                                    }
                                    nb_employees = nb_employees.trim();
                                    console.log(chalk.green("    nb employee: " + nb_employees));
                                    cell_nb_employees.value = nb_employees;
                                } catch (error) {
                                    console.log(chalk.red("    error nb_employees: " + error));
                                }
                            } catch (error) {
                                console.log(chalk.red("    error getting elements: " + error));
                            }
                            try {
                                workbook.xlsx.writeFile('linkedin.xlsx');
                            } catch (error) {
                                console.log(chalk.red("    error writeFile: " + error));
                            }
                            break;
                        }
                    }
                    if (found === false) {
                        console.log(chalk.red("    no linkedin found"));
                    }
                    row_index += 1;

                } catch (error) {
                    console.log(chalk.red("    error while getting hrefs: " + error));
                    continue;
                }
            } catch (error) {
                console.log(chalk.red("    error while remaining: " + error));
                continue;
            }
        }
        catch (error) {
            console.log(chalk.red("    refused connection when page.goto(url): " + error));
            continue;
        }
    }

    await browser.close();
    process.exit(0);

})();