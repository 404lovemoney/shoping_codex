# Spark Mall 项目接管分析

分析时间：2026-05-27  
分析范围：前端 `src/`、独立后端 `server/`、历史 mock 服务 `mock-server/`、Supabase schema/seed、项目配置与接口调用关系。  
结论口径：以“接手后能否继续开发和上线”为标准，不只统计接口数量。

## 1. 项目整体功能结构

这是一个基于 uni-app + Vue 3 + TypeScript 的盲盒/商城项目，当前包含前端应用、独立 Express 后端、Supabase 数据结构脚本和一个旧版 mock-server。

核心业务域：

| 业务域 | 当前功能 |
| --- | --- |
| 商城首页 | banner、分类、推荐/热门盲盒、商品列表入口 |
| 商品 | 商品分类、商品列表、商品详情、商品购买、积分兑换 |
| 盲盒 | 盲盒详情、盲盒下单、支付后开奖、试玩开奖 |
| 盒柜 | 待开盒、已获得商品、提货、寄售、分解 |
| 订单 | 订单列表、订单详情、确认收货、订单结果页 |
| 寄售 | 寄售专区、我的寄售、寄售详情、取消寄售、快速/普通寄售 |
| 用户 | 登录、注册、微信登录占位、个人中心、昵称、地址、余额、积分、推广、佣金、提现 |
| 内容消息 | 公告详情、系统消息列表与详情 |

技术结构：

| 层级 | 说明 |
| --- | --- |
| 前端 | `src/`，uni-app 多端项目，使用 Vue 3、Pinia、alova、wot-design-uni、z-paging |
| 后端 | `server/`，Node.js + Express + TypeScript，默认端口 `3001` |
| 数据库 | Supabase PostgreSQL，schema 文件在 `server/supabase/schema.sql` |
| 本地 mock | `server/src/mock-data.ts` 为后端缺少 Supabase 配置时的内置 mock；`mock-server/` 是更早的独立 mock 服务 |

## 2. 前端模块划分

### 页面模块

| 模块 | 目录/页面 | 说明 |
| --- | --- | --- |
| 首页/商城 | `src/pages/home/home.vue` | 首页 banner、分类、推荐/热门、商品流 |
| 登录注册 | `src/pages/login/`、`src/pages/register/`、`src/pages/wxlogin/` | 手机号登录、注册、微信授权登录页面 |
| 商品 | `src/pages/goods/` | 分类、列表、详情、购买确认、积分兑换 |
| 盲盒 | `src/pages/blindbox/` | 盲盒详情、开奖页 |
| 盒柜 | `src/pages/box/` | 盒柜首页、提货、分解、盒柜订单 |
| 订单 | `src/pages-order/` | 订单列表、详情、结果页 |
| 寄售 | `src/pages-consignment/` | 寄售首页、发布、详情、选择寄售商品 |
| 用户中心 | `src/pages/usercenter/`、`src/pages-user/` | 资料、地址、余额、提现、推广、团队、消息 |
| 积分 | `src/pages/points/` | 积分记录 |
| 公告 | `src/pages/notice/` | 公告详情 |

### 前端代码职责

| 目录 | 职责 |
| --- | --- |
| `src/api/` | 当前主业务 API 封装，大部分页面从这里调用后端 |
| `src/http/request/alova.ts` | alova 请求实例，统一 baseURL、token、响应解包 |
| `src/http/interceptor.ts` | uni.request 拦截器，但主业务多数已经改为 alova |
| `src/store/user.ts` | Pinia 用户状态、token、本地持久化、登录态、地址缓存 |
| `src/model/` | 大量本地数据生成器/旧 mock 模型 |
| `src/service/` | 旧 service 层和 OpenAPI/Petstore demo，部分页面仍引用 |
| `src/components/` | 商品卡、筛选、价格、地址、tabbar、弹窗等通用组件 |
| `src/layouts/` | 默认布局、tabbar 布局、自定义 tabbar |

