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

const adminToken = 'mock-token-admin'

const adminUserInfo = {
  isAgent: 1,
  id: '90001',
  open_id: 'mock-admin-open-id',
  username: 'admin',
  nickName: '演示管理员',
  phone: '13800123456',
  balance: 1288.66,
  points: 9680,
  sex: '未知',
  avatar: 'https://img.niantu.cn/spark-mall/static/images/default-avatar.png',
  token: adminToken,
  openId: 'mock-admin-open-id',
}

const getRequestToken = req => {
  const authorizationToken = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  const xToken = Array.isArray(req.headers['x-token']) ? req.headers['x-token'][0] : req.headers['x-token']
  return xToken || authorizationToken || ''
}

const isAdminRequest = req => getRequestToken(req) === adminToken

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

const adminAddressList = [
  {
    id: 9001,
    userId: 90001,
    contactName: '演示管理员',
    contactPhone: '13800123456',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    detailAddress: '火花商城演示中心 6 号楼 1201',
    areaValues: '330000,330100,330106',
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

const adminOrders = [
  {
    id: 90001,
    orderNo: 'ADMIN202605280001',
    orderType: 2,
    status: 0,
    totalPrice: '199.00',
    shippingFee: '8.00',
    totalPoints: '0',
    exchangeTotalPoints: '0',
    created_at: '2026-05-28 10:20:00',
    expireTime: '2026-05-28 23:59:59',
    productCount: 2,
    productList: [{ ...products[0], count: 1 }, { ...products[1], count: 1 }],
    exchangeList: [],
    address: adminAddressList[0],
    content: 'admin 演示待付款订单',
    detailImg: image('admin-order-detail-1', 750, 420),
  },
  {
    id: 90002,
    orderNo: 'ADMIN202605280002',
    orderType: 2,
    status: 1,
    totalPrice: '268.00',
    shippingFee: '0.00',
    totalPoints: '0',
    exchangeTotalPoints: '0',
    created_at: '2026-05-27 16:30:00',
    expireTime: '2026-05-27 23:59:59',
    productCount: 1,
    productList: [{ ...products[4], count: 1 }],
    exchangeList: [],
    address: adminAddressList[0],
    content: 'admin 演示待发货订单',
    detailImg: image('admin-order-detail-2', 750, 420),
  },
  {
    id: 90003,
    orderNo: 'ADMIN202605280003',
    orderType: 3,
    status: 2,
    totalPrice: '8.00',
    shippingFee: '8.00',
    totalPoints: '1280',
    exchangeTotalPoints: '520',
    created_at: '2026-05-26 09:45:00',
    expireTime: '2026-05-26 23:59:59',
    productCount: 1,
    productList: [{ ...products[2], count: 1 }],
    exchangeList: [{ ...products[3], count: 1 }],
    address: adminAddressList[0],
    content: 'admin 演示待收货积分订单',
    detailImg: image('admin-order-detail-3', 750, 420),
  },
  {
    id: 90004,
    orderNo: 'ADMIN202605280004',
    orderType: 2,
    status: 3,
    totalPrice: '76.00',
    shippingFee: '0.00',
    totalPoints: '0',
    exchangeTotalPoints: '0',
    created_at: '2026-05-25 14:10:00',
    expireTime: '2026-05-25 23:59:59',
    productCount: 1,
    productList: [{ ...products[5], count: 1 }],
    exchangeList: [],
    address: adminAddressList[0],
    content: 'admin 演示已完成订单',
    detailImg: image('admin-order-detail-4', 750, 420),
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
  const password = String(req.body?.password || '')
  if (String(phone).trim().toLowerCase() === 'admin' && password === '123456') {
    return res.json(success({
      token: adminToken,
      userInfo: adminUserInfo,
    }))
  }

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

app.get('/user/info', (req, res) => {
  res.json(success(isAdminRequest(req) ? adminUserInfo : userInfo))
})

app.get('/user/address/list', (req, res) => {
  res.json(success(isAdminRequest(req) ? adminAddressList : addressList))
})

app.get('/user/address/create', (req, res) => {
  const address = {
    id: Date.now(),
    userId: userInfo.id,
    contactName: String(req.query.contactName || ''),
    contactPhone: String(req.query.contactPhone || ''),
    province: String(req.query.province || ''),
    city: String(req.query.city || ''),
    district: String(req.query.district || ''),
    detailAddress: String(req.query.detailAddress || ''),
    areaValues: String(req.query.areaValues || ''),
    isDefault: Number(req.query.isDefault || 0),
  }

  if (address.isDefault === 1) {
    addressList.forEach(item => {
      item.isDefault = 0
    })
  }

  addressList.unshift(address)
  res.json(success(address))
})

app.get('/user/address/update', (req, res) => {
  const id = Number(req.query.id || 0)
  const index = addressList.findIndex(item => item.id === id)
  if (index < 0) {
    return res.json(success(null))
  }

  const nextAddress = {
    ...addressList[index],
    contactName: String(req.query.contactName || addressList[index].contactName || ''),
    contactPhone: String(req.query.contactPhone || addressList[index].contactPhone || ''),
    province: String(req.query.province || addressList[index].province || ''),
    city: String(req.query.city || addressList[index].city || ''),
    district: String(req.query.district || addressList[index].district || ''),
    detailAddress: String(req.query.detailAddress || addressList[index].detailAddress || ''),
    areaValues: String(req.query.areaValues || addressList[index].areaValues || ''),
    isDefault: Number(req.query.isDefault ?? addressList[index].isDefault ?? 0),
  }

  if (nextAddress.isDefault === 1) {
    addressList.forEach(item => {
      item.isDefault = 0
    })
  }

  addressList[index] = nextAddress
  res.json(success(nextAddress))
})

app.get('/user/address/delete', (req, res) => {
  const id = Number(req.query.id || 0)
  const index = addressList.findIndex(item => item.id === id)
  if (index >= 0) {
    addressList.splice(index, 1)
  }
  res.json(success({ id }))
})

app.get('/user/address/setDefault', (req, res) => {
  const id = Number(req.query.id || 0)
  addressList.forEach(item => {
    item.isDefault = item.id === id ? 1 : 0
  })
  res.json(success({ id, isDefault: 1 }))
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
  const sourceOrders = isAdminRequest(req) ? adminOrders : orders
  const list = status === null ? sourceOrders : sourceOrders.filter(item => item.status === status)
  const { list: orderList, pagination } = paginate(list, req.query)
  res.json(success({ orderList, pagination }))
})

app.get('/order/orderDetail', (req, res) => {
  const sourceOrders = isAdminRequest(req) ? adminOrders : orders
  const order = sourceOrders.find(item => item.orderNo === req.query.orderNo) || sourceOrders[0]
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
