# proxyauth

模拟登陆过程，用于前后端分离开发时，作为中间服务将前端接口代理到测试或线上环境，并添加cookies，以及方便的进行代理方案切换，避免重启编译的耗时。
使用puppeteer进行模拟登陆，会根据set-cookie保存cookie, 在代理中携带。


## Install

```shell
npm i -g proxyauth
```

## Usage

```shell
proxyauth
```
根据提示输入对应内容  
配置项目的代理指向当前服务及端口.  
例：通过`vue-cli`创建的项目中，修改`vue.config.js`
```javascript
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true
      }
    }
  }
}
```
### 指令
* `proxyauth rd` 清除本地保存的开发者信息
* `proxyauth -p <port>` 指定端口
* `proxyauth -t <url>` 更新代理URL
* `proxyauth -d` 清除本地保存的配置
* `proxyauth -c <config file path>` 指定配置文件地址，默认读取 `.proxyauth.cfg.json`.
* `proxyauth -h` 查看帮助
* `proxyauth <any>` 等同于执行`proxyauth && npm run <any>`

## Config file (Optional)

创建文件 `.proxyauth.cfg.json`.

```json
{
  "proxyUrl": "https://example.com",
  "port": 5000,
  "submitSelector": "form [type=submit]",
  "checkNeedLogin": "response => response.statusCode === 302",
  "input": [
    {
      "selector": "form [name=username]",
      "value": "username"
    },
    {
      "selector": "form [name=password]",
      "value": "password"
    }
  ]
}
```
  
字段 | 说明  | 必填   
-- | -- | --   
proxyUrl | 代理地址，访问后必须自动跳转到登陆界面 | 必填  
port | 服务端口, 可以将前端项目proxy指向此服务，默认5000 | 必填
checkNeedLogin | 接口代理时已此为依据判断是否需要重新进行登陆过程，例：`response => response.statusCode === 401`，接口返回状态码为401时，会进行登陆过程。 r默认：response => false |  
submitSelector | 提交按钮的选择器(等同于`querySelector`)，按钮存在时进行输入，输入完成会点击提交。默认：`form [type=submit]` |  必填
input | 用于输入用户名密码等输入项。类型为数组。 | 
[input].selector | 输入项选择器 | 必填 
[input].value | 输入值 |   


## 运行过程中主动切换和刷新登陆
* 输入 `c` 根据提示更新代理地址后重新进行登陆过程
* 输入 `r` 重新进行登陆过程