### 前端状态判断

- 主流程页面基本存在，路由配置完整。
- 新业务 API 主要集中在 `src/api/*`，可维护性尚可。
- 存在新旧请求体系并存：`src/api/*` 走 alova，`src/http/http.ts`/`src/utils/request.ts`/`src/service/*` 仍残留。
- `src/service/app/*` 是 OpenAPI/Petstore 示例代码，当前业务不应继续扩展它。
- `src/config/index.ts` 的 `config.useMock = true` 会影响旧 service 层，虽然主业务 API 不读这个开关。

## 3. 后端模块划分

后端是单体 Express 服务，入口为 `server/src/app.ts`。

| 模块 | 文件 | 职责 |
| --- | --- | --- |
| 服务入口/路由 | `server/src/app.ts` | 注册所有 HTTP 接口、mock/Supabase 分支、分页、业务写入 |
| Supabase 客户端 | `server/src/supabase.ts` | 读取 `server/.env`，校验 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` |
| 响应封装 | `server/src/response.ts` | 统一 `{ code, message, data }` |
| 类型定义 | `server/src/types.ts` | 数据库行类型 |
| 字段映射 | `server/src/mappers.ts` | snake_case 数据库字段转前端 camelCase |
| 内置 mock | `server/src/mock-data.ts` | 后端无真实 Supabase 配置时返回的本地数据 |
| 数据库脚本 | `server/supabase/schema.sql`、`server/supabase/seed.sql` | 当前较完整 schema 和测试数据 |
| 旧 schema | `server/supabase-schema.sql` | 早期精简版 schema，已落后于 `server/supabase/schema.sql` |

后端当前没有分 controller/service/repository 层，所有业务逻辑集中在 `app.ts`。短期方便联调，后续订单、支付、库存、盲盒抽奖继续复杂化时会成为维护风险。

## 4. 当前已经联调完成的模块

这里的“联调完成”指：前端页面存在实际调用，后端有对应接口，并且接口能返回前端需要的结构。是否达到生产可用另行判断。

| 模块 | 前端入口 | 后端接口 | 状态 |
| --- | --- | --- | --- |
| 首页 | `pages/home/home.vue` | `/index/index`、`/product/cateList`、`/product/list` | 已打通 |
| 商品列表/详情 | `pages/goods/list`、`pages/goods/detail` | `/product/list`、`/product/productInfo` | 已打通 |
| 商品购买/兑换 | `pages/goods/order/*` | `/product/createOrder`、`/product/exchangeProduct`、`/order/pay` | 已打通，但支付是假支付 |
| 盲盒详情/下单/开奖 | `pages/blindbox/*` | `/productBox/boxInfo`、`/productBox/createOrder`、`/productBox/boxDraw`、`/productBox/testDraw` | 已打通，但抽奖规则简化 |
| 盒柜列表 | `pages/box/index` | `/order/unOpendBoxList`、`/order/productList`、`/order/mySellList` | 已打通 |
| 提货/分解 | `pages/box/delivery`、`pages/box/dismantle` | `/order/collectProducts`、`/order/dismantleProduct` | 已打通，但库存/状态校验弱 |
| 寄售 | `pages-consignment/*` | `/order/sellingProductList`、`/order/sellingProductInfo`、`/order/cancelSell`、`/order/productFastSell`、`/order/productCommonSell` | 已打通 |
| 订单 | `pages-order/*` | `/order/orderList`、`/order/orderDetail`、`/order/confirmReceipt` | 已打通 |
| 登录/用户信息 | `pages/login`、`store/user.ts` | `/user/login`、`/user/info`、`/user/register` | 已打通，但鉴权是假 token |
| 地址 | `pages-user/address/*` | `/user/address/list/create/update/delete/setDefault` | 已打通，但后端未落库 |
| 积分/余额 | `pages/points`、`pages-user/balance` | `/user/pointsChangeList`、`/user/balanceChangeList` | 已打通，但数据 mock |
| 推广/佣金/提现 | `pages-user/agency/*`、`pages-user/balance/*` | `/user/dateStats`、`/user/myInviteList`、`/user/commissionList`、`/withdrawal/*` | 已打通，但数据 mock |
| 消息/公告 | `pages-user/message/*`、`pages/notice` | `/message/list`、`/message/detail`、`/index/publicDetail` | 已打通，消息仍 mock |

## 5. 当前仍然使用 mock 数据的模块

### 后端因 Supabase 配置占位而整体降级 mock

`server/.env` 当前仍是占位值：

- `SUPABASE_URL=https://your-project-ref.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key`

因此 `server/src/supabase.ts` 的 `hasSupabaseConfig()` 会返回 `false`，后端运行时会进入 `server/src/mock-data.ts` 分支。也就是说：即使后端接口齐全，本地默认运行状态仍不是读取真实 Supabase 数据库。

### 后端接口级 mock/假实现

| 模块 | 接口 | mock/假实现说明 |
| --- | --- | --- |
| 登录鉴权 | `/user/login`、`/user/info` | 使用固定 `mock-token-001`，没有密码校验、验证码校验、会话失效机制 |
| 微信登录 | `/user/loginByCode`、`/user/wechatPhoneLogin` | 根据 code 拼接 mock openId，不调用微信服务端 |
| 注册 | `/user/register` | 直接返回 token/userInfo，不创建真实用户 |
| 地址 | `/user/address/*` | 返回传入 query 或固定地址，未写入 Supabase |
| 积分/余额流水 | `/user/pointsChangeList`、`/user/balanceChangeList` | 运行时构造数组 |
| 推广/佣金 | `/user/dateStats`、`/user/myInviteList`、`/user/commissionList` | 运行时构造数组 |
| 提现 | `/withdrawal/getApplyList`、`/withdrawal/submitApply` | 运行时构造数组/审核中状态 |
| 支付 | `/order/pay`、`/order/wechatMiniAppPay` | 直接把订单状态改为已支付，不调用支付网关 |
| 消息 | `/message/list`、`/message/detail` | 使用 `mockMessages` |
| 商家公司 | `/shop/companyList` | 固定“火花自营” |
| 盲盒抽奖 | `/productBox/boxDraw`、`/productBox/testDraw` | 简单轮询/取样，不按 `draw_weight` 做真实概率抽奖 |

### 前端仍走 mock 的模块

| 模块 | 文件 | 说明 |
| --- | --- | --- |
| 个人中心卡片数据 | `src/service/usercenter/fetchUsercenter.ts` | `config.useMock = true` 时返回 `genUsercenter()` |
| 商品分类旧页面 | `src/pages/goods/category/index.vue` -> `src/service/good/fetchCategoryList.ts` | 旧 service mock |
| 购物车 | `src/service/cart/cart.ts` | 当前无页面明确主链路使用，仍是 mock |
| 搜索 | `src/service/good/fetchSearchResult.ts` | 仅 mock/占位 |
| 评论 | `src/service/comments/*`、`src/service/good/comments/*` | mock/占位 |
| 活动/营销 | `src/service/activity/*`、`src/service/promotion/*` | mock/占位 |
| 结算旧接口 | `src/service/order/orderConfirm.ts` | mock 结算/提交 |
| 地址旧接口 | `src/service/address/fetchAddress.ts` | mock/占位 |

## 6. 当前未完成的功能

| 功能 | 未完成点 |
| --- | --- |
| 真实鉴权 | 没有密码/验证码校验，没有 JWT/session，没有用户维度鉴权，固定 `DEFAULT_USER_ID = 10001` |
| 微信登录 | 没有接微信 code2Session、手机号解密或服务端校验 |
| 支付 | 没有微信支付/余额支付真实扣款、回调、验签、幂等、退款 |
| 余额/积分 | 订单支付、兑换、分解、寄售收益未形成可信账户流水 |
| 库存 | products 没有 stock 字段，购买/抽奖/提货未锁库存或扣库存 |
| 订单状态机 | 订单状态直接 update，缺少状态流转约束、取消/超时/发货/售后 |
| 盲盒抽奖 | 未使用权重概率，缺少保底、奖池库存、抽奖记录、并发控制 |
| 地址 | 后端接口未落库，数据库也没有 address 表 |
| 优惠券 | 下单参数包含 `couponId/couponAmount`，但没有 coupon 表和接口 |
| 购物车 | 有旧 mock service，无明确后端购物车表/接口/页面主链路 |
| 搜索 | 有旧 mock service，无后端搜索接口 |
| 评论 | 有 mock service，无评论表/接口 |
| 消息/公告 | 无 message/notice 独立表，消息仍 mock，公告复用 banners |
| 文件上传 | 前端有上传工具和 `/upload` baseURL，但后端没有上传接口 |
| 后台管理 | 当前没有商品、订单、用户、库存、发货、寄售审核后台 |
| 测试/CI | 未看到测试体系；当前 shell 中 `pnpm` 不可用，未完成 type-check 验证 |

## 7. 高风险模块

| 风险等级 | 模块 | 风险说明 | 建议 |
| --- | --- | --- | --- |
| 极高 | 支付 | `/order/pay` 和 `/order/wechatMiniAppPay` 是直接置已支付；没有支付单、回调、验签、金额校验、幂等 | 上线前必须重做支付域 |
| 极高 | 登录/鉴权 | 固定 token、固定用户、接口不校验真实身份；后端使用 service role 访问数据库 | 引入真实 auth/session，所有用户数据按 user_id 隔离 |
| 极高 | 密钥管理 | 根 `env/.env` 出现 Supabase service role key 形态变量；该类 key 绝不能进入前端/仓库交接 | 立即轮换密钥，移出根 env，只保留后端私有环境变量 |
| 高 | 库存/奖池 | 没有库存字段和扣减逻辑，盲盒抽奖可重复产出同一商品 | 建库存表/奖池表，使用事务或 RPC 保证原子性 |
| 高 | 订单 | 状态流转松散，缺少支付前金额重算、订单归属校验、并发保护 | 建订单状态机和服务层，所有写操作校验 user_id |
| 高 | 余额/积分 | 前端本地扣余额/积分，后端无可信账户流水闭环 | 建 ledger 表，所有账户变更服务端事务执行 |
| 中高 | Supabase RLS | schema 开启 RLS，但后端 service role 绕过 RLS；业务授权全部依赖后端代码，目前后端没有用户鉴权 | service role 仅后端使用，同时补齐服务端权限校验 |
| 中高 | 后端结构 | 所有路由和业务写入集中在 `app.ts`，继续扩展会快速失控 | 拆分 route/controller/service/repository |
| 中 | GET 写操作 | 下单、支付、地址变更、寄售变更大量使用 GET | 改为 POST/PUT/DELETE，避免缓存、重放和语义问题 |

## 8. Supabase 当前数据表结构说明

当前应以 `server/supabase/schema.sql` 为准；`server/supabase-schema.sql` 是早期精简版，缺少盲盒、盒柜、寄售等表。

| 表 | 作用 | 关键字段 |
| --- | --- | --- |
| `users` | 用户基础资料 | `id`、`phone`、`password`、`username`、`avatar`、`balance`、`points`、`sex`、`is_agent`、`open_id`、`token`、`created_at` |
| `product_categories` | 商品分类 | `id`、`cate_name`、`icon`、`sort`、`created_at` |
| `products` | 商品主数据 | `id`、`cate_id`、`product_name`、`product_grade`、`premium`、`exchange_price`、`dismantle_price`、`shipping_fee`、`store_page_icon`、`product_detail_ad_image`、`product_detail_images`、`show_store`、`is_recommend`、`is_hot` |
| `product_boxes` | 盲盒主数据 | `id`、`box_id`、`name`、`description`、`img_src`、`price`、`first_price`、`discount_price`、`prize_price_limit`、`type`、`detail_img`、`sort` |
| `product_box_items` | 盲盒商品池 | `id`、`box_id`、`product_id`、`draw_weight`、`sort` |
| `orders` | 订单表 | `id`、`order_no`、`user_id`、`box_id`、`order_type`、`status`、`total_price`、`shipping_fee`、`total_points`、`product_count`、`product_list`、`exchange_list`、`address`、`content`、`detail_img` |
| `user_box_products` | 用户盒柜商品 | `id`、`user_id`、`product_id`、`source_order_no`、`status`、`price`、`sell_price`、`product_snapshot` |
| `consignment_orders` | 寄售订单 | `id`、`user_id`、`user_box_product_id`、`status`、`sell_price`、`product_snapshot` |
| `banners` | 首页 banner/公告图 | `id`、`type`、`box_id`、`img_src`、`detail_img`、`sort` |

索引：

- `idx_products_cate_id`
- `idx_box_items_box_id`
- `idx_user_box_products_status`
- `idx_consignment_orders_status`

RLS：

- schema 对所有 public 表启用了 RLS。
- 已配置公开读取 policy 的表：`product_categories`、`products`、`product_boxes`、`product_box_items`、`banners`。
- `users`、`orders`、`user_box_products`、`consignment_orders` 没有普通公开 policy，当前主要依赖后端 service role 访问。

缺失但业务需要的表：

- `addresses`
- `payments` / `payment_orders`
- `account_ledger` / `points_ledger`
- `inventory` / `stock_movements`
- `draw_records`
- `coupons`
- `messages`
- `comments`
- `shipments`
- `withdrawals`

## 9. 前后端整体调用链路

### 主链路

```text
页面/组件
  -> src/api/*.ts
  -> src/http/request/alova.ts
  -> VITE_API_BASE_URL / VITE_SERVER_BASEURL
  -> server/src/app.ts Express 路由
  -> hasSupabaseConfig()
      -> false: server/src/mock-data.ts
      -> true: Supabase client 查询/写入
  -> server/src/mappers.ts 字段转换
  -> { code: 200, message: "success", data }
  -> alova responded 解包 data
  -> 页面渲染 / Pinia 状态更新
```

### 登录链路

```text
pages/login/login.vue
  -> store/user.ts login()
  -> api/auth.ts POST /user/login
  -> 后端返回 token
  -> store 写入 uni storage
  -> store/user.ts getUserInfo()
  -> api/auth.ts GET /user/info
  -> Pinia userInfo 持久化
```

当前问题：token 是固定 mock token，`/user/info` 默认映射到测试用户，无法支撑真实多用户权限。

### 商品购买链路

```text
goods/detail 或 goods/order
  -> /product/productInfo 或 /product/list
  -> /product/createOrder
  -> /order/pay 或 /order/wechatMiniAppPay
  -> /order/orderDetail / order result
```

当前问题：创建订单会写 `orders`，但支付只是置状态，没有金额校验和支付回调。

### 盲盒链路

```text
blindbox/detail
  -> /productBox/boxInfo
  -> /productBox/createOrder
  -> /order/pay
  -> blindbox/winner
  -> /productBox/boxDraw
  -> 写 user_box_products 并更新 orders.product_list/status
```

当前问题：抽奖没有事务、库存、权重概率和用户归属校验。

### 盒柜/寄售链路

```text
box/index
  -> /order/unOpendBoxList
  -> /order/productList
  -> /order/mySellList

寄售操作
  -> /order/productFastSell 或 /order/productCommonSell
  -> 写 consignment_orders
  -> 更新 user_box_products.status = 2
```

当前问题：寄售价格、商品归属、状态变更缺少后端强校验。

## 10. 项目当前完成度评估

综合评估：**约 55%**

拆分估算：

| 维度 | 完成度 | 说明 |
| --- | --- | --- |
| 前端页面完整度 | 75% | 主要页面齐全，交互链路大多能跑 |
| 前端 API 接入 | 65% | 主业务已接 `src/api/*`，但旧 mock/service 残留较多 |
| 后端接口覆盖 | 60% | 页面实际调用接口基本补齐，但大量是假实现 |
| 数据库 schema | 45% | 核心商品/订单/盲盒/寄售有基础表，支付、库存、地址、流水缺失 |
| 生产可用性 | 25% | 支付、鉴权、库存、订单状态、密钥管理均未达上线标准 |
| 可维护性 | 45% | 后端单文件膨胀，新旧 mock/请求体系并存 |

判断：当前更接近“可演示、可继续联调的业务原型”，不是“可上线的商城系统”。

## 11. 下一阶段推荐开发顺序

1. **密钥与环境治理**
   - 轮换已出现的 Supabase service role key。
   - 根 `env/.env` 不再保存服务端密钥。
   - 明确前端只保留 `VITE_*` 可公开变量，后端只从 `server/.env` 或部署平台私密变量读取 service role。

2. **真实登录与用户隔离**
   - 明确登录方式：手机号验证码、密码、微信小程序或 Supabase Auth。
   - 移除固定 `DEFAULT_USER_ID = 10001` 和固定 token 逻辑。
   - 所有订单、盒柜、地址、余额、寄售接口按当前登录用户过滤。

3. **补齐账户与地址基础表**
   - 新增 `addresses`、`account_ledger`、`points_ledger`、`withdrawals`。
   - 地址接口改为真实 CRUD。
   - 积分/余额变动全部后端事务写流水。

4. **重做订单和支付闭环**
   - 新增支付单表，创建订单时服务端重算金额。
   - 接入微信支付/余额支付，处理回调、验签、幂等。
   - 订单状态机集中管理，不允许任意接口直接改状态。

5. **库存与盲盒奖池**
   - 给商品/奖池加库存。
   - 抽奖使用数据库事务或 RPC，按权重、库存、保底规则原子出奖。
   - 保存 `draw_records`，支持审计和客服排查。

6. **拆分后端结构**
   - `app.ts` 只保留中间件和路由挂载。
   - 按 `auth`、`product`、`box`、`order`、`consignment`、`user` 拆 controller/service/repository。
   - 把 mock fallback 明确隔离，避免生产误用。

7. **清理前端旧 mock/service**
   - 统一使用 `src/api/*` + alova。
   - 处理 `src/service/usercenter`、`src/service/good`、`src/service/comments` 等旧 mock。
   - 删除或隔离 Petstore/OpenAPI demo，避免误接入。

8. **补测试与验收清单**
   - 先覆盖登录、创建订单、支付回调、抽奖、寄售、提货、分解。
   - 加接口冒烟测试和数据库 seed 验证。
   - 恢复 `pnpm type-check`、lint、build 的本地和 CI 验证。

## 12. 接管备注

- 当前工作区已有未提交变更：`server/src/app.ts`、`server/src/mappers.ts`、`server/src/mock-data.ts`、`server/src/types.ts`，以及新增未跟踪的 `server/API_TODO.md`、`server/supabase/`。接管时不要直接覆盖这些文件。
- 本次分析只新增本文档，没有修改业务代码。
- 当前 shell 中 `pnpm` 不可用，执行 `pnpm type-check` 失败，错误为命令未找到；因此没有完成类型检查或构建验证。
- `mock-server/` 与 `server/` 都占用默认 `3001` 端口。后续开发建议只保留 `server/` 作为主后端，`mock-server/` 归档或明确标记为历史工具。
