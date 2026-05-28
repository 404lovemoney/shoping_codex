# Spark Mall 系统认知文档

生成时间：2026-05-27  
适用对象：第一次接手本项目的前端、后端、测试或产品同学。  
阅读目标：先理解“这个项目是做什么的、页面怎么分、数据怎么走、核心业务怎么串起来”。

## 1. 项目用途

Spark Mall 是一个“盲盒 + 商城 + 盒柜 + 寄售”的移动端商城项目。

你可以把它理解成四件事：

1. 用户在首页或商品页浏览商品、盲盒。
2. 用户可以直接购买商品，也可以购买盲盒。
3. 盲盒开奖后，抽到的商品会进入用户的“盒柜”。
4. 盒柜里的商品可以提货、分解成积分，或者放到寄售区卖掉。

当前项目由两部分组成：

| 部分 | 位置 | 作用 |
| --- | --- | --- |
| 前端应用 | `src/` | uni-app + Vue 3，负责页面展示和用户操作 |
| 后端服务 | `server/` | Express + TypeScript，负责接口、数据转换和连接 Supabase |

另外还有一个旧的本地 mock 服务：

| 部分 | 位置 | 说明 |
| --- | --- | --- |
| 旧 mock 服务 | `mock-server/` | 早期用于本地假接口，后续建议逐步归档 |

## 2. 页面结构

项目主要页面在 `src/pages.json` 中配置。页面可以分成主包页面和分包页面。

### 主 Tab

底部 Tab 有四个：

| Tab | 页面 | 用途 |
| --- | --- | --- |
| 商城 | `src/pages/home/home.vue` | 首页、推荐、热门、商品入口 |
| 盒柜 | `src/pages/box/index/index.vue` | 查看待开盒、已获得商品、寄售中商品 |
| 积分 | `src/pages/points/index/index.vue` | 查看积分记录 |
| 我的 | `src/pages/usercenter/index.vue` | 用户中心入口 |

### 商品相关页面

| 页面 | 位置 | 用途 |
| --- | --- | --- |
| 商品列表 | `src/pages/goods/list/index.vue` | 按分类、排序查看商品 |
| 商品详情 | `src/pages/goods/detail/index.vue` | 查看商品信息、价格、兑换积分 |
| 商品购买确认 | `src/pages/goods/order/purchase.vue` | 普通商品下单 |
| 商品兑换确认 | `src/pages/goods/order/exchange.vue` | 用积分/盒柜商品兑换升级 |
| 商品分类旧页 | `src/pages/goods/category/index.vue` | 仍偏旧 mock 逻辑 |

### 盲盒相关页面

| 页面 | 位置 | 用途 |
| --- | --- | --- |
| 盲盒详情 | `src/pages/blindbox/detail/index.vue` | 查看盲盒价格、奖品、规则，并下单 |
| 盲盒开奖 | `src/pages/blindbox/winner/index.vue` | 支付后开奖，展示抽到的商品 |

### 盒柜相关页面

| 页面 | 位置 | 用途 |
| --- | --- | --- |
| 盒柜首页 | `src/pages/box/index/index.vue` | 展示待开盒、可提货商品、寄售中商品 |
| 提货确认 | `src/pages/box/order/index.vue` | 从盒柜选择商品后提交提货订单 |
| 可提货列表 | `src/pages/box/delivery/index.vue` | 选择要提货的商品 |
| 可分解列表 | `src/pages/box/dismantle/index.vue` | 选择要分解成积分的商品 |

### 订单相关页面

| 页面 | 位置 | 用途 |
| --- | --- | --- |
| 订单列表 | `src/pages-order/list/index.vue` | 查看不同状态订单 |
| 订单详情 | `src/pages-order/detail/index.vue` | 查看订单详情、支付、确认收货 |
| 订单结果 | `src/pages-order/result/index.vue` | 下单/支付后的结果页 |

### 寄售相关页面

| 页面 | 位置 | 用途 |
| --- | --- | --- |
| 寄售专区 | `src/pages-consignment/index/index.vue` | 查看别人正在寄售的商品、我的寄售 |
| 寄售详情 | `src/pages-consignment/detail/index.vue` | 查看寄售商品详情 |
| 选择寄售商品 | `src/pages-consignment/sell-list/index.vue` | 从盒柜选择商品寄售 |
| 发布寄售 | `src/pages-consignment/create/index.vue` | 发布寄售商品 |

### 用户相关页面

