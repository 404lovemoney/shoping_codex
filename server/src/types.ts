export type Pagination = {
  total: number
  pageSize: number
  currentPage: number
  lastPage: number
}

export type ProductRow = {
  id: number
  cate_id?: number | null
  product_name?: string | null
  product_grade?: string | null
  premium?: string | number | null
  exchange_price?: string | number | null
  dismantle_price?: string | number | null
  shipping_fee?: string | number | null
  store_page_icon?: string | null
  product_detail_ad_image?: string | null
  product_detail_images?: string[] | string | null
  show_store?: number | null
  created_at?: string | null
}

export type OrderRow = {
  id: number
  order_no?: string | null
  order_type?: number | null
  status?: number | null
  total_price?: string | number | null
  shipping_fee?: string | number | null
  total_points?: string | number | null
  exchange_total_points?: string | number | null
  product_count?: number | null
  product_list?: unknown
  exchange_list?: unknown
  address?: unknown
  content?: string | null
  detail_img?: string | null
  created_at?: string | null
  expire_time?: string | null
}

export type BannerRow = {
  id: number
  type?: number | null
  box_id?: number | null
  img_src?: string | null
  detail_img?: string | null
}

export type ProductBoxRow = {
  id: number
  box_id?: number | null
  name?: string | null
  description?: string | null
  img_src?: string | null
  bg_type?: number | null
  icon_type?: number | null
  first_price?: string | number | null
  discount_price?: string | number | null
  price?: string | number | null
  prize_price_limit?: string | null
  type?: number | null
  detail_img?: string | null
}
