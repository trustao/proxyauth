const {program, Argument} = require('commander');
const path = require('path');
const localInfo = require('./local');
const {runFunc} = require('./utils')
const console = require('./logger')

function initCommand(run) {
    program
        .option('-p, --port <5050>', '运行端口')
        .option('-t, --target <URL>', '代理地址')
        .option('-d, --developer', '不读取本地存储开发者信息，手动输入')
        .option('-c, --config <file path>', '配置文件地址', path.join(process.cwd(), '.proxyauth.cfg.json'));

    program
        .command('rd')
        .description('删除本地开发者信息')
        .action(s => {
            localInfo.remove();
        });

    program
        .addArgument(new Argument('<script...>', '执行指令, 例：proxyStart dev 代替 npm run dev').argOptional().default('SINGLE_RUN'))
        .action((args) => {
            runFunc(run, args, getCommandOpt())
              .then(r => console.log('Finish'))
              .catch(err => console.error(err))
        });

    program.parse(process.argv);
}

function getCommandOpt() {
    return {
        options: program.opts(),
        scripts: program.args
    }
}

module.exports = {
    initCommand,
    getCommandOpt
};
