const inquirer = require('inquirer');
const globalConfig = require('./config');
const local = require('./local');
const {loginInPuppeteer} = require("./puppeteer");


const promptConfigs = [
    {
        type: 'input',
        name: 'proxyUrl',
        message: '代理地址',
    },
    {
        type: 'number',
        name: 'port',
        default: 5000,
        message: '代理服务运行端口'
    },
    {
        type: 'input',
        name: 'checkNeedLogin',
        default: '(res) => false',
        message: '需要登陆的时机'
    },
    {
        type: 'input',
        name: 'submitSelector',
        default: 'form [type=submit]',
        message: '提交按钮选择器'
    }
]

const needAdd = (text) => inquirer.prompt([{
    type: 'confirm',
    name: 'addInput',
    message: text || '添加输入项？'
}]).then(({addInput}) => addInput);

const inputPrompt = [
    {
        type: 'input',
        name: 'selector',
        message: '输入项选择器',
    },
    {
        type: 'input',
        name: 'value',
        message: '输入项值',
    }
]

async function prompt(defaultConfig = {}) {
    const result = {input: [], ...defaultConfig}
    for (let i = 0; i < promptConfigs.length; i++) {
        const item = promptConfigs[i];
        if (!defaultConfig[item.name]) {
            const res = await inquirer.prompt([item]);
            Object.assign(result, res);
        }
    }
    const exist = !!result.input.length;
    let needAddInput = exist || await needAdd();
    let index = 0;
    while (needAddInput) {
        const item = result.input[index] || {};
        for (let i = 0; i < inputPrompt.length; i++) {
            const itemElement = inputPrompt[i];
            if (!item[itemElement.name]) {
                item[itemElement.name] = await inquirer.prompt([
                    {...itemElement, message: `${index + 1}.${itemElement.message}${item.selector || ''}`}
                ]).then((v => v[itemElement.name]));
            }
        }
        result.input[index] = item;
        index++;
        if (exist) {
            needAddInput = index < result.input.length
        } else {
            needAddInput = await needAdd('继续添加输入项？')
        }
    }
    console.log(result);
    return result;
}

async function getConfig(fileConfig = {}) {
    const localConfig = local.getDeveloperInfo() || {};
    const config = await prompt({
        ...localConfig,
        ...fileConfig,
        input: fileConfig.input?.map(i => {
            const old = localConfig.input?.find(ii => i.selector === ii.selector)
            if (old?.value) {
                i.value = old.value
            }
            return i
        }) || localConfig.input || []
    });
    local.saveDeveloperInfo(config);
    globalConfig.updateConfig(config);
    return config;
}


async function switchPrompt() {
    const input = await inquirer
        .prompt([
            {
                type: 'input',
                name: 'proxyUrl',
                message: '代理地址',
            },
        ]);
    globalConfig.updateConfig(input);
    await loginInPuppeteer(globalConfig.getConfig())
}

async function refreshLoginPrompt() {
    const input = await inquirer
        .prompt([
            {
                type: 'confirm',
                name: 'refresh',
                message: '确认重新登陆？'
            },
        ]);
    if (input.refresh) {
        await loginInPuppeteer(globalConfig.getConfig())
    }
}


module.exports = {
    getConfig,
    switchPrompt,
    refreshLoginPrompt
}



