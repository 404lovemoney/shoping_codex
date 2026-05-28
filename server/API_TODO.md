# API TODO

扫描范围：`src/api`、`src/service`、`src/utils`、`src/http`、`src/store` 与 `server/src/app.ts`。

说明：

- “实际调用”指已被页面、组件或 `src/store/user.ts` 引用，运行时可能直接请求后端。
- `src/service/app/*` 与 `src/service/index/foo.ts` 是 OpenAPI/Petstore 示例或 demo，本轮按要求不处理。
- 商品、盲盒、订单、寄售相关表结构已补充到 `server/supabase/schema.sql`，测试数据已补充到 `server/supabase/seed.sql`。
- `server/supabase/schema.sql` 已对 public 表启用 RLS，并给商品、盲盒、banner 等公开读取表添加 select policy；服务端仍通过 service role 访问业务写入接口。
- 支付、微信登录、提现当前是假实现，不接真实第三方能力。

## 当前页面实际调用且未实现

暂无。此前列出的页面实际调用缺口已移动到“已实现接口”。

### cart

未发现当前页面实际调用的后端购物车接口。`src/service/cart/cart.ts` 只返回 mock 数据，没有明确 API 路径。

### coupon

未发现当前页面实际调用的优惠券接口。部分下单参数包含 `couponId`、`couponAmount`，但没有独立 coupon API。

### search

未发现当前页面实际调用的后端搜索接口。`src/service/good/fetchSearchResult.ts` 只返回 mock/占位数据，没有明确 API 路径。

## 已实现接口

### auth

- POST `/user/login`
- POST `/user/register`
- GET `/user/info`
- GET `/user/wechatPhoneLogin`（mock）
- GET `/user/loginByCode`（mock）
- GET `/user/setNickName`（mock）

### user

- GET `/user/pointsChangeList`
- GET `/user/balanceChangeList`
- GET `/user/dateStats`（mock）
- GET `/user/myInviteList`（mock）
- GET `/user/commissionList`（mock）
- GET `/withdrawal/getApplyList`（mock）
- GET `/withdrawal/submitApply`（mock）
- GET `/message/list`
- GET `/message/detail`

### product

- GET `/product/cateList`
- GET `/product/list`
- GET `/product/productInfo`
- GET `/product/createOrder`
- GET `/product/exchangeProduct`
- GET `/productBox/boxInfo`
- GET `/productBox/createOrder`
- GET `/productBox/boxDraw`
- GET `/productBox/testDraw`

### order

- GET `/order/orderList`
- GET `/order/orderDetail`
- GET `/order/confirmReceipt`
- GET `/order/pay`（mock 支付）
- GET `/order/wechatMiniAppPay`（mock 支付）
- GET `/order/collectProducts`
- GET `/order/unOpendBoxList`
- GET `/order/productList`
- GET `/order/mySellList`
- GET `/order/sellingProductList`
- GET `/order/sellingProductInfo`
- GET `/order/cancelSell`
- GET `/order/productFastSell`
- GET `/order/productCommonSell`
- GET `/order/dismantleProduct`

### address

- GET `/user/address/list`
- GET `/user/address/create`
- GET `/user/address/update`
- GET `/user/address/delete`
- GET `/user/address/setDefault`

### index

- GET `/index/index`
- GET `/index/publicDetail`

### other

- GET `/health`
- GET `/shop/companyList`（mock）

## 未实现接口

### auth

以下来自未被页面引用的旧接口文件 `src/api/login.ts`，本轮未处理：

- GET `/user/getCode`
- GET `/user/logout`
- POST `/user/updateInfo`
- POST `/user/updatePassword`
- POST `/user/wxLogin`

### cart

- 暂无可确认的后端接口路径。

### coupon

- 暂无可确认的后端接口路径。

### search

- 暂无可确认的后端接口路径。

### other

以下接口来自未被页面引用的 OpenAPI/Petstore 示例代码 `src/service/app/*`，按要求不处理：

- POST `/user`
- GET `/user/:username`
- PUT `/user/:username`
- DELETE `/user/:username`
- POST `/user/createWithArray`
- POST `/user/createWithList`
- GET `/user/login`
- GET `/user/logout`
- GET `/store/inventory`
- POST `/store/order`
- GET `/store/order/:orderId`
- DELETE `/store/order/:orderId`
- PUT `/pet`
- POST `/pet`
- GET `/pet/:petId`
- POST `/pet/:petId`
- DELETE `/pet/:petId`
- POST `/pet/:petId/uploadImage`
- GET `/pet/findByStatus`
- GET `/pet/findByTags`

以下接口来自未被页面引用的 demo 文件 `src/service/index/foo.ts`，按要求不处理：

- GET `/foo`
- POST `/foo`

## 重复接口

### auth

- POST `/user/login`
  - `src/api/auth.ts`
  - `src/api/login.ts`
- GET `/user/info`
  - `src/api/auth.ts`
  - `src/api/login.ts`
- GET `/user/logout`
  - `src/api/login.ts`
  - `src/service/app/user.ts`

### user/address

- GET `/user/address/list`
  - `src/api/auth.ts`
  - `src/api/address.ts`

### order

- GET `/order/sellingProductList`
  - `src/api/boxInfo.ts`
  - `src/api/consignment.ts`
- GET `/order/sellingProductInfo`
  - `src/api/boxInfo.ts`
  - `src/api/consignment.ts`
- GET `/order/cancelSell`
  - `src/api/boxInfo.ts`
  - `src/api/consignment.ts`
- GET `/order/productFastSell`
  - `src/api/boxInfo.ts`
  - `src/api/consignment.ts`
- GET `/order/productCommonSell`
  - `src/api/boxInfo.ts`
  - `src/api/consignment.ts`

### demo/generated

- GET `/user/login` 与 POST `/user/login` 路径相同但方法不一致
  - GET 来自 `src/service/app/user.ts`
  - POST 来自 `src/api/auth.ts`、`src/api/login.ts`
- GET `/foo`
  - `getFooAPI`
  - `getFooAPI2`
- POST `/foo`
  - `postFooAPI`
  - `postFooAPI2`
  - `postFooAPI3`

## 无人使用的废弃接口

### server 已实现但当前前端未实际调用

- GET `/health`
- GET `/index/index`

### 前端声明但当前页面未引用

- `src/api/home.ts`
  - GET `/index/index`
- `src/api/login.ts`
  - GET `/user/getCode`
  - POST `/user/login`
  - GET `/user/info`
  - GET `/user/logout`
  - POST `/user/updateInfo`
  - POST `/user/updatePassword`
  - POST `/user/wxLogin`
- `src/api/consignment.ts`
  - GET `/order/sellingProductList`
  - GET `/order/sellingProductInfo`
  - GET `/order/cancelSell`
  - GET `/order/productFastSell`
  - GET `/order/productCommonSell`
  - GET `/shop/companyList`
- `src/service/app/*`
  - Petstore/OpenAPI 示例接口，当前页面未引用。
- `src/service/index/foo.ts`
  - `/foo` demo 接口，当前页面未引用。
