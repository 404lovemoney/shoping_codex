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
  name?: string | null
  description?: string | null
  product_grade?: string | null
  premium?: string | number | null
  exchange_price?: string | number | null
  dismantle_price?: string | number | null
  shipping_fee?: string | number | null
  store_page_icon?: string | null
  img_src?: string | null
  product_detail_ad_image?: string | null
  product_detail_images?: string[] | string | null
  bg_type?: number | null
  icon_type?: number | null
  first_price?: string | number | null
  discount_price?: string | number | null
  price?: string | number | null
  prize_price_limit?: string | null
  type?: number | null
  detail_img?: string | null
  show_store?: number | null
  is_recommend?: boolean | number | null
  is_hot?: boolean | number | null
  created_at?: string | null
}

export type ProductCategoryRow = {
  id: number
  cate_name?: string | null
  icon?: string | null
  sort?: number | null
}

export type OrderRow = {
  id: number
  order_no?: string | null
  box_id?: number | null
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
  price?: string | number | null
  first_price?: string | number | null
  discount_price?: string | number | null
  prize_price_limit?: string | null
  type?: number | null
  detail_img?: string | null
  sort?: number | null
  created_at?: string | null
}

export type ProductBoxItemRow = {
  id: number
  box_id?: number | null
  product_id?: number | null
  draw_weight?: number | null
  product?: ProductRow | null
  products?: ProductRow | null
}

export type UserBoxProductRow = {
  id: number
  user_id?: number | null
  product_id?: number | null
  source_order_no?: string | null
  status?: number | null
  price?: string | number | null
  sell_price?: string | number | null
  product_snapshot?: unknown
  created_at?: string | null
  updated_at?: string | null
  product?: ProductRow | null
  products?: ProductRow | null
}

export type ConsignmentRow = {
  id: number
  user_id?: number | null
  user_box_product_id?: number | null
  status?: number | null
  sell_price?: string | number | null
  product_snapshot?: unknown
  created_at?: string | null
  updated_at?: string | null
  user_box_product?: UserBoxProductRow | null
  users?: {
    id?: number | null
    username?: string | null
    avatar?: string | null
  } | null
}
