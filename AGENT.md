# Spark Mall 项目笔记

## 项目概览

本项目是一个基于 `uni-app` / Vue 3 / TypeScript 的跨端盲盒商城应用。环境配置中展示的产品名是 `盲盒商城系统`。

主要目标平台：

- H5
- 微信小程序
- App
- 其他 uni-app 支持的小程序平台

核心业务模块：

- 商城首页：轮播图、推荐盲盒、热销盲盒、商品分类、商品列表。
- 盲盒：详情、下单、开奖、试玩开奖。
- 盒柜：待开盒、待领取商品、寄售商品、提货、分解、寄售。
- 商品：列表、详情、购买、积分兑换/升级。
- 用户中心：登录、微信登录、个人资料、地址、积分、余额、提现、代理/邀请。
- 订单：订单列表、订单详情、支付结果、确认收货。
- 消息与公告：系统消息、公告详情。

## 技术栈

重要依赖声明在 `package.json`。

- 框架：`uni-app`、`Vue 3`
- 语言：`TypeScript`
- 构建工具：`Vite`
- 状态管理：`Pinia`、`pinia-plugin-persistedstate`
- 请求客户端：`alova` + `@alova/adapter-uniapp`，同时保留了一套旧的 `uni.request` 封装
- UI 组件库：`wot-design-uni`
- 样式：`SCSS`、`UnoCSS`
- 分页：`z-paging`
- 工具库：`lodash-es`、`dayjs`、`big.js`

## 运行与构建

环境要求：

- Node.js >= 18
- pnpm >= 7.30
- TypeScript >= 5.0

常用命令：

```bash
pnpm i
pnpm dev:h5
pnpm dev:mp
pnpm build:h5
pnpm build:mp
pnpm build:app
```

H5 开发端口来自 `env/.env`，当前为 `9000`。

微信小程序开发输出目录：

```text
dist/dev/mp-weixin
```

微信小程序构建输出目录：

```text
dist/build/mp-weixin
```

## 应用入口

应用启动入口：

- `src/main.ts`

启动时会注册：

- Pinia store
- 路由拦截器
- 请求拦截器
- `VueQueryPlugin`

全局应用逻辑：

- `src/App.vue`

`App.vue` 中包含基于 `uni.createInnerAudioContext()` 的背景音乐逻辑，并引入全局样式。

## 路由与页面

页面配置由 `@uni-helper/vite-plugin-uni-pages` 生成。

关键路由配置文件：

- `pages.config.ts`
- `src/pages.json`

主包页面目录：

- `src/pages`

分包页面目录：

- `src/pages-consignment`
- `src/pages-order`
- `src/pages-user`

Tabbar 配置：

- `src/layouts/fg-tabbar/tabbarList.ts`

当前 tabbar 策略是原生 tabbar。

主要 tabbar 入口：

- 商城：`pages/home/home`
- 盒柜：`pages/box/index/index`
- 积分：`pages/points/index/index`
- 我的：`pages/usercenter/index`

修改 `src/layouts/fg-tabbar/tabbarList.ts` 后，需要重启开发服务，确保生成的 `pages.json` 更新。

## 环境配置

主要环境文件：

- `env/.env`
- `env/.env.development`
- `env/.env.production`
- `env/.env.test`

`env/.env` 中的重要配置：

```text
VITE_APP_TITLE = '盲盒商城系统'
VITE_APP_PORT = 9000
VITE_SERVER_BASEURL = 'https://huohua-server.daoyinshu.com'
VITE_UPLOAD_BASEURL = 'https://huohua-server.daoyinshu.com/upload'
VITE_APP_PROXY=false
VITE_APP_PROXY_PREFIX = '/api'
```

开发环境覆盖配置：

```text
VITE_APP_PROXY=true
VITE_APP_PROXY_PREFIX = '/api'
```

H5 开发环境通常会走 `/api` 代理。非 H5 平台一般直接请求配置的后端地址。

## 请求层

代码中同时存在两套请求系统。

当前业务接口主要使用 `alova`：

- `src/http/request/alova.ts`

行为特点：

- Base URL 来自环境变量。
- 请求头会从 `uni.getStorageSync('token')` 中读取 token，并设置到 `x-token`。
- 非 200 HTTP 响应会显示 toast 错误。
- 业务错误通过响应体中的 `code` 判断。
- 成功请求返回业务 `data`。

旧的 `uni.request` 封装仍然存在：

- `src/http/http.ts`
- `src/http/interceptor.ts`
- `src/utils/request.ts`

行为特点：

- 自动拼接 query string。
- H5 代理开启时自动添加代理前缀。
- 添加 platform 请求头。
- 从 Pinia 用户状态中读取 token，并设置 `Authorization: Bearer <token>`。

