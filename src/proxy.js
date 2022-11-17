const http = require('http');
const httpProxy = require('http-proxy');
const utils = require('./utils');
const globalConfig = require('./config');
const cookieManager = require('./cookie');
const console = require('./logger')


function createServer(auth, needAuth = res => res.statusCode === 302) {
    let promiseCache;
    const authFun = () => {
        if (!promiseCache) {
            promiseCache = auth().then(r => {
                promiseCache = null;
                return r
            }).catch(err => {
                promiseCache = null;
                return err;
            })
        }
        return promiseCache
    }
    const proxy = httpProxy.createProxyServer({
        "changeOrigin": true,
        "localAddress": '0.0.0.0',
        "ws": true
    });


    const server = http.createServer(function (req, res) {
        // console.log(req.headers, req.url);
        goProxy(proxy, req, res);
    });

    server.on('upgrade', (req, socket, head) => {
        const proxyUrl = getProxyURL(req.url)
        proxy.ws(req, socket, head, {target: proxyUrl})
    })

    proxy.on('error', (err, req, res) => {
        console.error(err);
        res.end('Proxy Error');
    });


    proxy.on('proxyReqWs', function(proxyReq, req, head, options) {
        const config = globalConfig.getConfig();
        const url = config.proxyUrl + req.url;
        const cookie = cookieManager.getCookies(url);
        console.log('proxyReqWs', url, cookie);
        proxyReq.setHeader('cookie', utils.overwriteCookie(req.headers.cookie, cookie));
    });

    proxy.on('close', (...args) => {
        console.log(args)
    })


    proxy.on('proxyReq', function(proxyReq, req, res, options) {
        const config = globalConfig.getConfig();
        const url = config.proxyUrl + req.url;
        const cookie = cookieManager.getCookies(url);
        console.log('[ProxyReq]', url);
        proxyReq.setHeader('cookie', utils.overwriteCookie(req.headers.cookie, cookie));
    });

    let tryCount = 0
    proxy.on('proxyRes', async function (proxyRes, req, res) {
        const config = globalConfig.getConfig();
        console.log('[ProxyRes]', req.url, proxyRes.statusCode);
        if (needAuth(proxyRes)) {
            if (tryCount < config.maxRetry) {
                // console.log('ProxyRes', proxyRes.statusCode);
                tryCount++;
                const recovery = holdRes(res);
                await authFun();
                recovery();
                goProxy(proxy, req, res);
            }
        } else {
            tryCount = 0
        }
    });
    const config = globalConfig.getConfig();

    const port = config.port;
    const host = '0.0.0.0'
    server.listen(port, host);
    console.info(`Proxy Server run at: http://${host}:${port}`)
    return server;
}

function goProxy(proxy, req, res) {
    const proxyUrl = getProxyURL()
    proxy.web(req, res, {target: proxyUrl});
}

function getProxyURL(curUrl) {
    return globalConfig.getConfig().proxyUrl
}

function holdRes(res) {
    const write = res.write;
    const setHeader = res.setHeader;
    const end = res.end;
    res.write = () => {};
    res.setHeader = () => {};
    res.end = () => {};
    return () => {
        res.write = write;
        res.setHeader = setHeader;
        res.end = end;
    }
}


module.exports = createServer;
