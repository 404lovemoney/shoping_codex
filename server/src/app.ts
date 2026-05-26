import express from 'express'
import cors from 'cors'
import { getSupabase, hasSupabaseConfig } from './supabase.js'
import { failure, success } from './response.js'
import { mapBanner, mapHomeBox, mapOrder, mapProduct, mapProductCategory } from './mappers.js'
import { getMockProductRows, mockAddress, mockCategories, mockHome, mockMessages, mockOrders, mockUser } from './mock-data.js'
import type { BannerRow, OrderRow, ProductCategoryRow, ProductRow } from './types.js'

const app = express()
const port = Number(process.env.PORT || 3001)
const TEST_PHONE = '13800000000'
const TEST_TOKEN = 'mock-token-001'

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const getPagination = (total: number, page: number, pageSize: number) => ({
  total,
  pageSize,
  currentPage: page,
  lastPage: Math.max(1, Math.ceil(total / pageSize)),
})

const useMockData = () => !hasSupabaseConfig()

const createOrderNo = (prefix = 'SM') => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`

function paginate<T>(list: T[], page: number, pageSize: number) {
  const from = (page - 1) * pageSize
  const to = from + pageSize

  return {
    list: list.slice(from, to),
    pagination: getPagination(list.length, page, pageSize),
  }
}

function getMockOrder(orderNo: unknown) {
  return mockOrders.find(item => item.order_no === String(orderNo)) ?? mockOrders[0]
}

async function getSupabaseProduct(productId: number) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as ProductRow | null
}

async function createSupabaseOrder(params: {
  productId?: number
  orderType: number
  orderNoPrefix: string
  totalPrice?: unknown
  shippingFee?: unknown
  points?: unknown
  count?: unknown
  content: string
}) {
  const supabase = getSupabase()
  const product = params.productId ? await getSupabaseProduct(params.productId) : null
  const mappedProduct = product ? mapProduct(product) : null
  const orderNo = createOrderNo(params.orderNoPrefix)
  const count = Number(params.count || 1)

  const { error } = await supabase
    .from('orders')
    .insert({
      order_no: orderNo,
      order_type: params.orderType,
      status: 0,
      total_price: Number(params.totalPrice || product?.premium || 0),
      shipping_fee: Number(params.shippingFee || product?.shipping_fee || 0),
      total_points: Number(params.points || 0),
      exchange_total_points: Number(params.points || 0),
      product_count: count,
      product_list: mappedProduct ? [{ ...mappedProduct, count }] : [],
      exchange_list: [],
      address: mockAddress,
      content: params.content,
      detail_img: product?.product_detail_ad_image ?? product?.detail_img ?? null,
    })

  if (error) {
    throw error
  }

  return orderNo
}

app.get('/health', (_req, res) => {
  success(res, { status: 'ok', port })
})

app.post('/user/login', async (req, res) => {
  try {
    if (useMockData()) {
      const phone = String(req.body?.phone || mockUser.phone)

      return success(res, {
        token: TEST_TOKEN,
        userInfo: {
          ...mockUser,
          phone,
          token: TEST_TOKEN,
        },
      })
    }

    const supabase = getSupabase()
    const phone = String(req.body?.phone || TEST_PHONE)

    const { data, error } = await supabase
      .from('users')
      .select('id, phone, username, avatar, balance, points, sex, is_agent, open_id, token')
      .eq('phone', phone)
      .maybeSingle()

    if (error) {
      throw error
    }

    const token = TEST_TOKEN

    success(res, {
      token,
      userInfo: data
        ? {
            id: String(data.id),
            open_id: data.open_id,
            username: data.username,
            phone: data.phone,
            balance: data.balance ?? 0,
            points: data.points ?? 0,
            sex: data.sex ?? '',
            avatar: data.avatar ?? '',
            isAgent: data.is_agent ?? 0,
            token,
          }
        : null,
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/user/info', async (req, res) => {
  try {
    if (useMockData()) {
      return success(res, {
        ...mockUser,
        token: TEST_TOKEN,
      })
    }

    const supabase = getSupabase()
    const userId = req.query.id
    const authorizationToken = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    const xToken = Array.isArray(req.headers['x-token']) ? req.headers['x-token'][0] : req.headers['x-token']
    const token = xToken || authorizationToken || TEST_TOKEN
    let query = supabase
      .from('users')
      .select('id, phone, username, avatar, balance, points, sex, is_agent, open_id, token')

    if (userId) {
      query = query.eq('id', userId)
    }
    else if (token === TEST_TOKEN) {
      query = query.eq('phone', TEST_PHONE)
    }
    else {
      query = query.eq('token', token)
    }

    const { data, error } = await query.limit(1).maybeSingle()

    if (error) {
      throw error
    }

    success(res, data
      ? {
          id: String(data.id),
          open_id: data.open_id,
          username: data.username,
          phone: data.phone,
          balance: data.balance ?? 0,
          points: data.points ?? 0,
          sex: data.sex ?? '',
          avatar: data.avatar ?? '',
          isAgent: data.is_agent ?? 0,
          token: TEST_TOKEN,
        }
      : null)
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.post('/user/register', async (req, res) => {
  try {
    const phone = String(req.body?.phone || TEST_PHONE)

    success(res, {
      token: TEST_TOKEN,
      userInfo: {
        ...mockUser,
        phone,
        token: TEST_TOKEN,
      },
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/user/address/list', async (_req, res) => {
  success(res, [mockAddress])
})

app.get('/user/address/create', async (req, res) => {
  success(res, {
    id: Date.now(),
    ...req.query,
  })
})

app.get('/user/address/update', async (req, res) => {
  success(res, req.query)
})

app.get('/user/address/delete', async (req, res) => {
  success(res, { id: req.query.id })
})

app.get('/user/address/setDefault', async (req, res) => {
  success(res, { id: req.query.id, isDefault: 1 })
})

app.get('/user/pointsChangeList', async (req, res) => {
  const page = Number(req.query.page || 1)
  const pageSize = Number(req.query.pageSize || 10)
  const records = Array.from({ length: 18 }, (_, index) => ({
    id: index + 1,
    title: index % 2 === 0 ? '下单消耗' : '活动赠送',
    points: index % 2 === 0 ? -120 : 200,
    created_at: '2026-05-23 12:00:00',
  }))
  const { list, pagination } = paginate(records, page, pageSize)

  success(res, { recordList: list, pagination })
})

app.get('/user/balanceChangeList', async (req, res) => {
  const page = Number(req.query.page || 1)
  const pageSize = Number(req.query.pageSize || 10)
  const records = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: index % 2 === 0 ? '余额支付' : '售卖收入',
    amount: index % 2 === 0 ? '-12.00' : '+28.00',
    created_at: '2026-05-23 12:00:00',
  }))
  const { list, pagination } = paginate(records, page, pageSize)

  success(res, { recordList: list, pagination })
})

app.get('/index/index', async (_req, res) => {
  try {
    if (useMockData()) {
      return success(res, mockHome)
    }

    const supabase = getSupabase()
    const [productsResult, bannersResult, categoriesResult] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }).limit(12),
      supabase.from('banners').select('*').order('sort', { ascending: true }),
      supabase.from('product_categories').select('id, cate_name, icon, sort').order('sort', { ascending: true }),
    ])

    if (productsResult.error) throw productsResult.error
    if (bannersResult.error) throw bannersResult.error
    if (categoriesResult.error) throw categoriesResult.error

    const products = (productsResult.data ?? []) as ProductRow[]
    const recommendProducts = products.filter(item => item.is_recommend === true || item.is_recommend === 1)
    const hotProducts = products.filter(item => item.is_hot === true || item.is_hot === 1)
    const fallbackProducts = products.length ? products : []
    const tuijianSource = recommendProducts.length ? recommendProducts : fallbackProducts.slice(0, 3)
    const hotSource = hotProducts.length ? hotProducts : fallbackProducts.slice(3, 6)

    success(res, {
      ProductList: products.map(mapProduct),
      topList: ((bannersResult.data ?? []) as BannerRow[]).map(mapBanner),
      cateList: ((categoriesResult.data ?? []) as ProductCategoryRow[]).map(mapProductCategory),
      tuijianList: tuijianSource.map(mapHomeBox),
      hotList: hotSource.map(mapHomeBox),
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/product/cateList', async (_req, res) => {
  try {
    if (useMockData()) {
      return success(res, mockCategories)
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('product_categories')
      .select('id, cate_name, icon')
      .order('id', { ascending: true })

    if (error) {
      throw error
    }

    success(res, (data ?? []).map(item => ({
      cateId: item.id,
      cateName: item.cate_name,
      icon: item.icon,
    })))
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/product/list', async (req, res) => {
  try {
    const page = Number(req.query.page || 1)
    const pageSize = Number(req.query.pageSize || 10)
    const sort = Number(req.query.sort || 0)
    const ascending = req.query.order === 'asc'

    if (useMockData()) {
      const from = (page - 1) * pageSize
      const to = from + pageSize
      let products = getMockProductRows()

      if (req.query.id) {
        products = products.filter(item => item.cate_id === Number(req.query.id))
      }

      if (req.query.showStore) {
        products = products.filter(item => item.show_store === Number(req.query.showStore))
      }

      if (sort === 1) {
        products.sort((a, b) => Number(a.premium ?? 0) - Number(b.premium ?? 0))
      }
      else if (sort === 2) {
        products.sort((a, b) => Number(a.exchange_price ?? 0) - Number(b.exchange_price ?? 0))
      }
      else {
        products.sort((a, b) => Number(b.id) - Number(a.id))
      }

      if (!ascending && sort !== 0) {
        products.reverse()
      }

      return success(res, {
        productList: products.slice(from, to).map(mapProduct),
        pagination: getPagination(products.length, page, pageSize),
      })
    }

    const supabase = getSupabase()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    if (req.query.id) {
      query = query.eq('cate_id', Number(req.query.id))
    }

    if (req.query.showStore) {
      query = query.eq('show_store', Number(req.query.showStore))
    }

    if (sort === 1) {
      query = query.order('premium', { ascending })
    }
    else if (sort === 2) {
      query = query.order('exchange_price', { ascending })
    }
    else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      throw error
    }

    success(res, {
      productList: ((data ?? []) as ProductRow[]).map(mapProduct),
      pagination: getPagination(count ?? 0, page, pageSize),
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/product/productInfo', async (req, res) => {
  try {
    if (useMockData()) {
      const product = getMockProductRows().find(item => item.id === Number(req.query.id)) ?? getMockProductRows()[0]

      return success(res, product ? mapProduct(product) : null)
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', Number(req.query.id))
      .maybeSingle()

    if (error) {
      throw error
    }

    success(res, data ? mapProduct(data as ProductRow) : null)
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/product/createOrder', async (req, res) => {
  try {
    if (useMockData()) {
      return success(res, {
        orderNo: createOrderNo('MOCK'),
        params: req.query,
      })
    }

    const orderNo = await createSupabaseOrder({
      productId: Number(req.query.id),
      orderType: 2,
      orderNoPrefix: 'SP',
      totalPrice: req.query.totalPrice,
      shippingFee: req.query.shippingFee,
      points: req.query.points,
      count: req.query.count,
      content: '商品下单',
    })

    success(res, { orderNo })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/product/exchangeProduct', async (req, res) => {
  try {
    if (useMockData()) {
      return success(res, {
        orderNo: createOrderNo('MOCKEX'),
        params: req.query,
      })
    }

    const orderNo = await createSupabaseOrder({
      productId: Number(req.query.id),
      orderType: 3,
      orderNoPrefix: 'EX',
      totalPrice: req.query.balance,
      shippingFee: req.query.shippingFee,
      points: req.query.points,
      count: req.query.count,
      content: '积分兑换商品',
    })

    success(res, { orderNo })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/orderList', async (req, res) => {
  try {
    const page = Number(req.query.page || 1)
    const pageSize = Number(req.query.pageSize || 10)

    if (useMockData()) {
      let orders = mockOrders

      if (req.query.status !== undefined) {
        orders = orders.filter(item => item.status === Number(req.query.status))
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize

      return success(res, {
        orderList: orders.slice(from, to).map(mapOrder),
        pagination: getPagination(orders.length, page, pageSize),
      })
    }

    const supabase = getSupabase()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (req.query.status !== undefined) {
      query = query.eq('status', Number(req.query.status))
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      throw error
    }

    success(res, {
      orderList: ((data ?? []) as OrderRow[]).map(mapOrder),
      pagination: getPagination(count ?? 0, page, pageSize),
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/orderDetail', async (req, res) => {
  try {
    if (useMockData()) {
      return success(res, mapOrder(getMockOrder(req.query.orderNo)))
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_no', String(req.query.orderNo))
      .maybeSingle()

    if (error) {
      throw error
    }

    success(res, data ? mapOrder(data as OrderRow) : null)
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/confirmReceipt', async (req, res) => {
  try {
    const orderNo = String(req.query.orderNo)

    if (!useMockData()) {
      const { error } = await getSupabase()
        .from('orders')
        .update({ status: 3 })
        .eq('order_no', orderNo)

      if (error) {
        throw error
      }
    }

    success(res, { orderNo })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/pay', async (req, res) => {
  try {
    const orderNo = String(req.query.orderNo)

    if (!useMockData()) {
      const { error } = await getSupabase()
        .from('orders')
        .update({ status: 1 })
        .eq('order_no', orderNo)

      if (error) {
        throw error
      }
    }

    success(res, { orderNo, paid: true })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/wechatMiniAppPay', async (req, res) => {
  try {
    const orderNo = String(req.query.orderNo)

    if (!useMockData()) {
      const { error } = await getSupabase()
        .from('orders')
        .update({ status: 1 })
        .eq('order_no', orderNo)

      if (error) {
        throw error
      }
    }

    success(res, { orderNo, paid: true })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/collectProducts', async (req, res) => {
  try {
    if (useMockData()) {
      return success(res, {
        orderNo: createOrderNo('MOCKCOL'),
        params: req.query,
      })
    }

    const firstProductId = String(req.query.id || '')
      .split(',')
      .map(item => Number(item))
      .find(Boolean)

    const orderNo = await createSupabaseOrder({
      productId: firstProductId,
      orderType: 4,
      orderNoPrefix: 'CO',
      totalPrice: req.query.balance,
      shippingFee: req.query.shippingFee,
      count: 1,
      content: '盒柜商品提货',
    })

    success(res, { orderNo })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/message/list', async (req, res) => {
  const page = Number(req.query.page || 1)
  const pageSize = Number(req.query.pageSize || 10)
  const { list, pagination } = paginate(mockMessages, page, pageSize)

  success(res, {
    messageList: list,
    list,
    pagination,
  })
})

app.get('/message/detail', async (req, res) => {
  const message = mockMessages.find(item => item.id === Number(req.query.id)) ?? mockMessages[0]

  success(res, message)
})

app.get('/index/publicDetail', async (req, res) => {
  try {
    if (!useMockData()) {
      const { data, error } = await getSupabase()
        .from('banners')
        .select('id, detail_img')
        .eq('id', Number(req.query.id))
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        return success(res, {
          id: data.id,
          title: '公告详情',
          detailImg: data.detail_img,
          content: '',
        })
      }
    }

    const banner = mockHome.topList.find(item => item.id === Number(req.query.id)) ?? mockHome.topList[0]

    success(res, {
      id: Number(req.query.id || banner.id),
      title: '公告详情',
      detailImg: banner.detailImg,
      content: '本地 mock 公告内容',
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: `endpoint not found: ${req.method} ${req.path}`,
    data: null,
  })
})

app.listen(port, () => {
  console.log(`Spark Mall server is running at http://localhost:${port}`)
})
