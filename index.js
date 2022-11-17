const commander = require('./src/commander');
const prompts = require('./src/prompt-input');
const globalConfig = require('./src/config');
const createServer = require('./src/proxy');
const console = require('./src/logger')
const {exists} = require("./src/utils");
const {loginInPuppeteer} = require("./src/puppeteer");
const {runSwitch} = require("./src/switch");


commander.initCommand(async (args, {options}) => {
    console.log(args);
    console.log(options);

    let fileConfig;
    if (options.config && exists(options.config)) {
        try {
            console.log('读取配置', options.config)
            fileConfig = require(options.config);
        } catch (e) {
            console.warn(e);
        }

    }
    if (options.target) {
        fileConfig = {...fileConfig, proxyUrl: options.target}
    }
    if (options.port) {
        fileConfig = {...fileConfig, port: +options.port}
    }

    const config = await prompts.getConfig(fileConfig)

    if (!config.proxyUrl) {
        throw new Error('请配置代理地址')
    }

    console.log('----config----');
    console.log(config);
    await loginInPuppeteer(config);

    createServer(() => loginInPuppeteer(config), globalConfig.getNeedLoginCheckFn());

    let script;
    if (options.script) {
        script = options.script + (options.argv ? ' ' + argv : '');
    }
    if (args !== 'SINGLE_RUN' && args && args.length) {
        script = args.join(' ');
    }

    await runSwitch(script);
})
