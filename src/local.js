const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const key = createKey();
const storeFilePath = path.join(__dirname, '.u')

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
    } catch (e) {
        // console.error(e)
    }
}

function getDeveloperInfo() {
    try {
        const data = fs.readFileSync(storeFilePath, 'utf-8');
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
