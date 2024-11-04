# sentry-mini-program

> 支持业务各平台小程序接入sentry的解决方案

## 注意
这个仓库产出的包暂时只在自己公司使用（公网包没有更新），若外部使用可以fork这个仓库，自己产出包

## 支持平台（可以增量支持）
- 微信小程序
- 字节小程序
- 快手小程序
- 小红书小程序
- Taro 框架

### Trao小程序接入

由于Taro框架的错误监听运行在业务内，暂未在本包底层实现，
需要业务自行上报。

```js
import Sentry from '***' // 业务包，需要自行clone、build、pub

import {getMiniProgramEnv, isWX, isXHS} from '../primitive'
import {beforeSend} from './filter' // 需要自行在业务内实现

const DSN = ''

const caniUseSentry = () => {
  // 暂时sdk支持这三个平台，快手平台需要验证添加。抖音还未验证
  const usePlatform = isXHS || isWX
  // 可以评估是否只对生产模式有效
  // if (usePlatform && process.env.NODE_ENV === 'production') {
  if (usePlatform) {
    return true
  }
  return false
}
// 在入口执行这个函数，或者在这里自执行下。依据获取的参数时机选择
export const initSentry = () => {
  const {envType, mpVersion} = getMiniProgramEnv()
  if (caniUseSentry()) {
    const integrations: any[] = []
    if (!isKwai) {
      // TypeError r.mergeOptions is not a function 忽略快手开发者工具这个错误
      integrations.push(new Sentry.Integrations.InboundFilters())
    }
    Sentry.init({
      platform: process.env.TARO_ENV, // 传入这个字段。sdk包会将sentry小程序平台指向此环境
      dsn: DSN,
      environment: envType,
      integrations,
      beforeSend: beforeSend, // 根据需求自行选择是否需要
    })
    Sentry.configureScope((scope) => {
      scope.setTags({
        mini_program_name: PLATFORM_ENV_STRING,
      })
      // 初始化时用户信息还未生成，故在beforeSend时机进行赋值
      scope.setUser({
        name: 'unknown',
      })
      scope.setExtras({
        uid: 'unknown', // 初始化时用户信息还未生成，故在beforeSend时机进行赋值
      })
    })
  }
}

// 主动上报异常，建议通过这个函数上报，方便收口
export const SentryCaptureException = (err: any) => {
  if (caniUseSentry()) {
    Sentry.captureException(err)
  }
}


// app.ts 入口执行
function App(props) {
  initSentry() // 初始化 Sentry
  const indexQueryParams = useQuery()

  useUnhandledRejection((err) => {
    console.log('【app-useUnhandledRejection-rejectErr】 ==========> ', err)
    SentryCaptureException(err)
  })
  useError((err) => {
    console.log('【app-useError-rejectErr】 ==========> ', err)
    SentryCaptureException(err)
  })

}
```



### 微信等原生小程序接入

直接导入使用即可，无需指定platform

```js
import Sentry from '***' // 业务包，需要自行clone、build、pub

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

npm i *** // 业务包，需要自行clone、build、pub

```

**错误**

- 若执行npm login 登录报错，请检查npm的版本是否是9.x，若是，执行npm login –auth-type=legacy


## 单元测试

虽然目前单元测试不能完全执行测试，但可以执行部分测试用例。

```bash
npx jest test/platform/index.test.ts
```

## beforeSend 过滤
```js

// sentry 的过滤逻辑, 主要过滤一些不必要的报错
import {getLoginInfo} from '~/reducer/account'

const FILTER_ERRORS = [
  'login fail',
  'setClipboardData',
  'background',
  'dns error',
  'time out',
  'network not available',
  'getUserProfile:fail auth deny', // 抖音 用户取消登录
  '`Object` is not assignable to type `RequestResponse`', //快手开发者工具request错误，手机模式不会有
]

const INCLUDE_ERRORS = ['pay', 'order']

export function beforeSend(event: any, hint) {
  if (
    !event ||
    !event.exception ||
    !event.exception.values ||
    !event.exception.values.length
  ) {
    return null // 如果事件不包含异常信息，则不进行任何处理
  }

  const exceptionValues = event.exception.values

  // 过滤错误消息
  event.exception.values = exceptionValues.filter((value) => {
    const errorMessage = value?.value || ''

    // 检查是否包含需要排除的错误消息
    for (const filterError of FILTER_ERRORS) {
      if (errorMessage.toLowerCase().includes(filterError.toLowerCase())) {
        return false // 如果匹配到需要过滤的错误消息，则移除该异常信息
      }
    }

    // 检查是否包含需要包含的错误消息
    for (const includeError of INCLUDE_ERRORS) {
      if (errorMessage.toLowerCase().includes(includeError.toLowerCase())) {
        return true // 如果匹配到需要包含的错误消息，则保留该异常信息
      }
    }

    return true // 默认情况下保留异常信息
  })
  // 如果过滤后没有异常信息，则不发送sentry请求
  if (event.exception.values.length === 0) {
    return null
  }
  // 在这里赋值是由于初始化时Sentry还未获取到相关信息，所以在发送时获取
  // 注意：若错误生成时，用户信息还未有，则上报时为 unknown
  const loginInfo = getLoginInfo()
  event.user.name = loginInfo.member_info?.name || 'unknown'
  return event // 返回处理后的事件对象
}


```