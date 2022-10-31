const url = require("url");
const fs = require("fs");

function getSetCookie(res, key) {
    if (res.headers && res.headers['set-cookie']) {
        const v = res.headers['set-cookie'].find(i => i.startsWith(key));
        return v ? v.replace(key + '=', '').split(';')[0] : '';
    }
}


function overwriteCookie(oldCookie = '', newCookie = '') {
    const old = oldCookie.split('; ');
    const news = newCookie.split('; ');
    return old.filter(i => !news.some(ii => ii.startsWith(i.split('=')[0]))).concat(news).filter(i => i).join('; ')
}


async function runFunc(fn, ...args) {
    const res = fn(...args);
    return res instanceof Promise ? await res : res
}

function wait(t = 500) {
    return new Promise(r => setTimeout(() => r(), t))
}

function exists(path) {
    try {
        fs.accessSync(path)
        return true;
    } catch (e) {
        return false;
    }
}

function equalHost(urlA, urlB) {
    try {
        return urlA && urlB && url.parse(urlA).host === url.parse(urlB).host;
    } catch (e) {
        return false;
    }
}

module.exports = {
    overwriteCookie,
    runFunc,
    wait,
    equalHost,
    exists
}
