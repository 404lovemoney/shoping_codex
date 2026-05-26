import type { BannerRow, OrderRow, ProductBoxRow, ProductRow } from './types.js'

export function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    cateId: row.cate_id,
    productName: row.product_name,
    productGrade: row.product_grade,
    premium: String(row.premium ?? '0'),
    exchangePrice: String(row.exchange_price ?? '0'),
    dismantlePrice: String(row.dismantle_price ?? '0'),
    shippingFee: String(row.shipping_fee ?? '0'),
    storePageIcon: row.store_page_icon,
    productDetailAdImage: row.product_detail_ad_image,
    productDetailImages: row.product_detail_images,
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

export function mapProductBox(row: ProductBoxRow) {
  return {
    id: row.id,
    boxId: row.box_id ?? row.id,
    name: row.name,
    desc: row.description,
    imgSrc: row.img_src,
    bgType: row.bg_type,
    iconType: row.icon_type,
    firstPrice: String(row.first_price ?? '0'),
    discountPrice: String(row.discount_price ?? '0'),
    price: String(row.price ?? '0'),
    prizePriceLimit: row.prize_price_limit,
    type: row.type,
    detailImg: row.detail_img,
  }
}
