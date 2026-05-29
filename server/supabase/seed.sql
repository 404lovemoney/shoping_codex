insert into public.users (id, phone, password, username, nickname, avatar, balance, points, sex, is_agent, open_id, token)
values
  (10001, '13800000000', '123456', 'test_user', '火花用户', 'https://img.niantu.cn/spark-mall/static/images/default-avatar.png', 268.80, 3600, '未知', 1, 'mock-open-id', 'mock-token-001'),
  (90001, '13800123456', '123456', 'admin', '管理员', 'https://img.niantu.cn/spark-mall/static/images/default-avatar.png', 1288.66, 9680, '未知', 1, 'mock-admin-open-id', 'mock-token-admin'),
  (90002, '13800123457', '123456', 'invitee_b', '好友B', 'https://img.niantu.cn/spark-mall/static/images/default-avatar.png', 0, 0, '未知', 0, null, null)
on conflict (id) do update set
  phone = excluded.phone,
  password = excluded.password,
  username = excluded.username,
  nickname = excluded.nickname,
  avatar = excluded.avatar,
  balance = excluded.balance,
  points = excluded.points,
  sex = excluded.sex,
  is_agent = excluded.is_agent,
  open_id = excluded.open_id,
  token = excluded.token;

insert into product_categories (id, cate_name, icon, sort)
values
  (1, '潮玩手办', 'https://picsum.photos/seed/spark-mall-cate-toy/160/160', 1),
  (2, '数码周边', 'https://picsum.photos/seed/spark-mall-cate-digital/160/160', 2),
  (3, '生活好物', 'https://picsum.photos/seed/spark-mall-cate-life/160/160', 3),
  (4, '积分专区', 'https://picsum.photos/seed/spark-mall-cate-points/160/160', 4)
on conflict (id) do update set
  cate_name = excluded.cate_name,
  icon = excluded.icon,
  sort = excluded.sort;

insert into products (
  id, cate_id, product_name, product_grade, premium, exchange_price,
  dismantle_price, shipping_fee, store_page_icon, product_detail_ad_image,
  product_detail_images, show_store, is_recommend, is_hot
)
values
  (1, 1, '火花精选商品 1', 'N', 46.00, 360, 95, 8.00, 'https://picsum.photos/seed/spark-mall-product-1/600/600', 'https://picsum.photos/seed/spark-mall-product-ad-1/750/360', '["https://picsum.photos/seed/spark-mall-product-detail-1-1/750/900","https://picsum.photos/seed/spark-mall-product-detail-1-2/750/900"]', 1, true, false),
  (2, 2, '火花精选商品 2', 'R', 53.00, 420, 110, 8.00, 'https://picsum.photos/seed/spark-mall-product-2/600/600', 'https://picsum.photos/seed/spark-mall-product-ad-2/750/360', '["https://picsum.photos/seed/spark-mall-product-detail-2-1/750/900","https://picsum.photos/seed/spark-mall-product-detail-2-2/750/900"]', 1, true, true),
  (3, 3, '火花精选商品 3', 'SR', 60.00, 480, 125, 0.00, 'https://picsum.photos/seed/spark-mall-product-3/600/600', 'https://picsum.photos/seed/spark-mall-product-ad-3/750/360', '["https://picsum.photos/seed/spark-mall-product-detail-3-1/750/900","https://picsum.photos/seed/spark-mall-product-detail-3-2/750/900"]', 1, false, true),
  (4, 4, '火花精选商品 4', 'SSR', 67.00, 540, 140, 8.00, 'https://picsum.photos/seed/spark-mall-product-4/600/600', 'https://picsum.photos/seed/spark-mall-product-ad-4/750/360', '["https://picsum.photos/seed/spark-mall-product-detail-4-1/750/900","https://picsum.photos/seed/spark-mall-product-detail-4-2/750/900"]', 1, false, true),
  (5, 1, '火花精选商品 5', 'N', 74.00, 600, 155, 8.00, 'https://picsum.photos/seed/spark-mall-product-5/600/600', 'https://picsum.photos/seed/spark-mall-product-ad-5/750/360', '["https://picsum.photos/seed/spark-mall-product-detail-5-1/750/900","https://picsum.photos/seed/spark-mall-product-detail-5-2/750/900"]', 1, true, false),
  (6, 2, '火花精选商品 6', 'R', 81.00, 660, 170, 0.00, 'https://picsum.photos/seed/spark-mall-product-6/600/600', 'https://picsum.photos/seed/spark-mall-product-ad-6/750/360', '["https://picsum.photos/seed/spark-mall-product-detail-6-1/750/900","https://picsum.photos/seed/spark-mall-product-detail-6-2/750/900"]', 1, false, true)
