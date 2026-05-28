<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "订单详情"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'OrderDetail',
})

import { fetchOrderDetail, getOrderReceipt } from '@/api/order';
import { commonOrderPay, wxOrderPay } from '@/api/payment';
import { diffInMilliseconds } from '@/utils/util'
import { computed } from 'vue'

onLoad(async (options) => {
  console.log("onLoad");
  // 获取路由参数
  console.log('options data', options.orderNo);

  if (options.orderNo) {
    orderNo.value = options.orderNo
    // orderType.value = options.orderType
    await fetchOrderDetailHandle()
  } else {
    uni.showToast({
      title: '订单不存在',
      icon: 'error'
    })
    // uni.navigateBack()
  }
})

onMounted(async () => {
  console.log("onMounted");
})

onShow(() => {
  console.log("onShow");
})

// 定义orderType 
const orderTypeList = {
  '1': '商品提货',
  '2': '商品购买',
  '3': '商品兑换'
}

const orderStatusList = {
  0: '等待付款',
  1: '待发货',
  2: '待收货',
  3: '已完成',
  4: '已取消',
}

// 订单号
const orderNo = ref('')

// 订单详情
const orderInfo = ref({
  status: -1,  // 订单状态 0 未支付 1待发货 2 已发货 3 已完成  4 已取消
  orderNo: '', // 订单号
  orderType: -1, // 订单类型 1 商品提货 2 商品购买 3 商品兑换
  totalPrice: '',
  shippingFee: '',
  created_at: '',
  expireTime: '',
  cashPrice: '',
  totalPoints: '', // 兑换商品的总积分
  exchangeTotalPoints: '', // 抵扣商品总积分
  productList: [],
  exchangeList: [], // 进阶兑换的商品列表
  address: {
    contactName: '',
    contactPhone: '',
    detailAddress: '',
    province: '',
    city: '',
    district: ''
  },
  content: '',
  detailImg: '',
})

const defaultAddress = {
  contactName: '',
  contactPhone: '',
  detailAddress: '',
  province: '',
  city: '',
  district: ''
}

const normalizeOrderInfo = (value: any) => {
  return {
    ...orderInfo.value,
    ...(value || {}),
    productList: Array.isArray(value?.productList) ? value.productList : [],
    exchangeList: Array.isArray(value?.exchangeList) ? value.exchangeList : [],
    address: {
      ...defaultAddress,
      ...(value?.address || {}),
    },
  }
}

const safeText = (value: unknown, fallback = '-') => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  return String(value)
}

const formatMoney = (value: unknown) => safeText(value, '0.00')

const productList = computed(() => Array.isArray(orderInfo.value.productList) ? orderInfo.value.productList : [])
const exchangeList = computed(() => Array.isArray(orderInfo.value.exchangeList) ? orderInfo.value.exchangeList : [])
const addressInfo = computed(() => ({ ...defaultAddress, ...(orderInfo.value.address || {}) }))
const orderStatusText = computed(() => orderStatusList[orderInfo.value.status] || '订单状态未知')
const orderTypeText = computed(() => orderTypeList[orderInfo.value.orderType] || '未知类型')
const addressLine = computed(() => {
  return [addressInfo.value.province, addressInfo.value.city, addressInfo.value.district, addressInfo.value.detailAddress]
    .filter(Boolean)
    .join('')
})

const format = ref<string>('mm分ss秒')
const time = ref<number>(0)

