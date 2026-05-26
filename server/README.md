# Spark Mall Server

独立后端项目，使用 Node.js + Express + TypeScript，并通过 `@supabase/supabase-js` 连接 Supabase PostgreSQL。

## 启动命令

```bash
cd server
pnpm install
pnpm dev
```

如果从项目根目录启动，也可以使用：

```bash
pnpm --dir server dev
```

生产构建：

```bash
cd server
pnpm build
pnpm start
```

默认端口：`3001`。

## 环境变量

在 `server/.env` 中配置：

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
PORT=3001
```

`SUPABASE_URL` 必须是完整 URL，例如 Supabase 项目设置里的 `https://xxxx.supabase.co`；`SUPABASE_SERVICE_ROLE_KEY` 使用项目 API Keys 中的 `service_role` key，只能放在后端环境变量中。

本地开发时，如果 `server/.env` 仍然是上面的占位值，后端会自动使用内置 mock 数据返回首页、商品、订单和用户信息接口；填入真实 Supabase 配置后会自动切换为读取数据库。

## 已实现接口

所有接口统一返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

当前已实现：

- `POST /user/login`
- `GET /user/info`
- `GET /index/index`
- `GET /product/cateList`
- `GET /product/list`
- `GET /product/productInfo`
- `GET /order/orderList`

## 建议 Supabase 表

当前代码默认读取这些表：

- `users`
- `products`
- `product_categories`
- `orders`
- `banners`

字段采用数据库常用 snake_case，接口返回时会映射为前端当前使用的 camelCase 字段。

可直接参考 `server/supabase-schema.sql` 初始化基础表结构。

## 目录结构

```text
server/
  .env
  .env.example
  README.md
  package.json
  supabase-schema.sql
  tsconfig.json
  src/
    app.ts
    mappers.ts
    response.ts
    supabase.ts
    types.ts
```
