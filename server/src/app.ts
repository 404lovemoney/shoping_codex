import express from 'express'
import cors from 'cors'
import { getSupabase, hasSupabaseConfig } from './supabase.js'
import { failure, success } from './response.js'
import { mapBanner, mapBox, mapBoxProduct, mapConsignment, mapHomeBox, mapOrder, mapProduct, mapProductCategory, mapUserBoxProduct } from './mappers.js'
import { getMockProductRows, mockAddress, mockBoxes, mockCategories, mockConsignments, mockHome, mockMessages, mockOrders, mockUser, mockUserBoxProducts } from './mock-data.js'
import type { BannerRow, ConsignmentRow, OrderRow, ProductBoxRow, ProductCategoryRow, ProductRow, UserBoxProductRow } from './types.js'

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

const DEFAULT_USER_ID = 10001

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

async function getSupabaseBox(boxId: unknown) {
  const id = Number(boxId || 0)

  if (!id) {
    return null
  }

  const { data, error } = await getSupabase()
    .from('product_boxes')
    .select('*')
    .or(`id.eq.${id},box_id.eq.${id}`)
    .order('sort', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as ProductBoxRow | null
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

function getPageParams(query: Record<string, unknown>) {
  return {
    page: Math.max(1, Number(query.page || 1)),
    pageSize: Math.max(1, Number(query.pageSize || 10)),
  }
}

function parseIdList(value: unknown) {
  return String(value || '')
    .split(',')
    .map(item => Number(item.trim()))
    .filter(Boolean)
}

function getMockProductById(productId: unknown) {
  return getMockProductRows().find(item => item.id === Number(productId)) ?? getMockProductRows()[0]
}

function getMockBox(boxId: unknown) {
  const box = mockBoxes.find(item => item.id === Number(boxId) || item.boxId === Number(boxId)) ?? mockBoxes[0]
  const price = String(box.price)

  return {
    id: box.id,
    boxId: box.boxId,
    name: box.name,
    desc: box.desc,
    icon: box.imgSrc,
    imgSrc: box.imgSrc,
    bgType: box.bgType,
    iconType: box.iconType,
    firstPrice: box.firstPrice,
    discountPrice: box.discountPrice,
    sellingPrice: Number(box.price),
    price,
    prizePriceLimit: box.prizePriceLimit,
    type: box.type,
    detailImg: box.detailImg,
    guaranteeCount: 10,
    drawCount: 0,
    lotteryType: 2,
    drawCountInfo: [
      { count: 1, price },
      { count: 3, price: String(Number(price) * 3) },
      { count: 5, price: String(Number(price) * 5) },
      { count: 10, price: String(Number(price) * 10) },
    ],
    priorityList: [
      { productGradeId: 5, productGrade: 'SSR', probability: '5%' },
      { productGradeId: 4, productGrade: 'SR', probability: '15%' },
      { productGradeId: 3, productGrade: 'R', probability: '30%' },
      { productGradeId: 2, productGrade: 'N', probability: '50%' },
    ],
    ruleText: ['每次开盒随机获得一个商品', '抽到不满意的商品可提货、寄售或分解'],
  }
}

function getMockBoxProducts(boxId: unknown) {
  const offset = Number(boxId || 1) % 2
  return getMockProductRows()
    .slice(offset, offset + 6)
    .map(product => mapBoxProduct(product))
}

async function getSupabaseBoxProducts(boxRowId: number) {
  const supabase = getSupabase()
  const { data: items, error: itemError } = await supabase
    .from('product_box_items')
    .select('product_id')
    .eq('box_id', boxRowId)
    .order('sort', { ascending: true })

  if (itemError) {
    throw itemError
  }

  const productIds = (items ?? [])
    .map(item => Number(item.product_id))
    .filter(Boolean)

  if (!productIds.length) {
    return []
  }

  const { data: products, error: productError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)

  if (productError) {
    throw productError
  }

  const productMap = new Map(((products ?? []) as ProductRow[]).map(product => [product.id, product]))

  return productIds
    .map(productId => productMap.get(productId))
    .filter((product): product is ProductRow => Boolean(product))
    .map(product => mapBoxProduct(product))
}

function pickProducts(products: ReturnType<typeof mapBoxProduct>[], count: number) {
  const safeProducts = products.length ? products : getMockProductRows().slice(0, 1).map(product => mapBoxProduct(product))

  return Array.from({ length: Math.max(1, count) }, (_, index) => ({
    ...safeProducts[index % safeProducts.length],
    resultId: `${Date.now()}${index}`,
  }))
}

async function createUserBoxProducts(orderNo: string, products: ReturnType<typeof mapBoxProduct>[]) {
  if (useMockData()) {
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase
    .from('user_box_products')
    .insert(products.map(product => ({
      user_id: DEFAULT_USER_ID,
      product_id: product.id,
      source_order_no: orderNo,
      status: 1,
      price: Number(product.premium || 0),
      product_snapshot: product,
    })))

  if (error) {
    throw error
  }
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

app.get('/user/wechatPhoneLogin', async (req, res) => {
  success(res, {
    token: TEST_TOKEN,
    openId: String(req.query.openId || mockUser.open_id),
    phone: mockUser.phone,
    userInfo: {
      ...mockUser,
      token: TEST_TOKEN,
    },
  })
})

app.get('/user/loginByCode', async (req, res) => {
  success(res, {
    openId: `mock-open-id-${String(req.query.code || 'default').slice(-6)}`,
  })
})

app.get('/user/setNickName', async (req, res) => {
  success(res, {
    ...mockUser,
    username: String(req.query.nickName || req.query.username || mockUser.username),
  })
})

app.get('/user/dateStats', async (_req, res) => {
  success(res, {
    totalInvitCount: 8,
    inviteCount: 8,
    commissionAmount: '128.80',
    dataList: [
      { date: '2026-05-24', inviteCount: 2, commissionAmount: '28.00' },
      { date: '2026-05-25', inviteCount: 3, commissionAmount: '48.80' },
      { date: '2026-05-26', inviteCount: 3, commissionAmount: '52.00' },
    ],
  })
})

app.get('/user/myInviteList', async (req, res) => {
  const { page, pageSize } = getPageParams(req.query)
  const records = Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    username: `邀请用户${index + 1}`,
    phone: `1380000${String(index + 1).padStart(4, '0')}`,
    avatar: mockUser.avatar,
    created_at: '2026-05-26 12:00:00',
  }))
  const { list, pagination } = paginate(records, page, pageSize)

  success(res, { userList: list, pagination })
})

app.get('/user/commissionList', async (req, res) => {
  const { page, pageSize } = getPageParams(req.query)
  const records = Array.from({ length: 18 }, (_, index) => ({
    id: index + 1,
    title: index % 2 === 0 ? '邀请奖励' : '寄售佣金',
    amount: (8 + index * 1.2).toFixed(2),
    created_at: '2026-05-26 12:00:00',
  }))
  const { list, pagination } = paginate(records, page, pageSize)

  success(res, { recordList: list, pagination })
})

app.get('/withdrawal/getApplyList', async (req, res) => {
  const { page, pageSize } = getPageParams(req.query)
  const records = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    amount: (20 + index * 10).toFixed(2),
    status: index % 3,
    statusText: ['审核中', '已到账', '已拒绝'][index % 3],
    created_at: '2026-05-26 12:00:00',
  }))
  const { list, pagination } = paginate(records, page, pageSize)

  success(res, { recordList: list, pagination })
})