// 加载订单详情
const fetchOrderDetailHandle = async () => {
  try {
    // 调用API
    const response = await fetchOrderDetail({
      orderNo: orderNo.value
    })

    orderInfo.value = normalizeOrderInfo(response)

    // 倒计时
    if (orderInfo.value.status === 0) {
      time.value = diffInMilliseconds(orderInfo.value.expireTime)
      // time.value = 60 * 1000
    }

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 返回
const goBackHandle = () => {
  uni.navigateBack()
}

// 确认收货
const getOrderReceiptHandle = async () => {
  // 二次确认弹窗
  uni.showModal({
    content: '为保障您的权益，请收到货并确认无误后，再确认收货',
    confirmColor: '#27BA9B',
    success: async (success) => {
      if (success.confirm) {
        try {
          // 调用API
          const response = await getOrderReceipt({
            orderNo: orderNo.value
          })

          // 更新订单状态
          orderInfo.value.status = 3  

        } catch (error: any) {
          uni.showToast({
            title: error.message || '出错了，请重试',
            icon: 'none',
            duration: 2000
          })
        } finally {
        }
      }
    },
  })
}

// 倒计时结束事件
const onTimeup = () => {
  // 修改订单状态为已取消
  orderInfo.value!.status = 4
}

// 支付
const payHandle = () => {
  // #ifdef MP-WEIXIN
  console.log("运行在微信小程序中");
    wxPayHandle(orderNo.value)
  // #endif
  
  // #ifndef MP-WEIXIN
    // 调用支付
    commonPayHandle(orderNo.value)
  // #endif
}

// 微信小程序支付
const wxPayHandle = async (orderNo) => {
  console.log('wxPayHandle--------')
  try {
    // 调用API
    const res = await wxOrderPay({
      orderNo: orderNo,
      openId: uni.getStorageSync('openId') || ''
    })

    console.log('wxPayHandle res', res)

    // 有现金支付才会返回微信支付相关参数
    // 有参数调起微信支付
    // 没有参数继续后续流程
    if (res.package && res.paySign && res.signType) {
      // 调起微信支付
      wx.requestPayment
        (
          {
            "timeStamp": res.timeStamp,
            "nonceStr": res.nonceStr,
            "package": res.package,
            "signType": res.signType,
            "paySign": res.paySign,
            "success": function(res){
              console.log('wxRequestPayment success ------', res)
              paySuccess(orderNo)
            },
            "fail":function(res){
              console.log('fail', res)
              uni.showToast({
                title: '出错了，请重试',
                icon: 'none',
                duration: 2000
              })
            },
            "complete":function(res){
              console.log('complete', res)
            }
          }
        )
    } else {
      paySuccess(orderNo)
    }

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 调用普通支付
const commonPayHandle = async (orderNo) => {
  try {
    // 调用API
    const response = await commonOrderPay({
      orderNo: orderNo
    })

    paySuccess(orderNo)

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 支付成功后调用
const paySuccess = (orderNo) => {
  uni.showToast({
    title: '支付成功',
    icon: 'success'
  })

  // 修改订单状态为待发货
  orderInfo.value.status = 1
}


</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'订单详情'"
      page-name="orderDetail"
      :show-icon="true"
    >
    </custom-nav-bar>
    <view class="mt-6rpx order-status">
        <!-- {{ orderInfo.status }} -->
        <!-- 订单状态 0 未支付 1待发货 2 已发货 3 已完成  4 已取消 -->
         
        <view v-if="orderInfo.status === 0" class="status-bar flex justify-between items-center h-72rpx bg-#fff pl-30rpx pr-30rpx">
          <view class="flex items-center">
            <wd-icon name="money-circle" size="42rpx" color="#009E07"></wd-icon>
            <text class="ml-10rpx color-#009E07">{{ orderStatusText }}</text>
          </view>
          <view class="flex">
            <text class="color-#FF5733">关闭倒计时：</text>
            <wd-count-down :time="time" :format="format" @finish="onTimeup" />
          </view>
        </view>

        <view v-if="orderInfo.status === 1" class="status-bar flex justify-between items-center h-72rpx bg-#fff pl-30rpx pr-30rpx">
          <view class="flex items-center">
            <wd-icon name="money-circle" size="42rpx" color="#009E07"></wd-icon>
            <text class="ml-10rpx color-#009E07">订单确认，正在配货中</text>
          </view>
          <view class="flex">
            <wd-icon name="arrow-right" size="36rpx" color="#9C9C9C"></wd-icon>
          </view>
        </view>   

        <view v-if="orderInfo.status === 2" class="status-bar flex justify-between items-center h-72rpx bg-#fff pl-30rpx pr-30rpx">
          <view class="flex items-center">
            <wd-icon name="money-circle" size="42rpx" color="#009E07"></wd-icon>
            <text class="ml-10rpx color-#009E07">运输中，等待收货</text>
          </view>
          <view class="flex">
            <wd-icon name="arrow-right" size="36rpx" color="#9C9C9C"></wd-icon>
          </view>
        </view>

        <view v-if="orderInfo.status === 3" class="status-bar flex justify-between items-center h-72rpx bg-#fff pl-30rpx pr-30rpx">
          <view class="flex items-center">
            <wd-icon name="money-circle" size="42rpx" color="#009E07"></wd-icon>
            <text class="ml-10rpx color-#009E07">{{ orderStatusText }}</text>
          </view>
          <view class="flex">
            <wd-icon name="arrow-right" size="36rpx" color="#9C9C9C"></wd-icon>
          </view>
        </view>

        <view v-if="orderInfo.status === 4" class="status-bar flex justify-between items-center h-72rpx bg-#fff pl-30rpx pr-30rpx">
          <view class="flex items-center">
            <wd-icon name="money-circle" size="42rpx" color="#009E07"></wd-icon>
            <text class="ml-10rpx color-#009E07">{{ orderStatusText }}</text>
          </view>
          <view class="flex">
          </view>
        </view>
    </view>

    <view class="mt-6rpx address-info flex items-center">
      <view class="icon mr-40rpx">
        <wd-icon name="location" size="38rpx" color="#FF5733"></wd-icon>
      </view>
      <view class="address font-size-28rpx">
        <view class="item">{{ safeText(addressInfo.contactName, '收货人未填写') }} {{ safeText(addressInfo.contactPhone, '手机号未填写') }}</view>
        <view class="item mt-20rpx">
          {{ safeText(addressLine, '收货地址未填写') }}
        </view>
      </view>
    </view>

    <view
      class="product-list"
    >
      <view class="goods flex" v-for="product in productList" :key="product.id || product.productName">
        <view class="thumbnail">
          <wd-img
            width="100%"
            height="100%"
            radius="10"
            :src="product.storePageIcon"
          />
        </view>
        <view class="flex-1 title pt-2 pb-2">{{ safeText(product.productName, '商品信息缺失') }}</view>
        <view class="text-right">
          <view class="mt-2 font-size-24rpx" v-if="orderInfo.orderType === 1 || orderInfo.orderType === 2"><text class="symbol">¥</text>{{ formatMoney(product.premium) }}</view>
          <view class="mt-2 font-size-24rpx" v-if="orderInfo.orderType === 3">
            <view class="flex items-center">
                <view class="points-icon mr-1"></view>
                <view class="point spec-for-point">
                  {{ safeText(product.exchangePrice, '0') + '积分' }}
                </view>
            </view>
          </view>
          <view class="mt-24rpx count color-#A1A1A1">{{ 'x' + safeText(product.count, '1') }}</view>
        </view>
      </view>
      <view v-if="!productList.length" class="empty-product">暂无商品信息</view>

      <view class="flex justify-between color-black">
        <view class="label">
          <text>商品总价</text>
        </view>
        <view class="amount color-#FF5733" v-if="orderInfo.orderType === 1 || orderInfo.orderType === 2">
          <text class="symbol">¥</text>
          <text class="font-size-36rpx fw-bold">{{ formatMoney(orderInfo.totalPrice) }}</text>
        </view>
        <!-- 兑换商品 运费 + 总积分 -->
        <view class="amount flex items-center" v-if="orderInfo.orderType === 3">
          <view class="points-icon mr-1"></view>
          <view class="point fw-bold color-#FF5733">
            {{ safeText(orderInfo.totalPoints, '0') + '积分' }}
          </view>
        </view>
      </view> 
    </view>
    
    <view class="order-intro">
      <view class="item flex justify-between">
        <text class="label">订单编号：</text>
        <text class="data">{{ safeText(orderInfo.orderNo) }}</text>
      </view>
      <view class="item flex justify-between">
        <text class="label">订单时间：</text>
        <text class="data">{{ safeText(orderInfo.created_at) }}</text>
      </view>
      <view class="item flex justify-between">
        <text class="label">订单类型：</text>
        <text class="data">{{ orderTypeText }}</text>
      </view>
      <view class="item flex justify-between">
        <text class="label">运费：</text>
        <text class="data">¥{{ formatMoney(orderInfo.shippingFee) }}</text>
      </view>

      <view class="mt-20rpx flex justify-between color-black">
        <view class="label">
          <text class="font-size-32rpx">实付</text>
        </view>

        <!-- 商品提货 实付 = 运费 -->
        <view class="amount color-#FF5733" v-if="orderInfo.orderType === 1">
          <text class="symbol mr-1">¥</text>
          <text class="font-size-36rpx fw-bold">{{ formatMoney(orderInfo.shippingFee) }}</text>
        </view>

        <!-- 商品购买 实付 = 运费 + 现金金额 -->
        <view class="amount color-#FF5733" v-if="orderInfo.orderType === 2">
          <text class="symbol mr-1">¥</text>
          <text class="font-size-36rpx fw-bold">{{ formatMoney(orderInfo.totalPrice) }}</text>
        </view>

        <!-- 兑换商品 实付 = 运费 + 总积分 -->
        <view class="amount flex items-center" v-if="orderInfo.orderType === 3">
          <text class="symbol font-size-24rpx mr-1">¥</text>
          <text class="font-size-24rpx">{{ formatMoney(orderInfo.totalPrice) }}</text>
          <text class="ml-2 mr-2">+</text>
          <view class="flex items-center">
            <view class="points-icon mr-1"></view>
            <view class="point fw-bold color-#FF5733">
              {{ safeText(orderInfo.totalPoints, '0') + '积分' }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品兑换 -->
    <template v-if="orderInfo.orderType === 3">
      <view class="exchange-intro">
        <view class="item flex items-center justify-between">
          <text class="label">升级兑换总价：</text>
          <view class="flex items-center">
            <view class="points-icon mr-1"></view>
            <view class=" color-#000000">
            {{ safeText(orderInfo.exchangeTotalPoints, '0') }}
            </view>
          </view>
        </view>
        <view class="item flex justify-between">
          <text class="label">升级状态：</text>
          <text class="data">已完成</text>
        </view>
        <view class="mt-20rpx">
          <scroll-view class="scroll-container" scroll-x>
            <view class="lists" v-if="exchangeList.length">
              <view class="goods-item flex items-center" v-for="item in exchangeList" :key="item.id || item.productName">
                  <view class="thumbnail">
                    <wd-img
                      width="100%"
                      height="100%"
                      :src="item.storePageIcon"
                    />
                  </view>
                  <view class="title">{{ safeText(item.productName, '商品') }}</view>
                  <view class="mt-2 flex items-center">
                    <view class="points-icon mr-1"></view>
                    <view class="font-size-20rpx color-#000000">
                      {{ safeText(item.dismantlePrice, '0') }}
                    </view>
                  </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </template>

    <footer-tool-bar>
      <!-- 订单状态 0 未支付 1待发货 2 已发货 3 已完成  4 已取消 -->
      <view class="operation-bar" v-if="orderInfo.status === 0">
        <view class="flex-1 flex justify-end">
          <view class="btn" @click="payHandle">去支付</view>
        </view>
      </view>
      <view class="operation-bar" v-if="orderInfo.status === 1">
        <view class="flex-1 flex justify-end">
          <view class="btn">联系客服</view>
        </view>
      </view>
      <view class="operation-bar" v-if="orderInfo.status === 2">
        <view class="flex-1 flex justify-end" @click="getOrderReceiptHandle">
          <view class="btn">确认收货</view>
        </view>
      </view>
      <view class="operation-bar" v-if="orderInfo.status === 3">
        <view class="flex-1 flex justify-center">
          订单完成
        </view>
      </view>
    </footer-tool-bar>
  </view>
</template>

<style lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  // 计算页面视口最大高度
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  position: relative;
  background: #E6E6E6;
}
.operation-bar{
  display: flex;
  align-items: center;
  height: 100rpx;
  background: #fff;
  padding: 0 30rpx;
  .btn{
    width: 246rpx;
    height: 66rpx;
    line-height: 66rpx;
    text-align: center;
    background: #08CCBF;
    color: #fff;
    font-size: 34rpx;
    border-radius: 10rpx;
  }
}
.address-info{
  padding: 15rpx 30rpx;
  height: 150rpx;
  background: #fff;
}

.product-list{
  margin-top: 6px;
  padding: 30rpx;
  background: #fff;
}

.empty-product {
  padding: 40rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

.goods {
  display: flex;
  margin-bottom: 20rpx;

  .thumbnail{
    width: 144rpx;
    height: 144rpx;
  }
  .title {
    margin-left: 20rpx;
    line-height: 32rpx;
    font-size: 24rpx;
    color: #262626;
  }
}

.order-intro{
  margin-top: 6px;
  padding: 30rpx;
  background: #fff;
  .item{
    font-size: 22rpx;
    line-height: 36rpx;
    margin-bottom: 10rpx;
  }
}

.exchange-intro{
  margin-top: 6px;
  padding: 30rpx;
  background: #fff;
  .item{
    font-size: 22rpx;
    line-height: 36rpx;
    margin-bottom: 10rpx;
  }
}

.points-icon{
  width: 24rpx;
  height: 24rpx;
  background: url(https://img.niantu.cn/spark-mall/static/points-icon.png) no-repeat 0 0;
  background-size: 100% 100%;
}

.lists{
  padding: 0rpx 0rpx 20rpx;
  display: flex;
  .goods-item{
    display: flex;
    flex-direction: column;
    position: relative;
    margin: 0rpx 18rpx 0;
    width: 150rpx;
    height: 232rpx;
    .thumbnail{
      width: 150rpx;
      height: 150rpx;
    }
    .title{
      width: 100%;
      height: 36rpx;
      line-height: 36rpx;
      text-align: center;
      font-size: 16rpx;
      color: #fff;
      background-color: #FC8B1C;
      border-bottom-left-radius: 14rpx;
      border-bottom-right-radius: 14rpx;
    }
  }
}


</style>
