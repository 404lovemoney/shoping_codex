import express from 'express'
import cors from 'cors'
import { getSupabase, hasSupabaseConfig } from './supabase.js'
import { failure, success } from './response.js'
import { mapBanner, mapHomeBox, mapOrder, mapProduct, mapProductCategory } from './mappers.js'
import { getMockProductRows, mockCategories, mockHome, mockOrders, mockUser } from './mock-data.js'
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