app.get('/withdrawal/submitApply', async (req, res) => {
  success(res, {
    id: Date.now(),
    amount: String(req.query.amount || req.query.money || '0'),
    status: 0,
    statusText: '审核中',
    created_at: new Date().toISOString(),
  })
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

app.get('/productBox/boxInfo', async (req, res) => {
  try {
    if (useMockData()) {
      return success(res, {
        boxInfo: getMockBox(req.query.id),
        productList: getMockBoxProducts(req.query.id),
      })
    }

    const box = await getSupabaseBox(req.query.id)

    if (!box) {
      return success(res, {
        boxInfo: null,
        productList: [],
      })
    }

    success(res, {
      boxInfo: mapBox(box),
      productList: await getSupabaseBoxProducts(Number(box.id)),
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/productBox/createOrder', async (req, res) => {
  try {
    const orderNo = createOrderNo('BX')
    const count = Number(req.query.count || 1)
    const totalPrice = Number(req.query.totalPrice || 0)

    if (!useMockData()) {
      const box = await getSupabaseBox(req.query.id)
      const { error } = await getSupabase()
        .from('orders')
        .insert({
          order_no: orderNo,
          user_id: DEFAULT_USER_ID,
          box_id: box?.id ?? null,
          order_type: 1,
          status: 0,
          total_price: totalPrice,
          total_points: Number(req.query.points || 0),
          exchange_total_points: Number(req.query.points || 0),
          product_count: count,
          product_list: [],
          exchange_list: [],
          address: mockAddress,
          content: '盲盒下单',
          detail_img: box?.detail_img ?? getMockBox(req.query.id).detailImg,
        })

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

app.get('/productBox/boxDraw', async (req, res) => {
  try {
    const orderNo = String(req.query.orderNo || '')
    let count = 1
    let boxId: unknown = req.query.boxId || req.query.blindBoxId || 1

    if (!useMockData()) {
      const { data: order, error } = await getSupabase()
        .from('orders')
        .select('*')
        .eq('order_no', orderNo.split(',')[0])
        .maybeSingle()

      if (error) {
        throw error
      }

      count = Number(order?.product_count || 1)
      boxId = order?.box_id || boxId
    }

    if (orderNo.includes(',')) {
      count = orderNo.split(',').filter(Boolean).length
    }

    const supabaseBox = useMockData() ? null : await getSupabaseBox(boxId)
    const sourceProducts = useMockData()
      ? getMockBoxProducts(boxId)
      : await getSupabaseBoxProducts(Number(supabaseBox?.id || boxId || 1))
    const productList = pickProducts(sourceProducts, count)

    await createUserBoxProducts(orderNo, productList)

    if (!useMockData() && orderNo) {
      const { error } = await getSupabase()
        .from('orders')
        .update({
          status: 3,
          product_list: productList,
        })
        .in('order_no', orderNo.split(',').filter(Boolean))

      if (error) {
        throw error
      }
    }

    success(res, { productList })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/productBox/testDraw', async (req, res) => {
  try {
    const sourceProducts = useMockData()
      ? getMockBoxProducts(req.query.boxId || req.query.id)
      : await getSupabaseBoxProducts(Number((await getSupabaseBox(req.query.boxId || req.query.id))?.id || req.query.boxId || req.query.id || 1))
    const [product] = pickProducts(sourceProducts, 1)

    success(res, { productList: product })
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

app.get('/order/unOpendBoxList', async (req, res) => {
  try {
    const { page, pageSize } = getPageParams(req.query)

    if (useMockData()) {
      const boxList = mockUserBoxProducts
        .filter(item => item.status === 0)
        .map(item => ({
          id: item.id,
          orderNo: item.source_order_no,
          name: '待开盲盒',
          icon: mockBoxes[0].imgSrc,
          created_at: item.created_at,
        }))
      const { list, pagination } = paginate(boxList, page, pageSize)

      return success(res, { boxList: list, unOpendBoxList: list, pagination })
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await getSupabase()
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('order_type', 1)
      .in('status', [0, 1])
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw error
    }

    const boxList = ((data ?? []) as OrderRow[]).map(order => ({
      id: order.id,
      orderNo: order.order_no,
      name: '待开盲盒',
      icon: mockBoxes[0].imgSrc,
      created_at: order.created_at,
    }))

    success(res, { boxList, unOpendBoxList: boxList, pagination: getPagination(count ?? 0, page, pageSize) })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/productList', async (req, res) => {
  try {
    const { page, pageSize } = getPageParams(req.query)

    if (useMockData()) {
      const productList = mockUserBoxProducts
        .filter(item => item.status === 1)
        .map(mapUserBoxProduct)
      const { list, pagination } = paginate(productList, page, pageSize)

      return success(res, { productList: list, pagination })
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await getSupabase()
      .from('user_box_products')
      .select('*', { count: 'exact' })
      .eq('status', 1)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw error
    }

    success(res, {
      productList: ((data ?? []) as UserBoxProductRow[]).map(mapUserBoxProduct),
      pagination: getPagination(count ?? 0, page, pageSize),
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/mySellList', async (req, res) => {
  try {
    const { page, pageSize } = getPageParams(req.query)
    const status = Number(req.query.status ?? 0)

    if (useMockData()) {
      let records = mockConsignments
      if (status !== 2) {
        records = records.filter(item => item.status === status)
      }
      const { list, pagination } = paginate(records.map(mapConsignment), page, pageSize)

      return success(res, { productList: list, pagination })
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    let query = getSupabase()
      .from('consignment_orders')
      .select('*', { count: 'exact' })
      .eq('user_id', DEFAULT_USER_ID)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status !== 2) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    success(res, {
      productList: ((data ?? []) as ConsignmentRow[]).map(mapConsignment),
      pagination: getPagination(count ?? 0, page, pageSize),
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/sellingProductList', async (req, res) => {
  try {
    const { page, pageSize } = getPageParams(req.query)

    if (useMockData()) {
      const { list, pagination } = paginate(mockConsignments.filter(item => item.status === 0).map(mapConsignment), page, pageSize)

      return success(res, { productList: list, pagination })
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await getSupabase()
      .from('consignment_orders')
      .select('*', { count: 'exact' })
      .eq('status', 0)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw error
    }

    success(res, {
      productList: ((data ?? []) as ConsignmentRow[]).map(mapConsignment),
      pagination: getPagination(count ?? 0, page, pageSize),
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/sellingProductInfo', async (req, res) => {
  try {
    const id = Number(req.query.id || 0)

    if (useMockData()) {
      const consignment = mockConsignments.find(item => item.id === id) ?? mockConsignments[0]

      return success(res, mapConsignment(consignment))
    }

    const { data, error } = await getSupabase()
      .from('consignment_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }

    success(res, data ? mapConsignment(data as ConsignmentRow) : null)
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/cancelSell', async (req, res) => {
  try {
    const ids = parseIdList(req.query.idList || req.query.id)

    if (!useMockData() && ids.length) {
      const { error } = await getSupabase()
        .from('consignment_orders')
        .update({ status: 2, updated_at: new Date().toISOString() })
        .in('id', ids)

      if (error) {
        throw error
      }
    }

    success(res, { idList: ids, status: 2 })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/productFastSell', async (req, res) => {
  try {
    const ids = parseIdList(req.query.resultIds)

    if (!useMockData() && ids.length) {
      const supabase = getSupabase()
      const { data: products, error: productError } = await supabase
        .from('user_box_products')
        .select('*')
        .in('id', ids)

      if (productError) {
        throw productError
      }

      const { error: insertError } = await supabase
        .from('consignment_orders')
        .insert(((products ?? []) as UserBoxProductRow[]).map(product => ({
          user_id: DEFAULT_USER_ID,
          user_box_product_id: product.id,
          status: 0,
          sell_price: Number(product.price || 0),
          product_snapshot: product.product_snapshot,
        })))

      if (insertError) {
        throw insertError
      }

      const { error: updateError } = await supabase
        .from('user_box_products')
        .update({ status: 2, updated_at: new Date().toISOString() })
        .in('id', ids)

      if (updateError) {
        throw updateError
      }
    }

    success(res, {
      idList: ids,
      totalPrice: Number(req.query.totalPrice || 0),
      status: 0,
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/productCommonSell', async (req, res) => {
  try {
    const priceList = String(req.query.priceList || '')
      .split(',')
      .map((item) => {
        const [id, price] = item.split(':')
        return { id: Number(id), price: Number(price || 0) }
      })
      .filter(item => item.id)

    if (!useMockData() && priceList.length) {
      const ids = priceList.map(item => item.id)
      const supabase = getSupabase()
      const { data: products, error: productError } = await supabase
        .from('user_box_products')
        .select('*')
        .in('id', ids)

      if (productError) {
        throw productError
      }

      const priceMap = new Map(priceList.map(item => [item.id, item.price]))
      const { error: insertError } = await supabase
        .from('consignment_orders')
        .insert(((products ?? []) as UserBoxProductRow[]).map(product => ({
          user_id: DEFAULT_USER_ID,
          user_box_product_id: product.id,
          status: 0,
          sell_price: priceMap.get(product.id) ?? product.sell_price ?? product.price ?? 0,
          product_snapshot: product.product_snapshot,
        })))

      if (insertError) {
        throw insertError
      }

      const { error: updateError } = await supabase
        .from('user_box_products')
        .update({ status: 2, updated_at: new Date().toISOString() })
        .in('id', ids)

      if (updateError) {
        throw updateError
      }
    }

    success(res, {
      priceList,
      totalPrice: Number(req.query.totalPrice || 0),
      status: 0,
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/order/dismantleProduct', async (req, res) => {
  try {
    const ids = parseIdList(req.query.id)

    if (!useMockData() && ids.length) {
      const { error } = await getSupabase()
        .from('user_box_products')
        .update({ status: 5, updated_at: new Date().toISOString() })
        .in('id', ids)

      if (error) {
        throw error
      }
    }

    success(res, {
      idList: ids,
      points: ids.length * 100,
      status: 5,
    })
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

app.get('/shop/companyList', async (_req, res) => {
  success(res, {
    companyList: [
      {
        id: 1,
        companyName: '火花自营',
        name: '火花自营',
        logo: 'https://img.niantu.cn/spark-mall/static/images/default-avatar.png',
        contactName: '运营人员',
        contactPhone: '13800000000',
      },
    ],
  })
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