on conflict (id) do update set
  cate_id = excluded.cate_id,
  product_name = excluded.product_name,
  product_grade = excluded.product_grade,
  premium = excluded.premium,
  exchange_price = excluded.exchange_price,
  dismantle_price = excluded.dismantle_price,
  shipping_fee = excluded.shipping_fee,
  store_page_icon = excluded.store_page_icon,
  product_detail_ad_image = excluded.product_detail_ad_image,
  product_detail_images = excluded.product_detail_images,
  show_store = excluded.show_store,
  is_recommend = excluded.is_recommend,
  is_hot = excluded.is_hot;

insert into product_boxes (
  id, box_id, name, description, img_src, bg_type, icon_type,
  price, first_price, discount_price, prize_price_limit, type, detail_img, sort
)
values
  (1, 1, '新人好运盒', '首单专享好物', 'https://picsum.photos/seed/spark-mall-box-new-user/744/364', 1, 1, 19.90, 9.90, 39.00, '最高199', 1, 'https://picsum.photos/seed/spark-mall-box-detail-new/750/900', 1),
  (2, 2, '热销惊喜盒', '精选爆款集合', 'https://picsum.photos/seed/spark-mall-box-hot/744/364', 2, 2, 29.90, 19.90, 59.00, '最高299', 1, 'https://picsum.photos/seed/spark-mall-box-detail-hot/750/900', 2)
on conflict (id) do update set
  box_id = excluded.box_id,
  name = excluded.name,
  description = excluded.description,
  img_src = excluded.img_src,
  bg_type = excluded.bg_type,
  icon_type = excluded.icon_type,
  price = excluded.price,
  first_price = excluded.first_price,
  discount_price = excluded.discount_price,
  prize_price_limit = excluded.prize_price_limit,
  type = excluded.type,
  detail_img = excluded.detail_img,
  sort = excluded.sort;

insert into product_box_items (id, box_id, product_id, draw_weight, sort)
values
  (1, 1, 1, 10, 1),
  (2, 1, 2, 8, 2),
  (3, 1, 3, 4, 3),
  (4, 2, 4, 6, 1),
  (5, 2, 5, 5, 2),
  (6, 2, 6, 3, 3)
on conflict (id) do update set
  box_id = excluded.box_id,
  product_id = excluded.product_id,
  draw_weight = excluded.draw_weight,
  sort = excluded.sort;

insert into user_box_products (id, user_id, product_id, source_order_no, status, price, sell_price, product_snapshot)
values
  (1, 10001, 1, 'MOCKBOX202605260001', 0, 46.00, 0, '{"id":1,"productName":"火花精选商品 1","name":"火花精选商品 1","productGrade":"N","premium":"46.00","exchangePrice":"360","dismantlePrice":"95","storePageIcon":"https://picsum.photos/seed/spark-mall-product-1/600/600","icon":"https://picsum.photos/seed/spark-mall-product-1/600/600"}'),
  (2, 10001, 2, 'MOCKBOX202605260002', 1, 53.00, 0, '{"id":2,"productName":"火花精选商品 2","name":"火花精选商品 2","productGrade":"R","premium":"53.00","exchangePrice":"420","dismantlePrice":"110","storePageIcon":"https://picsum.photos/seed/spark-mall-product-2/600/600","icon":"https://picsum.photos/seed/spark-mall-product-2/600/600"}'),
  (3, 10001, 3, 'MOCKBOX202605260003', 2, 60.00, 72.00, '{"id":3,"productName":"火花精选商品 3","name":"火花精选商品 3","productGrade":"SR","premium":"60.00","exchangePrice":"480","dismantlePrice":"125","storePageIcon":"https://picsum.photos/seed/spark-mall-product-3/600/600","icon":"https://picsum.photos/seed/spark-mall-product-3/600/600"}')