| 页面 | 位置 | 用途 |
| --- | --- | --- |
| 登录 | `src/pages/login/login.vue` | 手机号登录 |
| 注册 | `src/pages/register/register.vue` | 注册账号 |
| 微信登录 | `src/pages/wxlogin/login.vue` | 微信授权登录入口 |
| 个人资料 | `src/pages-user/profile/index.vue` | 用户资料 |
| 修改昵称 | `src/pages-user/profile/nickName.vue` | 修改昵称 |
| 地址列表 | `src/pages-user/address/list.vue` | 管理收货地址 |
| 新增地址 | `src/pages-user/address/add-address.vue` | 新增收货地址 |
| 修改地址 | `src/pages-user/address/modify-address.vue` | 修改收货地址 |
| 余额 | `src/pages-user/balance/index/index.vue` | 查看余额流水 |
| 提现 | `src/pages-user/balance/apply-withdrawal/index.vue` | 申请提现 |
| 提现记录 | `src/pages-user/balance/withdrawal-list/index.vue` | 查看提现记录 |
| 推广/团队/佣金 | `src/pages-user/agency/*` | 推广和佣金相关 |
| 消息列表 | `src/pages-user/message/list/index.vue` | 系统消息 |
| 消息详情 | `src/pages-user/message/detail/index.vue` | 消息详情 |

## 3. 数据流

先用一句话理解数据流：

> 页面触发操作，调用 `src/api/*`，请求后端 `server/src/app.ts`，后端从 mock 或 Supabase 取数据，再转换成前端要的格式返回。

主数据流如下：

```text
用户操作页面
  -> 页面调用 src/api/*.ts
  -> alova 请求实例 src/http/request/alova.ts
  -> 请求 http://localhost:3001 或配置的后端地址
  -> server/src/app.ts 匹配接口
  -> 判断是否有真实 Supabase 配置
      -> 没有：返回 server/src/mock-data.ts 里的假数据
      -> 有：查询或写入 Supabase
  -> server/src/mappers.ts 转字段
  -> 返回 { code, message, data }
  -> 前端拿到 data 渲染页面
```

### 当前要特别注意的点

- 前端主业务现在主要走 `src/api/*`。
- 部分旧页面/旧 service 仍走 `src/service/*` 的 mock 数据。
- 后端如果 `server/.env` 仍是占位配置，会自动走内置 mock。
- 后端返回数据库字段时，会通过 `server/src/mappers.ts` 转成前端习惯的字段。

举例：

| 数据库字段 | 前端字段 |
| --- | --- |
| `product_name` | `productName` |
| `exchange_price` | `exchangePrice` |
| `store_page_icon` | `storePageIcon` |
| `order_no` | `orderNo` |
| `total_price` | `totalPrice` |

## 4. 接口流

### 前端接口封装位置

| 文件 | 主要接口 |
| --- | --- |
| `src/api/home.ts` | 首页 |
| `src/api/goods.ts` | 商品列表、商品详情、商品下单、兑换、提货 |
| `src/api/boxInfo.ts` | 盲盒、盒柜、寄售、公告 |
| `src/api/order.ts` | 订单列表、订单详情、确认收货 |
| `src/api/payment.ts` | 普通支付、微信小程序支付 |
| `src/api/auth.ts` | 登录、注册、用户信息、积分、余额、推广、提现 |
| `src/api/address.ts` | 地址增删改查 |
| `src/api/message.ts` | 系统消息 |

### 后端接口入口

所有后端接口目前都集中在：

```text
server/src/app.ts
```

后端按业务大致分成这些接口：

| 业务 | 接口示例 |
| --- | --- |
| 用户 | `/user/login`、`/user/register`、`/user/info` |
| 地址 | `/user/address/list`、`/user/address/create`、`/user/address/update` |
| 首页 | `/index/index`、`/index/publicDetail` |
| 商品 | `/product/cateList`、`/product/list`、`/product/productInfo` |
| 商品下单 | `/product/createOrder`、`/product/exchangeProduct` |
| 盲盒 | `/productBox/boxInfo`、`/productBox/createOrder`、`/productBox/boxDraw` |
| 订单 | `/order/orderList`、`/order/orderDetail`、`/order/pay` |
| 盒柜 | `/order/unOpendBoxList`、`/order/productList`、`/order/collectProducts` |
| 寄售 | `/order/mySellList`、`/order/sellingProductList`、`/order/productFastSell` |
| 消息 | `/message/list`、`/message/detail` |
| 提现 | `/withdrawal/getApplyList`、`/withdrawal/submitApply` |

