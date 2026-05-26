import cors from 'cors'
import express from 'express'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const success = (data = null, message = 'success') => ({
  code: 200,
  message,
  data,
})

const createPagination = (total, page, pageSize) => ({
  total,
  pageSize,
  currentPage: page,
  lastPage: Math.max(1, Math.ceil(total / pageSize)),
})

const paginate = (list, query = {}) => {
  const page = Number(query.page || 1)
  const pageSize = Number(query.pageSize || 10)
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    pagination: createPagination(list.length, page, pageSize),
  }
}

const image = (seed, width = 600, height = 600) =>
  `https://picsum.photos/seed/spark-mall-${seed}/${width}/${height}`

const userInfo = {
  isAgent: 1,
  id: '10001',
  open_id: 'mock-open-id',
  username: '火花用户',
  phone: '13800138000',
  balance: 268.8,
  points: 3600,
  sex: '未知',
  avatar: 'https://img.niantu.cn/spark-mall/static/images/default-avatar.png',
  token: 'mock-token-spark-mall',
  openId: 'mock-open-id',
}

const categories = [
  { cateId: 1, cateName: '潮玩手办', icon: image('cate-toy', 160, 160) },
  { cateId: 2, cateName: '数码周边', icon: image('cate-digital', 160, 160) },
  { cateId: 3, cateName: '生活好物', icon: image('cate-life', 160, 160) },
  { cateId: 4, cateName: '积分专区', icon: image('cate-points', 160, 160) },
  { cateId: 5, cateName: '新品推荐', icon: image('cate-new', 160, 160) },
  { cateId: 6, cateName: '热销精选', icon: image('cate-hot', 160, 160) },
]

const products = Array.from({ length: 24 }, (_, index) => {
  const id = index + 1
  const cateId = (index % categories.length) + 1
  const premium = (39 + id * 7).toFixed(2)
  return {
    id,
    cateId,
    productName: `火花精选商品 ${id}`,
    productGrade: ['N', 'R', 'SR', 'SSR'][index % 4],
    premium,
    exchangePrice: String(300 + id * 60),
    dismantlePrice: String(80 + id * 15),
    shippingFee: id % 3 === 0 ? '0.00' : '8.00',
    currency: '¥',
    count: 1,
    storePageIcon: image(`product-${id}`, 600, 600),
    productDetailAdImage: image(`product-ad-${id}`, 750, 360),
    productDetailImages: [
      image(`product-detail-${id}-1`, 750, 900),
      image(`product-detail-${id}-2`, 750, 900),
    ],
  }
})

const addressList = [
  {
    id: 1,
    userId: 10001,
    contactName: '火花用户',
    contactPhone: '13800138000',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    detailAddress: '文三路 100 号 mock 地址',
    isDefault: 1,
  },
]

const orders = [
  {
    id: 1,
    orderNo: 'MOCK202605230001',
    orderType: 2,
    status: 0,
    totalPrice: '108.00',
    shippingFee: '8.00',
    totalPoints: '0',
    exchangeTotalPoints: '0',
    created_at: '2026-05-23 17:00:00',
    expireTime: '2026-05-23 23:59:59',
    productCount: 2,
    productList: [
      { ...products[0], count: 1 },
      { ...products[1], count: 1 },
    ],
    exchangeList: [],
    address: addressList[0],
    content: '本地 mock 订单',
    detailImg: image('order-detail', 750, 420),
  },
  {
    id: 2,
    orderNo: 'MOCK202605230002',
    orderType: 3,
    status: 2,
    totalPrice: '8.00',
    shippingFee: '8.00',
    totalPoints: '960',
    exchangeTotalPoints: '420',
    created_at: '2026-05-22 10:30:00',
    expireTime: '2026-05-22 23:59:59',
    productCount: 1,
    productList: [{ ...products[2], count: 1 }],
    exchangeList: [{ ...products[3], count: 1 }],
    address: addressList[0],
    content: '积分兑换 mock 订单',
    detailImg: image('order-detail-2', 750, 420),
  },
  {
    id: 3,
    orderNo: 'MOCK202605210003',
    orderType: 2,
    status: 3,
    totalPrice: '76.00',
    shippingFee: '0.00',
    totalPoints: '0',
    exchangeTotalPoints: '0',
    created_at: '2026-05-21 09:20:00',
    expireTime: '2026-05-21 23:59:59',
    productCount: 1,
    productList: [{ ...products[4], count: 1 }],
    exchangeList: [],
    address: addressList[0],
    content: '已完成 mock 订单',
    detailImg: image('order-detail-3', 750, 420),
  },
]

const boxList = [
  {
    id: 1,
    name: '新人好运盒',
    desc: '首单专享好物',
    imgSrc: image('box-new-user', 744, 364),
    bgType: 1,
    iconType: 1,
    firstPrice: '9.9',
    discountPrice: '39',
    price: '19.9',
    prizePriceLimit: '最高199',
    type: 1,
    boxId: 1,
    detailImg: image('box-detail-new', 750, 900),
  },
  {
    id: 2,
    name: '热销惊喜盒',
    desc: '精选爆款集合',
    imgSrc: image('box-hot', 744, 364),
    bgType: 2,
    iconType: 2,
    firstPrice: '19.9',
    discountPrice: '59',
    price: '29.9',
    prizePriceLimit: '最高299',
    type: 1,
    boxId: 2,
    detailImg: image('box-detail-hot', 750, 900),
  },
]

app.get('/health', (_req, res) => {
  res.json(success({ status: 'ok', port: PORT }))
})