重要注意事项：两套请求系统使用的鉴权请求头不一致。`alova` 使用 `x-token`，旧拦截器使用 `Authorization`。

## API 模块

业务接口主要位于 `src/api`。

- `src/api/home.ts`：首页数据，`/index/index`
- `src/api/goods.ts`：商品详情、商品列表、商品分类、商品下单、兑换、提货
- `src/api/boxInfo.ts`：盲盒、开奖、盒柜、寄售、公告
- `src/api/auth.ts`：登录、注册、用户信息、积分、余额、提现、代理、微信登录
- `src/api/address.ts`：地址管理
- `src/api/order.ts`：订单列表、订单详情、确认收货
- `src/api/payment.ts`：普通支付、微信小程序支付
- `src/api/message.ts`：消息列表和消息详情

`src/service` 和 `src/model` 下还保留了一些较旧或模板化的服务代码。新增业务优先参考当前 `src/api` 的写法，除非周边功能已经明确使用某个 service 模块。

## Store

Pinia 初始化位置：

- `src/store/index.ts`

Store 使用持久化，底层存储为：

- `uni.getStorageSync`
- `uni.setStorageSync`

用户 store：

- `src/store/user.ts`

用户 store 管理内容：

- 用户资料
- Token 和 OpenId
- 首选地址
- 登录与注册
- 微信登录流程
- 积分和余额变动
- 退出登录与本地清理

## 首页流程

首页文件：

- `src/pages/home/home.vue`

页面 `onShow` 时会加载：

- `fetchHomeInfo()`
- `fetchGoodsCategory()`
- `fetchGoodsList()`

如果用户已登录，还会刷新用户信息。

首页数据大致拆分为：

```ts
topList       // 轮播图/公告项
tuijianList   // 推荐盲盒
hotList       // 热销盲盒
productList   // 商品列表
```

重要跳转目标：

- 商品详情：`/pages/goods/detail/index?id=...`
- 盲盒详情：`/pages/blindbox/detail/index?id=...`
- 公告详情：`/pages/notice/detail/index?id=...`
- 寄售首页：`/pages-consignment/index/index`

## 路由守卫

路由守卫文件：

- `src/router/interceptor.ts`

项目使用黑名单式登录拦截。只有在生成的页面配置中标记了 `needLogin` 的页面才要求登录。

当前登录判断为：

```ts
!!userStore.userInfo.username
```

但 `userStore.isLoggedIn()` 判断的是 token 是否存在。如果 token 存在但 `username` 为空，可能出现登录状态不一致的问题。

还需要核对 `VITE_LOGIN_URL`：环境配置当前指向 `/pages/login/index`，但实际登录页面路由看起来是 `/pages/login/login`。

## 布局与组件

布局文件：

- `src/layouts/default.vue`
- `src/layouts/tabbar.vue`
- `src/layouts/fg-tabbar/fg-tabbar.vue`

常用公共组件：

- `src/components/custom-nav-bar/custom-nav-bar.vue`
- `src/components/goods-card/goods-card.vue`
- `src/components/goods-list/goods-list.vue`
- `src/components/price/price.vue`
- `src/components/filter/filter.vue`
- `src/components/filter-popup/filter-popup.vue`
- `src/components/preferred-address/preferred-address.vue`
- `src/components/footer-tool-bar/footer-tool-bar.vue`
- `src/components/privacy-popup/privacy-popup.vue`

功能内聚组件通常放在对应页面目录下。

## 已知维护注意事项

- 请求客户端重复。新增 API 代码优先围绕当前 `alova` 客户端收敛。
- 两套请求客户端的鉴权头不一致。
- 登录重定向路由疑似需要核对。
- 很多 API 响应仍使用 `Promise<any>`，改动附近代码时可以逐步补充更强的类型。
- `src/config/index.ts` 包含较大的静态地区数据，并且有 `config.useMock = true`；依赖该开关前需要确认它是否仍然有效。
- `src/service/app/*`、`src/model/*`、`src/service/good/*` 中有一些文件看起来像生成代码或 starter 模板遗留。
- 一些创建订单或变更类后端接口使用 GET 请求。除非后端协议同步调整，否则应保留现有接口约定。
- 页面中大量使用远程图片资源，视觉改动需要在目标平台实际检查。

## 仓库操作规则

禁止批量删除文件或目录。不要使用：

```text
del /s
rd /s
rmdir /s
Remove-Item -Recurse
rm -rf
```

如果需要删除文件，只能一次删除一个明确路径的文件。

正确示例：

```text
Remove-Item "C:\path\to\file.txt"
```

如果需要批量删除文件，应停止操作，并请求用户手动删除。


Preferred shell: PowerShell

Use Windows PowerShell commands.
Package manager: pnpm
Node managed by nvm.