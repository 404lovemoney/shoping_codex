import type { BannerRow, ConsignmentRow, OrderRow, ProductBoxRow, ProductCategoryRow, ProductRow, UserBoxProductRow } from './types.js'

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

export function getProductGradeId(grade?: string | null) {
  const gradeMap: Record<string, number> = {
    N: 2,
    R: 3,
    SR: 4,
    SSR: 5,
    标准: 2,
    高档: 3,
    轻奢: 4,
    豪华: 5,
  }

  return gradeMap[String(grade || '').toUpperCase()] ?? 2
}

export function mapBox(row: ProductBoxRow) {
  const price = String(row.price ?? row.discount_price ?? 0)

  return {
    id: row.id,
    boxId: row.box_id ?? row.id,
    name: row.name,
    desc: row.description ?? '',
    icon: row.img_src,
    imgSrc: row.img_src,
    bgType: row.bg_type ?? 1,
    iconType: row.icon_type ?? 1,
    firstPrice: String(row.first_price ?? price),
    discountPrice: String(row.discount_price ?? price),
    sellingPrice: Number(row.price ?? row.discount_price ?? 0),
    price,
    prizePriceLimit: row.prize_price_limit ?? '',
    type: row.type ?? 1,
    detailImg: row.detail_img,
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

export function mapBoxProduct(row: ProductRow, resultId?: number | string) {
  const product = mapProduct(row)
  const productGradeId = getProductGradeId(product.productGrade)

  return {
    ...product,
    resultId: resultId ?? product.id,
    name: product.productName,
    icon: product.storePageIcon,
    productGradeId,
    productRating: productGradeId,
  }
}

export function mapUserBoxProduct(row: UserBoxProductRow) {
  const product = row.products ?? row.product
  const snapshot = (row.product_snapshot ?? {}) as Record<string, any>
  const mapped = product ? mapBoxProduct(product, row.id) : {
    id: snapshot.id ?? row.product_id ?? row.id,
    cateId: snapshot.cateId,
    productName: snapshot.productName ?? snapshot.name ?? '盒柜商品',
    productGrade: snapshot.productGrade ?? 'N',
    premium: String(snapshot.premium ?? row.price ?? 0),
    exchangePrice: String(snapshot.exchangePrice ?? 0),
    dismantlePrice: String(snapshot.dismantlePrice ?? 0),
    shippingFee: String(snapshot.shippingFee ?? 0),
    storePageIcon: snapshot.storePageIcon ?? snapshot.icon ?? '',
    productDetailAdImage: snapshot.productDetailAdImage,
    productDetailImages: snapshot.productDetailImages ?? [],
    resultId: row.id,
    name: snapshot.productName ?? snapshot.name ?? '盒柜商品',
    icon: snapshot.storePageIcon ?? snapshot.icon ?? '',
    productGradeId: getProductGradeId(snapshot.productGrade),
    productRating: getProductGradeId(snapshot.productGrade),
  }

  return {
    ...mapped,
    id: row.id,
    productId: mapped.id,
    resultId: row.id,
    status: row.status ?? 0,
    consignPrice: String(row.sell_price ?? snapshot.consignPrice ?? row.price ?? 0),
    created_at: row.created_at,
  }
}

export function mapConsignment(row: ConsignmentRow) {
  const boxProduct = row.user_box_product
  const product = boxProduct ? mapUserBoxProduct(boxProduct) : mapUserBoxProduct({
    id: row.user_box_product_id ?? row.id,
    product_snapshot: row.product_snapshot,
    sell_price: row.sell_price,
    status: row.status,
    created_at: row.created_at,
  })

  return {
    ...product,
    id: row.id,
    resultId: row.user_box_product_id,
    productId: product.productId ?? product.id,
    userId: row.user_id ?? 10001,
    nickName: row.users?.username ?? '火花用户',
    status: row.status ?? 0,
    consignPrice: String(row.sell_price ?? product.consignPrice ?? 0),
    expireTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: row.created_at,
  }
}