app.post('/user/login', (req, res) => {
  const phone = req.body?.phone || userInfo.phone
  res.json(success({
    token: userInfo.token,
    userInfo: {
      ...userInfo,
      phone: String(phone),
    },
  }))
})

app.post('/user/register', (_req, res) => {
  res.json(success({ token: userInfo.token, userInfo }))
})

app.get('/user/info', (_req, res) => {
  res.json(success(userInfo))
})

app.get('/user/address/list', (_req, res) => {
  res.json(success(addressList))
})

app.get('/user/pointsChangeList', (req, res) => {
  const records = Array.from({ length: 18 }, (_, index) => ({
    id: index + 1,
    title: index % 2 === 0 ? '下单消耗' : '活动赠送',
    points: index % 2 === 0 ? -120 : 200,
    created_at: '2026-05-23 12:00:00',
  }))
  const { list, pagination } = paginate(records, req.query)
  res.json(success({ recordList: list, pagination }))
})

app.get('/user/balanceChangeList', (req, res) => {
  const records = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: index % 2 === 0 ? '余额支付' : '售卖收入',
    amount: index % 2 === 0 ? '-12.00' : '+28.00',
    created_at: '2026-05-23 12:00:00',
  }))
  const { list, pagination } = paginate(records, req.query)
  res.json(success({ recordList: list, pagination }))
})

app.get('/index/index', (_req, res) => {
  res.json(success({
    ProductList: products.slice(0, 6),
    topList: [
      {
        id: 10001,
        type: 1,
        boxId: 1,
        imgSrc: image('banner-1', 382, 502),
        detailImg: image('notice-1', 750, 900),
      },
      {
        id: 10002,
        type: 2,
        boxId: 2,
        imgSrc: image('banner-2', 382, 502),
        detailImg: image('notice-2', 750, 900),
      },
    ],
    tuijianList: [boxList[0]],
    hotList: [boxList[1]],
  }))
})

app.get('/product/cateList', (_req, res) => {
  res.json(success(categories))
})

app.get('/product/list', (req, res) => {
  const cateId = req.query.id ? Number(req.query.id) : null
  const sort = Number(req.query.sort || 0)
  const order = req.query.order === 'asc' ? 'asc' : 'desc'
  let list = cateId ? products.filter(item => item.cateId === cateId) : [...products]

  if (sort === 1) {
    list.sort((a, b) => Number(a.premium) - Number(b.premium))
  }
  if (sort === 2) {
    list.sort((a, b) => Number(a.exchangePrice) - Number(b.exchangePrice))
  }
  if (order === 'desc') {
    list.reverse()
  }

  const { list: productList, pagination } = paginate(list, req.query)
  res.json(success({ productList, pagination }))
})

app.get('/product/productInfo', (req, res) => {
  const id = Number(req.query.id || 1)
  const product = products.find(item => item.id === id) || products[0]
  res.json(success(product))
})

app.get('/product/createOrder', (req, res) => {
  res.json(success({ orderNo: `MOCK${Date.now()}`, params: req.query }))
})

app.get('/product/exchangeProduct', (req, res) => {
  res.json(success({ orderNo: `MOCKEX${Date.now()}`, params: req.query }))
})

app.get('/order/orderList', (req, res) => {
  const status = req.query.status === undefined ? null : Number(req.query.status)
  const list = status === null ? orders : orders.filter(item => item.status === status)
  const { list: orderList, pagination } = paginate(list, req.query)
  res.json(success({ orderList, pagination }))
})

app.get('/order/orderDetail', (req, res) => {
  const order = orders.find(item => item.orderNo === req.query.orderNo) || orders[0]
  res.json(success(order))
})

app.get('/order/confirmReceipt', (req, res) => {
  const order = orders.find(item => item.orderNo === req.query.orderNo)
  if (order) {
    order.status = 3
  }
  res.json(success({ orderNo: req.query.orderNo }))
})

app.get('/order/pay', (req, res) => {
  const order = orders.find(item => item.orderNo === req.query.orderNo)
  if (order) {
    order.status = 1
  }
  res.json(success({ orderNo: req.query.orderNo, paid: true }))
})

app.get('/order/wechatMiniAppPay', (req, res) => {
  res.json(success({ orderNo: req.query.orderNo, paid: true }))
})

app.get('/order/collectProducts', (req, res) => {
  res.json(success({ orderNo: `MOCKCOL${Date.now()}`, params: req.query }))
})

app.get('/message/list', (req, res) => {
  const messages = [
    { id: 1, title: '本地 mock 通知', created_at: '2026-05-23 12:00:00', content: '欢迎使用本地 mock 服务。' },
  ]
  const { list, pagination } = paginate(messages, req.query)
  res.json(success({ messageList: list, list, pagination }))
})

app.get('/message/detail', (req, res) => {
  res.json(success({
    id: Number(req.query.id || 1),
    title: '本地 mock 通知',
    content: '这是本地 mock 服务返回的通知详情。',
    detailImg: image('message-detail', 750, 900),
  }))
})

app.get('/index/publicDetail', (req, res) => {
  res.json(success({
    id: Number(req.query.id || 1),
    title: '公告详情',
    detailImg: image(`public-detail-${req.query.id || 1}`, 750, 900),
    content: '本地 mock 公告内容',
  }))
})

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: `mock endpoint not found: ${req.method} ${req.path}`,
    data: null,
  })
})

app.listen(PORT, () => {
  console.log(`Spark Mall mock server is running at http://localhost:${PORT}`)
})
