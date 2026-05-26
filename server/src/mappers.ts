import type { BannerRow, OrderRow, ProductCategoryRow, ProductRow } from './types.js'

export function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    cateId: row.cate_id,
    productName: row.product_name ?? row.name,
    productGrade: row.product_grade,
    premium: String(row.premium ?? '0'),
    exchangePrice: String(row.exchange_price ?? '0'),
    dismantlePrice: String(row.dismantle_price ?? '0'),
    shippingFee: String(row.shipping_fee ?? '0'),
    storePageIcon: row.store_page_icon ?? row.img_src,
    productDetailAdImage: row.product_detail_ad_image,
    productDetailImages: row.product_detail_images,
  }
}

export function mapProductCategory(row: ProductCategoryRow) {
  return {
    cateId: row.id,
    cateName: row.cate_name,
    icon: row.icon,
  }
}

export function mapOrder(row: OrderRow) {
  return {
    id: row.id,
    orderNo: row.order_no,
    orderType: row.order_type,
    status: row.status,
    totalPrice: String(row.total_price ?? '0'),
    shippingFee: String(row.shipping_fee ?? '0'),
    totalPoints: String(row.total_points ?? '0'),
    exchangeTotalPoints: String(row.exchange_total_points ?? '0'),
    productCount: row.product_count,
    productList: row.product_list ?? [],
    exchangeList: row.exchange_list ?? [],
    address: row.address ?? null,
    content: row.content,
    detailImg: row.detail_img,
    created_at: row.created_at,
    expireTime: row.expire_time,
  }
}

export function mapBanner(row: BannerRow) {
  return {
    id: row.id,
    type: row.type,
    boxId: row.box_id,
    imgSrc: row.img_src,
    detailImg: row.detail_img,
  }
}

export function mapHomeBox(row: ProductRow, index = 0) {
  return {
    id: row.id,
    boxId: row.id,
    name: row.name ?? row.product_name,
    desc: row.description ?? row.product_grade ?? '',
    imgSrc: row.img_src ?? row.store_page_icon ?? row.product_detail_ad_image,
    bgType: row.bg_type ?? (index === 0 ? 1 : 2),
    iconType: row.icon_type ?? ((index % 3) + 1),
    firstPrice: String(row.first_price ?? row.price ?? row.premium ?? '0'),
    discountPrice: String(row.discount_price ?? row.premium ?? row.price ?? '0'),
    price: String(row.price ?? row.premium ?? '0'),
    prizePriceLimit: row.prize_price_limit ?? String(row.exchange_price ?? row.premium ?? '0'),
    type: row.type ?? 1,
    detailImg: row.detail_img ?? row.product_detail_ad_image,
  }
}
