const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const console = require('./logger');

const dir = getAccessDir();
const key = createKey();
const curPath = process.cwd();
const fileName = md5(curPath);

const storeFilePath = path.join(dir, fileName + '.u');

function getAccessDir() {
    let dir = path.join(__dirname, '.store');
    if (hasAccess(dir)) return dir
    dir = path.join(process.cwd(), 'node_modules')
    if (hasAccess(dir)) return dir
    dir = path.join(process.cwd())
    if (hasAccess(dir)) return dir
}

function hasAccess(path) {
    try {
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK)
        return true
    } catch (e) {
        return false
    }
}
console.log('[storeFilePath]', storeFilePath);
console.log('[key]', key);
function md5(str) {
   return crypto.createHash('md5').update(str).digest('hex');
}

function cipher(str, key){
    try{
        const buffer = Buffer.from(key, 'utf-8')
        const cipher = crypto.createCipheriv('aes128', buffer.slice(0, 16), buffer.slice(16, 32));
        let encrypted = cipher.update(str, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }catch(e){
        console.error(e)
        // console.log('加密失败');
    }
}

function decipher(encrypted, key){
    try{
        const buffer = Buffer.from(key, 'utf-8')
        const decipher = crypto.createDecipheriv('aes128', buffer.slice(0, 16), buffer.slice(16, 32));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }catch(e){
        // console.log('解密失败');
    }
}

function createKey() {
    try {
        return md5(fs.readFileSync(__filename, 'utf-8'))
    } catch (e) {
        // console.error(e)
        return ''
    }
}

function saveDeveloperInfo(userinfo) {
    try {
        fs.writeFileSync(storeFilePath, cipher(JSON.stringify(userinfo), key))
        console.log('writeFileSync');
    } catch (e) {
        console.error(e)
    }
}

function getDeveloperInfo() {
    try {
        const data = fs.readFileSync(storeFilePath, 'utf-8');
        console.log('ReadFile', data);
        return JSON.parse(decipher(data, key));
    } catch (e) {
        // console.error(e)
    }
}

function remove() {
    if (typeof fs.rmSync === 'undefined') {
        fs.writeFileSync(storeFilePath, '')
    } else {
        fs.rmSync(storeFilePath, {force: true})
    }
}

module.exports = {
    saveDeveloperInfo,
    getDeveloperInfo,
    remove
}
