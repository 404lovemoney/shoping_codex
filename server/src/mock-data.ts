import type { OrderRow, ProductRow } from './types.js'

const image = (seed: string, width = 600, height = 600) =>
  `https://picsum.photos/seed/spark-mall-${seed}/${width}/${height}`

export const mockUser = {
  id: '10001',
  open_id: 'mock-open-id',
  username: '火花用户',
  phone: '13800000000',
  balance: 268.8,
  points: 3600,
  sex: '未知',
  avatar: 'https://img.niantu.cn/spark-mall/static/images/default-avatar.png',
  isAgent: 1,
  token: 'mock-token-001',
}

export const mockCategories = [
  { cateId: 1, cateName: '潮玩手办', icon: image('cate-toy', 160, 160) },
  { cateId: 2, cateName: '数码周边', icon: image('cate-digital', 160, 160) },
  { cateId: 3, cateName: '生活好物', icon: image('cate-life', 160, 160) },
  { cateId: 4, cateName: '积分专区', icon: image('cate-points', 160, 160) },
  { cateId: 5, cateName: '新品推荐', icon: image('cate-new', 160, 160) },
  { cateId: 6, cateName: '热销精选', icon: image('cate-hot', 160, 160) },
]

export const mockProducts = Array.from({ length: 24 }, (_, index) => {
  const id = index + 1
  const cateId = (index % mockCategories.length) + 1
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
    storePageIcon: image(`product-${id}`, 600, 600),
    productDetailAdImage: image(`product-ad-${id}`, 750, 360),
    productDetailImages: [
      image(`product-detail-${id}-1`, 750, 900),
      image(`product-detail-${id}-2`, 750, 900),
    ],
  }
})

export const mockBoxes = [
  {
    id: 1,
    boxId: 1,
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
    detailImg: image('box-detail-new', 750, 900),
  },
  {
    id: 2,
    boxId: 2,
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
    detailImg: image('box-detail-hot', 750, 900),
  },
]

export const mockHome = {
  ProductList: mockProducts.slice(0, 6),
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
  cateList: mockCategories,
  tuijianList: [mockBoxes[0]],
  hotList: [mockBoxes[1]],
}

const mockAddress = {
  id: 1,
  userId: 10001,
  contactName: '火花用户',
  contactPhone: '13800138000',
  province: '浙江省',
  city: '杭州市',
  district: '西湖区',
  detailAddress: '文三路 100 号 mock 地址',
  isDefault: 1,
}

export const mockOrders: OrderRow[] = [
  {
    id: 1,
    order_no: 'MOCK202605230001',
    order_type: 2,
    status: 0,
    total_price: '108.00',
    shipping_fee: '8.00',
    total_points: '0',
    exchange_total_points: '0',
    created_at: '2026-05-23 17:00:00',
    expire_time: '2026-05-23 23:59:59',
    product_count: 2,
    product_list: [mockProducts[0], mockProducts[1]],
    exchange_list: [],
    address: mockAddress,
    content: '本地 mock 订单',
    detail_img: image('order-detail', 750, 420),
  },
  {
    id: 2,
    order_no: 'MOCK202605230002',
    order_type: 3,
    status: 2,
    total_price: '8.00',
    shipping_fee: '8.00',
    total_points: '960',
    exchange_total_points: '420',
    created_at: '2026-05-22 10:30:00',
    expire_time: '2026-05-22 23:59:59',
    product_count: 1,
    product_list: [mockProducts[2]],
    exchange_list: [mockProducts[3]],
    address: mockAddress,
    content: '积分兑换 mock 订单',
    detail_img: image('order-detail-2', 750, 420),
  },
]

export function getMockProductRows(): ProductRow[] {
  return mockProducts.map(item => ({
    id: item.id,
    cate_id: item.cateId,
    product_name: item.productName,
    product_grade: item.productGrade,
    premium: item.premium,
    exchange_price: item.exchangePrice,
    dismantle_price: item.dismantlePrice,
    shipping_fee: item.shippingFee,
    store_page_icon: item.storePageIcon,
    product_detail_ad_image: item.productDetailAdImage,
    product_detail_images: item.productDetailImages,
    created_at: '2026-05-23 12:00:00',
  }))
}