### 接口返回格式

后端统一返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

前端 alova 会自动取出 `data`，所以页面里拿到的一般不是完整响应，而是业务数据。

## 5. 登录流程

当前登录流程可以理解为“前端有流程，后端是假登录”。

### 页面流程

```text
用户打开登录页
  -> 输入手机号/密码或验证码
  -> 调用 userStore.login()
  -> 调用 src/api/auth.ts 的 login()
  -> 请求 POST /user/login
  -> 后端返回 token
  -> 前端保存 token 到 uni storage
  -> 再调用 GET /user/info 获取用户信息
  -> 保存到 Pinia user store
  -> 页面认为用户已登录
```

### 相关文件

| 文件 | 作用 |
| --- | --- |
| `src/pages/login/login.vue` | 登录页面 |
| `src/store/user.ts` | 登录状态、token、用户信息持久化 |
| `src/api/auth.ts` | 登录/注册/用户接口 |
| `server/src/app.ts` | `/user/login`、`/user/info` |

### 当前真实状态

- token 当前是固定 mock token。
- 后端没有真实密码校验。
- 微信登录接口也是 mock。
- 多用户隔离还没完成。

所以新人接手时要记住：

> 当前登录是为了让页面流程跑通，不是可上线的真实登录。

## 6. 下单流程

项目里有几种下单：

| 下单类型 | 场景 |
| --- | --- |
| 普通商品下单 | 用户直接购买商品 |
| 积分兑换下单 | 用户用积分/余额兑换商品 |
| 盲盒下单 | 用户购买盲盒 |
| 盒柜提货下单 | 用户把盒柜里的商品提货到家 |

### 普通商品下单流程

```text
商品详情页
  -> 用户点击购买
  -> 进入购买确认页
  -> 选择数量、地址、支付方式
  -> 调用 /product/createOrder
  -> 后端创建订单并返回 orderNo
  -> 调用 /order/pay 或 /order/wechatMiniAppPay
  -> 支付成功后进入订单结果页
```

相关文件：

| 文件 | 作用 |
| --- | --- |
| `src/pages/goods/detail/index.vue` | 商品详情 |
| `src/pages/goods/order/purchase.vue` | 购买确认 |
| `src/api/goods.ts` | `createGoodsOrder()` |
| `src/api/payment.ts` | `commonOrderPay()`、`wxOrderPay()` |
| `server/src/app.ts` | `/product/createOrder`、`/order/pay` |

### 积分兑换流程

```text
商品兑换页
  -> 选择兑换商品和数量
  -> 计算需要积分、余额、运费
  -> 调用 /product/exchangeProduct
  -> 后端创建兑换订单
  -> 再走支付/订单结果
```

当前要注意：

- 积分扣减还没有形成真实流水。
- 后端没有完整校验用户积分是否足够。

### 当前下单风险

- 支付是假支付，接口会直接把订单状态改成已支付。
- 订单金额主要依赖前端传参，后端重算不完整。
- 没有真实库存锁定。

所以当前下单链路适合演示和联调，不适合直接上线。

## 7. 盲盒流程

盲盒是项目最核心的业务之一。

### 用户看到的流程

```text
首页点击盲盒
  -> 进入盲盒详情页
  -> 查看盲盒价格、奖品、规则
  -> 选择抽取次数
  -> 创建盲盒订单
  -> 支付
  -> 进入开奖页
  -> 展示抽中的商品
  -> 商品进入盒柜
```

### 系统里的流程

```text
GET /productBox/boxInfo
  -> 获取盲盒信息和奖品列表

GET /productBox/createOrder
  -> 创建盲盒订单
  -> 返回 orderNo

GET /order/pay
  -> 当前直接设置订单已支付

GET /productBox/boxDraw
  -> 根据订单取抽取次数
  -> 从盲盒商品池挑选商品
  -> 写入 user_box_products
  -> 更新 orders.product_list 和订单状态
  -> 返回 productList
```

### 相关表

| 表 | 用途 |
| --- | --- |
| `product_boxes` | 盲盒主信息 |
| `product_box_items` | 盲盒包含哪些商品，以及权重字段 |
| `orders` | 盲盒订单 |
| `user_box_products` | 用户抽到后进入盒柜的商品 |

### 当前真实状态

- 页面流程已经通。
- 后端有盲盒表和盲盒商品池表。
- 但抽奖逻辑还是简化实现。
- `draw_weight` 字段存在，但当前没有真正按权重概率严格抽奖。
- 没有库存扣减、保底、抽奖记录和并发控制。

