const url = require('url');
const setCookieParse = require('set-cookie-parser');

const cookiesStore = {};

function getCookies(urlStr) {
    const {host, pathname} = url.parse(urlStr)
    if (!cookiesStore[host]) {
        return ''
    }
    return Object.keys(cookiesStore[host]).reduce((res, k) => {
        const cookie = cookiesStore[host][k];
        return res + (res ? '; ' : '') + k + '=' + cookie.data.value
    }, '')
}

function invalidCookie(cookie, host, pathname) {
    return !cookie || !cookie.data || !cookie.start ||
        cookie.data.domain && host.endsWith(cookie.data.domain) ||
        cookie.data.maxAge > 0 && Date.now() > cookie.start.getTime() + cookie.data.maxAge * 1000 ||
        cookie.data.expires && Date.now() > cookie.data.expires.getTime() ||
        cookie.data.path && cookie.data.path !== '/' && !pathname.startsWith(cookie.data.path)
}

function getCookie(urlStr, key) {
    const {host, pathname} = url.parse(urlStr);
    if (!cookiesStore[host] || invalidCookie(cookiesStore[host][key], host, pathname)) {
        return ''
    }
    return cookiesStore[host][key].data.value
}

function setCookie(response) {
    const {host} = url.parse(response.config?.url);
    const cookies = setCookieParse(response, {decodeValues: false, map: true}) || {};
    cookiesStore[host] = cookiesStore[host] || {};
    Object.keys(cookies).forEach(k => {
        cookiesStore[host][k] = {
            start: new Date(),
            data: cookies[k]
        }
    })
}

function removeCookie(urlStr, key) {
    const host = cookiesStore[url] ? urlStr : url.parse(urlStr).host
    if (key) {
        delete cookiesStore[host][key]
    } else {
        delete cookiesStore[host]
    }
}

module.exports = {
    getCookie,
    getCookies,
    setCookie,
    removeCookie
}
