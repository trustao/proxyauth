

const defaultConfig = {
    maxRetry: 3,
    loggerLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    input: [],
    visitUrl: '',
    proxyUrl: '',
    port: 5000,
    checkNeedLogin: '(res) => false',
    submitSelector: 'form [type=submit]'
}

module.exports = {
    getConfig: () => defaultConfig,
    updateConfig: (config) => Object.assign(defaultConfig, config),
    getNeedLoginCheckFn: () => {
        try {
            return eval(defaultConfig.checkNeedLogin)
        } catch (e) {
            return () => false;
        }
    }
}
