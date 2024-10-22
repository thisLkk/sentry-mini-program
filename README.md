# sentry-mini-program

> 支持业务各平台小程序接入sentry的解决方案

## 注意
这个仓库产出的包暂时只在自己公司使用（公网包没有更新），若外部使用可以fork这个仓库，自己产出包

## 支持平台（可以增量支持）
- 微信小程序
- 字节小程序
- Taro 框架

### Trao小程序接入

由于Taro框架的错误监听运行在业务内，暂未在本包底层实现，
需要业务自行上报。

```js
import Sentry from '@lu-kk/sentry-mini-program'

// 请根据业务代码仓库运行，自行决定是否指定platform （如业务代码错误的注入了多个平台的sdk，那么platform建议指定）
Sentry.init({
  // [platform] 若是指定，包内的sdk会强制绑定这个平台，若不指定，包会自行判断
  platform: 'tt', // 
  dsn: '',
  environment: '',
  beforeSend: () => {},
})

// 业务代码内，自行上报 
// 如： app.ts
  useUnhandledRejection((err) => {
    Sentry.captureException(err)
  })
  useError((err) => {
    Sentry.captureException(err)
  })
// 接口统一上报， 可以将非0的请求统一上报
```

### 微信等原生小程序接入

直接导入使用即可，无需指定platform

```js
import Sentry from '@xc/sentry-mini-program'

Sentry.init({
  dsn: '',
  environment: '',
  beforeSend: () => {},
})
```


## 项目维护

node：18.14.0
yarn：1.22.22

### 开发
目前开发验证比较繁琐，需要先盲写代码，然后发包验证（或者link验证）。  
对于一些有预期输入输出的代码可以先写测试用例，然后通过jest执行测试用例来验证。

### 发布流程
- 先修改package.json版本号
- 执行yarn build
- 执行yarn pub

```bash
# npm login 登录发布流程
# 安装nrm
npm install -g nrm

# 配置nrm
nrm add xc http://npm.ixiaochuan.cn/
nrm use xc
nrm ls

# 进入项目
cd your-module-path
...

# 登录 这步报错看下面错误解决方案
npm login 
Username: lukuankuan
Password: ********
Email: lukuankuan@xiaochuankeji.cn

# 认证通过之后，
npm publish

# 使用模块

npm i @xc/sentry-mini-program 

```

**错误**

- 若执行npm login 登录报错，请检查npm的版本是否是9.x，若是，执行npm login –auth-type=legacy


## 单元测试

虽然目前单元测试不能完全执行测试，但可以执行部分测试用例。

```bash
npx jest test/platform/index.test.ts
```

