// $ npm i node-fetch --save

const fetch = require("node-fetch");

var url = 'https://www.levillagebyca.com/index.php/fr/startups';

async function async_fetch_wrapper(url) {
    let ret = await fetch(url);
    console.log(ret);
    return ret;
}

async_fetch_wrapper(url);