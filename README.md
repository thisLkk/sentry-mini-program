# 自用包
## fork源：sentry-miniapp

## 打包
```bash
yarn build
```

## 发布
```bash
yarn pub
``` 

## 测试
```bash
npx jest test/platform/index.test.ts
```

## 项目使用方式

```js

import Sentry from '@lu-kk/sentry-mini-program'

Sentry.init({
  platform: 'tt', // 若是指定，包内的sdk会强制绑定这个平台，若不指定，包内会自行判断
  dsn: '',
  environment: '',
  beforeSend: () => {},
})

Sentry.configureScope((scope) => {
  scope.setUser({id: ''})“
  scope.setTags({
    mini_program_name: '',
  })
  scope.setExtras({
    project_ame: '',
  })
})

```