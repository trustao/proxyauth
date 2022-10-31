const axios = require('axios');
const cookieManager = require('./cookie');
const {getCookies, setCookie} = cookieManager;

const http = axios.create({
    headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
    },
    maxRedirects: 0
});

http.interceptors.request.use(function (config) {
    const cookie = getCookies(config.url);
    if (cookie) {
        config.headers.Cookie = cookie;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// 添加响应拦截器
http.interceptors.response.use(function (response) {
    if (response.headers && response.headers["set-cookie"]) {
        setCookie(response)
    }
    return response;
}, function (error) {
    if (error.response && error.response && error.response.headers["set-cookie"]) {
        setCookie(error.response)
    }
    return Promise.reject(error);
});


http.cookieManager = cookieManager

module.exports = http
