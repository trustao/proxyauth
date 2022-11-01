const puppeteer = require('puppeteer');
const utils = require('./utils');
const logger = require('./logger');
const cookieStore = require('./cookie')
const {equalHost} = require("./utils");
const {wait} = utils;

const puppeteerCfg = {headless: true, defaultViewport: {width: 1024, height: 800}};

async function openPage(url, browser, beforeLoad = async page => null) {
    if (!browser) {
        logger.info('Open Browser');
    }
    browser = browser || await puppeteer.launch(puppeteerCfg);
    try {
        const page = await browser.newPage();
        logger.info('Open Page')
        try {
            const loadInfo = typeof beforeLoad === 'function' && beforeLoad(page);
            if (loadInfo instanceof Promise) {
                await loadInfo;
            }
            logger.info('Navigation Start')
            await page.goto(url, {waitUntil: "domcontentloaded"});
            return {page, browser};
        } catch (e) {
            logger.error(e)
            await page.close();
            await browser.close();
        }
    } catch (e) {
        logger.error(e)
        await browser.close();
    }
}

async function tryGetPuppeteerElement(parent, selector, stopRetry = 30, stepWait = 500) {
    if (!parent || !selector) {
        return
    }
    let i = 0;
    while (true) {
        await wait(stepWait);
        if (await runStopTry(i, stopRetry)) {
            return;
        }
        const element = await parent.$(selector);
        logger.info('GET Element', i, selector, element ? 'Success' : 'Failed');
        if (element) {
            return element
        }
        i++;
    }
}

async function runStopTry(tryCount, stopRetry) {
    if (typeof stopRetry === 'function') {
        let res = stopRetry(tryCount);
        if (res instanceof Promise) {
            res = await res;
        }
        return !!res;
    } else {
        return tryCount >= stopRetry;
    }
}


async function loginInPuppeteer(config) {
    if (!config.proxyUrl) {
        throw new Error('proxyUrl is not exist')
    }
    const {browser, page} = await openPage(config.proxyUrl, null, async page => {
        await page.setRequestInterception(true); //开启请求拦截
        page.on('request', request => {
            return request.continue();
        })
        page.on('response', response => {
            const url = response.url();
            if (/\.\w+$/.test(url)) {
                return;
            }
            cookieStore.setCookie({config: {url}, headers: response.headers()});
            return response;
        });
    })

    const submitEl = await tryGetPuppeteerElement(page, config.submitSelector)
    if (!submitEl) {
        await browser.close();
        logger.error(config.submitSelector, 'not found')
        return
    }
    await wait(1000);

    logger.log('Jump Success', page.url())
    for (let i = 0; i < config.input?.length || 0; i++) {
        const item = config.input[i];
        const el = await tryGetPuppeteerElement(page, item.selector, 10, 1000);
        if (!el) {
            await browser.close();
            return logger.error(item.selector, 'not found')
        }
        await page.type(item.selector, item.value, {delay: 20});
    }

    logger.log('Click button', config.submitSelector)
    await submitEl.click();

    await waitNav(page);
    await wait();
    if (!equalHost(page.url(), config.proxyUrl)) {
        logger.error('---------Login Failed---------')
    } else {
        logger.log('---------Login Success---------')
    }
    await browser.close();
}


async function waitNav(page) {
    try {
        await page.waitForNavigation({timeout: 10000});
    } catch (e) {
        logger.error(e)
    }
}

module.exports = {
    loginInPuppeteer
}