新人理解这块时可以先记住：

> 当前盲盒流程是“能抽出结果”，但还不是“可上线的抽奖系统”。

## 8. 商品流转流程

商品在系统里不是只有“买了发货”这一条路。它会在商城、盲盒、盒柜、寄售、提货、分解之间流转。

### 商品流转总图

```text
商品基础数据 products
  -> 展示在商城商品列表
  -> 可被直接购买
  -> 可配置进盲盒奖池 product_box_items

用户购买盲盒并开奖
  -> 抽中的商品进入 user_box_products
  -> 状态变为盒柜可用商品

盒柜商品可以继续流转
  -> 提货：生成提货订单
  -> 寄售：进入 consignment_orders
  -> 分解：转成积分
```

### 盒柜商品状态

`user_box_products.status` 当前用于表达盒柜商品状态。

| 状态 | 含义 |
| --- | --- |
| `0` | 待开盒/待处理 |
| `1` | 可用，可提货、寄售或分解 |
| `2` | 寄售中 |
| `3` | 已售出 |
| `4` | 已提货 |
| `5` | 已分解 |

### 寄售流程

```text
盒柜选择商品
  -> 快速寄售或普通寄售
  -> 调用 /order/productFastSell 或 /order/productCommonSell
  -> 后端写入 consignment_orders
  -> user_box_products.status 改为 2
  -> 商品出现在寄售专区
```

相关页面和接口：

| 页面/接口 | 作用 |
| --- | --- |
| `src/pages-consignment/sell-list/index.vue` | 选择要寄售的盒柜商品 |
| `src/pages-consignment/index/index.vue` | 寄售专区 |
| `/order/productFastSell` | 快速寄售 |
| `/order/productCommonSell` | 普通寄售 |
| `/order/sellingProductList` | 寄售专区列表 |
| `/order/mySellList` | 我的寄售列表 |

### 提货流程

```text
盒柜选择可提货商品
  -> 选择地址
  -> 调用 /order/collectProducts
  -> 生成提货订单
  -> 后续应进入发货/物流流程
```

当前提货只是创建订单，真实发货、物流、库存状态还不完整。

### 分解流程

```text
盒柜选择商品
  -> 调用 /order/dismantleProduct
  -> 商品状态改为已分解
  -> 返回积分
```

当前分解还没有完整积分流水，后续上线前必须补齐。

## 9. 新人接手建议阅读顺序

建议按这个顺序看代码：

1. `src/pages.json`  
   先知道项目有哪些页面。

2. `src/pages/home/home.vue`  
   看首页如何拉商品、分类和盲盒。

3. `src/api/goods.ts`、`src/api/boxInfo.ts`、`src/api/order.ts`、`src/api/auth.ts`  
   看前端主要接口怎么封装。

4. `src/http/request/alova.ts`  
   看请求如何加 token、如何处理响应。

5. `src/store/user.ts`  
   看登录态、用户信息和地址如何保存。

6. `server/src/app.ts`  
   看所有后端接口怎么返回。

7. `server/src/mappers.ts`  
   看数据库字段如何转前端字段。

8. `server/supabase/schema.sql`  
   看当前数据库有哪些表。

9. `PROJECT_ANALYSIS.md`  
   看当前完成度、mock、风险和缺口。

10. `PROJECT_ROADMAP.md`  
   看后续开发阶段和上线前必须补齐的内容。

## 10. 当前最容易踩坑的地方

| 坑 | 说明 |
| --- | --- |
| 以为登录已完成 | 其实当前是 mock token，不是真实鉴权 |
| 以为支付已完成 | 其实当前支付接口直接改订单状态 |
| 以为 Supabase 默认已接入 | `server/.env` 如果是占位值，后端会走 mock |
| 以为所有页面都走正式接口 | 部分旧 service 仍然走本地 mock |
| 以为订单状态可靠 | 当前状态机和权限校验还不完整 |
| 以为盲盒抽奖可上线 | 当前没有完整权重、库存、保底、并发和审计 |
| 混用字段名 | 数据库是 snake_case，前端多用 camelCase，需要通过 mapper 对齐 |

## 11. 一句话总结

当前项目已经具备完整的盲盒商城页面骨架和大部分接口联调链路，但仍属于“可演示原型”。如果目标是上线，需要重点补齐真实登录、真实支付、订单状态机、库存、盲盒抽奖、账户流水、安全和部署体系。