on conflict (id) do update set
  user_id = excluded.user_id,
  product_id = excluded.product_id,
  source_order_no = excluded.source_order_no,
  status = excluded.status,
  price = excluded.price,
  sell_price = excluded.sell_price,
  product_snapshot = excluded.product_snapshot;

insert into consignment_orders (id, user_id, user_box_product_id, status, sell_price, product_snapshot)
values
  (1, 10001, 3, 0, 72.00, '{"id":3,"productName":"火花精选商品 3","name":"火花精选商品 3","productGrade":"SR","premium":"60.00","exchangePrice":"480","dismantlePrice":"125","sellPrice":"72.00","storePageIcon":"https://picsum.photos/seed/spark-mall-product-3/600/600","icon":"https://picsum.photos/seed/spark-mall-product-3/600/600"}')
on conflict (id) do update set
  user_id = excluded.user_id,
  user_box_product_id = excluded.user_box_product_id,
  status = excluded.status,
  sell_price = excluded.sell_price,
  product_snapshot = excluded.product_snapshot;

insert into orders (
  id, order_no, user_id, box_id, order_type, status, total_price,
  product_count, product_list, exchange_list, address, content, detail_img
)
values
  (1, 'MOCKBOX202605260001', 10001, 1, 1, 0, 19.90, 1, '[]', '[]', '{"id":1,"contactName":"火花用户","contactPhone":"13800138000","province":"浙江省","city":"杭州市","district":"西湖区","detailAddress":"文三路 100 号 mock 地址","isDefault":1}', '盲盒待开订单', 'https://picsum.photos/seed/spark-mall-box-detail-new/750/900')
on conflict (id) do update set
  order_no = excluded.order_no,
  user_id = excluded.user_id,
  box_id = excluded.box_id,
  order_type = excluded.order_type,
  status = excluded.status,
  total_price = excluded.total_price,
  product_count = excluded.product_count,
  product_list = excluded.product_list,
  exchange_list = excluded.exchange_list,
  address = excluded.address,
  content = excluded.content,
  detail_img = excluded.detail_img;

