import express from 'express'
import cors from 'cors'
import { getSupabase } from './supabase.js'
import { failure, success } from './response.js'
import { mapBanner, mapOrder, mapProduct, mapProductBox } from './mappers.js'
import type { BannerRow, OrderRow, ProductBoxRow, ProductRow } from './types.js'

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const getPagination = (total: number, page: number, pageSize: number) => ({
  total,
  pageSize,
  currentPage: page,
  lastPage: Math.max(1, Math.ceil(total / pageSize)),
})

app.get('/health', (_req, res) => {
  success(res, { status: 'ok', port })
})

app.post('/user/login', async (req, res) => {
  try {
    const supabase = getSupabase()
    const { phone, password } = req.body

    let query = supabase
      .from('users')
      .select('id, phone, username, avatar, balance, points, sex, is_agent, open_id, token')
      .eq('phone', phone)

    if (password) {
      query = query.eq('password', password)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      throw error
    }

    const token = data?.token || `mock-token-${Date.now()}`

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
    const supabase = getSupabase()
    const userId = req.query.id
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    let query = supabase
      .from('users')
      .select('id, phone, username, avatar, balance, points, sex, is_agent, open_id, token')

    if (userId) {
      query = query.eq('id', userId)
    }
    else if (token) {
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
          token: data.token,
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
    const supabase = getSupabase()
    const [productsResult, bannersResult, boxesResult] = await Promise.all([
      supabase.from('products').select('*').limit(6),
      supabase.from('banners').select('*').order('sort', { ascending: true }),
      supabase.from('product_boxes').select('*').order('sort', { ascending: true }).limit(6),
    ])

    if (productsResult.error) throw productsResult.error
    if (bannersResult.error) throw bannersResult.error
    if (boxesResult.error) throw boxesResult.error

    const boxList = ((boxesResult.data ?? []) as ProductBoxRow[]).map(mapProductBox)

    success(res, {
      ProductList: ((productsResult.data ?? []) as ProductRow[]).map(mapProduct),
      topList: ((bannersResult.data ?? []) as BannerRow[]).map(mapBanner),
      tuijianList: boxList.slice(0, 3),
      hotList: boxList.slice(3, 6),
    })
  }
  catch (error) {
    console.error(error)
    failure(res)
  }
})

app.get('/product/cateList', async (_req, res) => {
  try {
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
    const supabase = getSupabase()
    const page = Number(req.query.page || 1)
    const pageSize = Number(req.query.pageSize || 10)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const sort = Number(req.query.sort || 0)
    const ascending = req.query.order === 'asc'

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
    const supabase = getSupabase()
    const page = Number(req.query.page || 1)
    const pageSize = Number(req.query.pageSize || 10)
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
