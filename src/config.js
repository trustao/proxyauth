

const defaultConfig = {
    maxRetry: 3,
    loggerLevel: 'debug',
    input: [],
    proxyUrl: '',
    port: 5000,
    checkNeedLogin: '(res) => false',
    submitSelector: 'form [name=submit]'
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