insert into orders (
  id, order_no, user_id, box_id, order_type, status, total_price,
  product_count, product_list, exchange_list, address, content, detail_img
)
values
  (90001, 'ADMIN202605280001', 90001, null, 2, 0, 199.00, 2, '[{"id":1,"productName":"火花精选商品1","name":"火花精选商品1","productGrade":"N","premium":"46.00","storePageIcon":"https://picsum.photos/seed/spark-mall-product-1/600/600","icon":"https://picsum.photos/seed/spark-mall-product-1/600/600","count":1},{"id":2,"productName":"火花精选商品2","name":"火花精选商品2","productGrade":"R","premium":"53.00","storePageIcon":"https://picsum.photos/seed/spark-mall-product-2/600/600","icon":"https://picsum.photos/seed/spark-mall-product-2/600/600","count":1}]', '[]', '{"id":9001,"contactName":"演示管理员","contactPhone":"13800123456","province":"浙江省","city":"杭州市","district":"西湖区","detailAddress":"火花商城演示中心 6 号楼 1201","isDefault":1}', 'admin 演示待付款订单', 'https://picsum.photos/seed/spark-mall-admin-order-detail-1/750/420'),
  (90002, 'ADMIN202605280002', 90001, null, 2, 1, 268.00, 1, '[{"id":5,"productName":"火花精选商品5","name":"火花精选商品5","productGrade":"N","premium":"74.00","storePageIcon":"https://picsum.photos/seed/spark-mall-product-5/600/600","icon":"https://picsum.photos/seed/spark-mall-product-5/600/600","count":1}]', '[]', '{"id":9001,"contactName":"演示管理员","contactPhone":"13800123456","province":"浙江省","city":"杭州市","district":"西湖区","detailAddress":"火花商城演示中心 6 号楼 1201","isDefault":1}', 'admin 演示待发货订单', 'https://picsum.photos/seed/spark-mall-admin-order-detail-2/750/420'),
  (90003, 'ADMIN202605280003', 90001, null, 3, 2, 8.00, 1, '[{"id":3,"productName":"火花精选商品3","name":"火花精选商品3","productGrade":"SR","premium":"60.00","storePageIcon":"https://picsum.photos/seed/spark-mall-product-3/600/600","icon":"https://picsum.photos/seed/spark-mall-product-3/600/600","count":1}]', '[{"id":4,"productName":"火花精选商品4","name":"火花精选商品4","productGrade":"SSR","premium":"67.00","storePageIcon":"https://picsum.photos/seed/spark-mall-product-4/600/600","icon":"https://picsum.photos/seed/spark-mall-product-4/600/600","count":1}]', '{"id":9001,"contactName":"演示管理员","contactPhone":"13800123456","province":"浙江省","city":"杭州市","district":"西湖区","detailAddress":"火花商城演示中心 6 号楼 1201","isDefault":1}', 'admin 演示待收货积分订单', 'https://picsum.photos/seed/spark-mall-admin-order-detail-3/750/420'),
  (90004, 'ADMIN202605280004', 90001, null, 2, 3, 76.00, 1, '[{"id":6,"productName":"火花精选商品6","name":"火花精选商品6","productGrade":"R","premium":"81.00","storePageIcon":"https://picsum.photos/seed/spark-mall-product-6/600/600","icon":"https://picsum.photos/seed/spark-mall-product-6/600/600","count":1}]', '[]', '{"id":9001,"contactName":"演示管理员","contactPhone":"13800123456","province":"浙江省","city":"杭州市","district":"西湖区","detailAddress":"火花商城演示中心 6 号楼 1201","isDefault":1}', 'admin 演示已完成订单', 'https://picsum.photos/seed/spark-mall-admin-order-detail-4/750/420')
on conflict (id) do update set
  order_no = excluded.order_no,
  user_id = excluded.user_id,
  box_id = excluded.box_id,
  order_type = excluded.order_type,
  status = excluded.status,
  total_price = excluded.total_price,
  product_count = excluded.product_count,
  product_list = excluded.product_list,
  exchange_list = excluded.exchange_list,
  address = excluded.address,
  content = excluded.content,
  detail_img = excluded.detail_img;

select setval(pg_get_serial_sequence('users', 'id'), coalesce((select max(id) from users), 1), true);
select setval(pg_get_serial_sequence('product_categories', 'id'), coalesce((select max(id) from product_categories), 1), true);
select setval(pg_get_serial_sequence('products', 'id'), coalesce((select max(id) from products), 1), true);
select setval(pg_get_serial_sequence('product_boxes', 'id'), coalesce((select max(id) from product_boxes), 1), true);
select setval(pg_get_serial_sequence('product_box_items', 'id'), coalesce((select max(id) from product_box_items), 1), true);
select setval(pg_get_serial_sequence('orders', 'id'), coalesce((select max(id) from orders), 1), true);
select setval(pg_get_serial_sequence('user_box_products', 'id'), coalesce((select max(id) from user_box_products), 1), true);
select setval(pg_get_serial_sequence('consignment_orders', 'id'), coalesce((select max(id) from consignment_orders), 1), true);
