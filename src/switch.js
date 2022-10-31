const readline = require('readline')
const {exec} = require('child_process');
const {switchPrompt, refreshLoginPrompt} = require('./prompt-input');

function watchSwitchProxy () {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on('line', (input) => {
            if (input === 'c' || input === 'r') {
                rl.close();
                resolve(input);
            }
        })

        rl.on('error', err => reject(err))
    })
}

async function runSwitch (execCommand) {
    let subProcess;
    if (execCommand) {
        if (/^\S+\.js($| )/.test(execCommand.trim())) {
            execCommand = 'node ' + execCommand;
        } else {
            execCommand = 'npm run ' + execCommand;
        }
        subProcess = exec(execCommand, (err) => {
            // console.error(err)
            throw err
        });
    }
    await runSwitchListen(subProcess)
}

function runSwitchListen(subProcess) {
    subProcess && subProcess.stdout.pipe(process.stdout);
    return watchSwitchProxy()
        .then(_ => {
            subProcess && subProcess.stdout.unpipe(process.stdout);
            subProcess && subProcess.stdout.resume();
            return _
        })
        .then(type => type === 'r' ? switchPrompt() : refreshLoginPrompt())
        .then(_ => runSwitchListen())
        .catch(err => console.error(err))
}

module.exports = {
    runSwitch
}
