const {getConfig} = require('./config');

function isDebug() {
    return getConfig().loggerLevel === 'debug'
}

module.exports = {
    log(...args) {
        if (isDebug()) {
            console.log(...args)
        }
    },
    info(...args) {
        console.info(...args)
    },
    error(...args) {
        console.error(...args)
    },
    warn(...args) {
        console.warn(...args)
    }
}
