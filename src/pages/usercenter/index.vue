<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page -->
<route lang="jsonc" type="page">
  {
    "layout": "tabbar",
    "style": {
      // 'custom' 表示开启自定义导航栏，默认 'default'
      "navigationStyle": "custom",
      "navigationBarTitleText": "我的"
    }
  }
</route>

<script lang="ts" setup>
// import { saveUserInfoState, isLoggedIn, getUserProfile } from '@/api/auth'
import orderGroup from './components/order-group/index.vue'

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

// const UserInfo = ref<UserInfo>
const defaultAvatarUrl = 'https://img.niantu.cn/spark-mall/static/images/default-avatar.png'

const safeText = (value: unknown, fallback = '--') => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  return String(value)
}

const safeNumber = (value: unknown, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

const formatAmount = (value: unknown) => {
  return safeNumber(value).toFixed(2)
}

const maskPhone = (phone: unknown) => {
  const phoneText = String(phone || '')
  if (phoneText.length < 7) {
    return phoneText || '未绑定手机号'
  }
  return `${phoneText.slice(0, 3)}****${phoneText.slice(-4)}`
}

const isLoggedIn = computed(() => userStore.isLoggedIn())

const displayUserInfo = computed(() => {
  const userInfo = userStore.userInfo || {}
  const nickName = safeText(userInfo.nickName || userInfo.username, isLoggedIn.value ? '火花用户' : '未登录')
  const phone = maskPhone(userInfo.phone)

  return {
    avatar: userInfo.avatar || defaultAvatarUrl,
    nickName,
    phone,
    id: safeText(userInfo.id && userInfo.id !== '0' ? userInfo.id : '', '--'),
    balance: formatAmount(userInfo.balance),
    points: safeNumber(userInfo.points),
    giftCard: 0,
    coupon: 0,
    isAgent: Number(userInfo.isAgent || 0) === 1,
    totalCommission: formatAmount(userInfo.totalCommission),
    totalInvitCount: safeNumber(userInfo.totalInvitCount),
    withdrawalAmount: formatAmount(userInfo.withdrawalAmount),
    processAmount: formatAmount(userInfo.processAmount),
  }
})

const menuData = [
  [
    {
      title: '地址管理',
      tit: '管理收货地址',
      url: '/pages-user/address/list',
      type: 'address',
      icon: "location"
    },
    {
      title: '我的订单',
      tit: '查看订单记录',
      url: '/pages-order/list/index?type=-1',
      type: 'order',
      icon: 'wallet',
    },
    {
      title: '消息中心',
      tit: '站内通知',
      url: '/pages-user/message/list/index',
      type: 'message',
      icon: 'dong',
    },
    {
      title: '余额记录',
      tit: '余额明细与提现',
      url: '/pages-user/balance/index/index',
      type: 'balance',
      icon: 'money-circle',
    },
    {
      title: '积分记录',
      tit: '查看积分明细',
      url: '/pages/points/index/index',
      type: 'points',
      icon: 'star',
    },
    {
      title: '提现申请',
      tit: '提交提现',
      url: '/pages-user/balance/apply-withdrawal/index',
      type: 'withdrawal',
      icon: 'creditcard',
    },
    {
      title: '佣金中心',
      tit: '邀请与佣金',
      url: '/pages-user/agency/index/index',
      type: 'agency',
      icon: 'usergroup',
    },
    {
      title: '资料设置',
      tit: '头像昵称',
      url: '/pages-user/profile/index',
      type: 'profile',
      icon: 'setting1',
    },
  ],
]

const orderTagInfos = [
  {
    title: '全部订单',
    iconName: 'wallet',
    orderNum: 0,
    status: -1,
  },
  {
    title: '待付款',
    iconName: 'clear',
    orderNum: 0,
    status: 0,
  },
  {
    title: '待发货',
    iconName: 'a-precisemonitor',
    orderNum: 0,
    status: 1,
  },
  {
    title: '待收货',
    iconName: 'tips',
    orderNum: 0,
    status: 2,
  },
  {
    title: '已完成',
    iconName: 'money-circle',
    orderNum: 0,
    status: 3,
  },
]

const state = reactive<any>({
  showMakePhone: false,
  menuData,
  orderTagInfos,
  customerServiceInfo: {},
  currAuthStep: 1,
  showKefu: true,
  versionNo: '',
})

// 页面加载时检查登录状态
// 注册一个钩子，在组件被挂载之前被调用。
onBeforeMount(() => {

})

// 注册一个回调函数，在组件挂载完成后执行。
onMounted(() => {
  console.log('onMounted')
  // init()
})


onShow(() => {
  init()
})

function init() {
  if (userStore.isLoggedIn()) {
    console.log('已登录')
    fetchUserInfoHandle()
  } else {
    console.log('未登录')
  }
  console.log('userAddress', userStore.userAddress);
}


// 获取用户信息
const fetchUserInfoHandle = async () => {
  try {
    // 调用获取用户信息API
    // const response = await getUserProfile()

    const response = await userStore.getUserInfo()

    // console.log('response', response)

    // 保存用户信息到storage
    // saveUserInfoState(response)
    // userStore.setUserInfo(response)

    console.log('userInfo phone', response.phone);

    state.currAuthStep = 2

  } catch (error: any) {
    uni.showToast({
      title: error.message || '用户信息加载失败',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

const requireLogin = (redirectUrl = '/pages/usercenter/index') => {
  if (userStore.isLoggedIn()) {
    return true
  }

  uni.showToast({
    title: '请登录后操作',
    icon: 'none'
  })
  uni.navigateTo({
    url: `/pages/login/login?redirect=${encodeURIComponent(redirectUrl)}`
  })
  return false
}

function navigateByUrl(url: string) {
  const path = url.split('?')[0]
  if (['/pages/home/home', '/pages/box/index/index', '/pages/points/index/index', '/pages/usercenter/index'].includes(path)) {
    uni.switchTab({ url })
    return
  }
  uni.navigateTo({ url })
}

function onClickCell(item) {
  console.log('onClickCell', item)
  if (!item.url) {
    uni.showToast({
      title: '功能建设中',
      icon: 'none'
    })
    return
  }
  if (!requireLogin(item.url)) return
  navigateByUrl(item.url)
}

function jumpOrderNav(status) {
  const url = `/pages-order/list/index?type=${status}`
  if (!requireLogin(url)) return
  uni.navigateTo({ url })
}

const jumpPageHandle = (pageName) => {
  console.log('pageName:', pageName)
  switch (pageName) {
    case 'balance':
      if (!requireLogin('/pages-user/balance/index/index')) return
      uni.navigateTo({
        url: '/pages-user/balance/index/index',
        success(res) {
        }
      })
      break
    case 'points':
      if (!requireLogin('/pages/points/index/index')) return
      // switchTab 必须写完整路径
      uni.switchTab({
        url: '/pages/points/index/index',
        success(res) {
        }
      })
      break
    default:
  }
}

function call() {
  wx.makePhoneCall({
    phoneNumber: state.customerServiceInfo.servicePhone,
  })
}

// 退出登录
const logoutHandle = async ()=> {
  await userStore.logout()
  state.currAuthStep = 1
  uni.reLaunch({
    url: '/pages/usercenter/index'
  });
}

// 跳转登录页面
const gotoUserEditPage = () => {
  uni.navigateTo({ url: '/pages/login/login?redirect=/pages/usercenter/index' })
}

// 跳转商城首页
const goHomePage = () => {
  // switchTab 必须写完整路径
  uni.switchTab({
    url: '/pages/home/home',
    success(res) {
    }
  })
}

// 跳转代理
const goAgencyPage = () => {
  if (!requireLogin('/pages-user/agency/index/index')) return
  uni.navigateTo({ url: '/pages-user/agency/index/index'})
}

// 跳转寄售专区
const goConsignmentPage = () => {
  uni.navigateTo({ url: '/pages-consignment/index/index'})
}

// 跳转站内信
const goMessageHandle = () => {
  if (!requireLogin('/pages-user/message/list/index')) return
  uni.navigateTo({ url: '/pages-user/message/list/index'})
}

const goProfilePage = () => {
  if (!requireLogin('/pages-user/profile/index')) return
  uni.navigateTo({ url: '/pages-user/profile/index' })
}
</script>

<template>

  <view class="user-page">
    <!-- 自定义顶部标题蓝 -->
    <custom-nav-bar
      title="我的"
      :show-icon="false"
      :bg-color="''"
      :color="'#ffffff'"
    >
    </custom-nav-bar>
    <view class="header flex justify-between">
      <view class="flex items-center">
        <wd-img width="140rpx" height="140rpx" round :src="displayUserInfo.avatar" />
        <view class="user-intro">
          <template v-if="isLoggedIn">
            <navigator
              url="/pages-user/profile/index" 
              open-type="navigate"
              hover-class="navigator-hover"
            >
              <view class="header__name">
                {{ displayUserInfo.nickName }}
              </view>
              <view class="mt-2 header__meta">
                {{ displayUserInfo.phone }}
              </view>
              <view class="mt-2 header__meta">
                ID：{{ displayUserInfo.id }}
              </view>
            </navigator>
          </template>
          <template v-else>
            <view class="login-tip" @click="gotoUserEditPage">
              请登录 / 注册
              <view class="login-subtip">登录后查看资产、订单和消息</view>
            </view>
          </template>
        </view>
      </view>
      <view class="quick-operation flex justify-between">
        <wd-icon name="dong" size="44rpx" color="#fff" @click="goMessageHandle"></wd-icon>
        <wd-icon name="setting1" size="44rpx" color="#fff" @click="goProfilePage"></wd-icon>
      </view>
    </view>

    <!-- 只有代理才显示 -->
    <view class="agency-region" v-if="displayUserInfo.isAgent" @click="goAgencyPage">
      <view class="flex ">
        <view class="flex agency-list">
          <view class="agency-item">
          <view class="label">获得佣金</view>
          <view class="num">{{ displayUserInfo.totalCommission }}</view>
        </view>
        <view class="agency-item">
          <view class="label">已邀请</view>
          <view class="num">{{ displayUserInfo.totalInvitCount }}</view>
        </view>
        </view>
        <image
            class="reward-btn"
            src="https://www.niantu.cn/img/spark-mall/static/usercenter/couponbtn.png"
            mode="widthFix"
          />
      </view>     
    </view>

    <view class="relative p-x-4 mb-1">  
      <view class="account-data h-156rpx bg-white rounded-2 grid grid-cols-4">
        <view class="data-item" @click="jumpPageHandle('points')">
          <view class="text-center">{{ displayUserInfo.points }}</view>
          <view class="text-center label">积分</view>
        </view>
        <view class="data-item" @click="jumpPageHandle('balance')">
          <view class="text-center">{{ displayUserInfo.balance }}</view>
          <view class="text-center label">余额</view>
        </view>
        <view class="data-item">
          <view class="text-center">{{ displayUserInfo.giftCard }}</view>
          <view class="text-center label">礼品卡</view>
        </view>
        <view class="data-item">
          <view class="text-center">{{ displayUserInfo.coupon }}</view>
          <view class="text-center label">优惠券</view>
        </view>
      </view>
    </view>

    <view class="relative p-x-4">
      <view class="mb-2">
        <order-group :order-tag-infos="state.orderTagInfos" @on-click-item="jumpOrderNav" />
      </view>

      <view v-if="!isLoggedIn" class="login-guide mb-2 bg-white rounded-2">
        <view class="guide-title">登录后开启完整个人中心</view>
        <view class="guide-desc">同步展示余额、积分、订单、地址、消息与佣金信息。</view>
        <view class="guide-btn" @click="gotoUserEditPage">立即登录</view>
      </view>

      <!-- 引导区 -->
      <view class="guide-region mb-2 flex justify-between">
        <view class="guide-item" @click="goHomePage" style="background: none;">
          <wd-img src="https://www.niantu.cn/img/spark-mall/static/usercenter/pointsexchange.png" width="100%" height="100%"  mode="widthFix"></wd-img>
        </view>
        <view class="guide-item" @click="goConsignmentPage" style="background: none;">
          <wd-img src="https://www.niantu.cn/img/spark-mall/static/usercenter/consignmentplatform.png" width="100%" height="100%" mode="widthFix"></wd-img>
        </view>
      </view>

      <view class="other-tool mb-3 rounded-2 bg-white">
        <view class="title mb-2 pt-3 pl-3">常用工具</view>
        <view v-for="(item, index) in menuData" :key="index" class="overflow-hidden ">
          <wd-cell-group :border="false">
            <wd-cell v-for="(xitem, xindex) in item" :key="xindex" :title="xitem.title" :value="xitem.tit" is-link @click="onClickCell(xitem)">
              <template #icon v-if="xitem.icon">
                <wd-icon :name="xitem.icon" size="32rpx" />
              </template>
            </wd-cell>
          </wd-cell-group>
        </view>
      </view>

    </view>

    <footer-tool-bar>
      <view class="flex justify-center items-center h-100rpx">
        <view class="user-logout text-align-center" v-if="isLoggedIn">
          <wd-button @click="logoutHandle">退出登录</wd-button>
        </view>
      </view>
    </footer-tool-bar>
  </view>
</template>

<style lang="scss" scoped>
.user-page{
  height: 100vh;
  background: #EDEDED url(https://img.niantu.cn/spark-mall/static/user-header-bg.png) repeat-x;
  background-size: 100% 484rpx;
}
.header{
  box-sizing: border-box;
  height: 200rpx;
  padding: 48rpx 24rpx 24rpx;
  // background: #000;
}
.user-intro{
  margin-left: 20rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}
.header__name{
  max-width: 420rpx;
  font-size: 34rpx;
  line-height: 42rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.header__meta{
  max-width: 420rpx;
  font-size: 24rpx;
  line-height: 30rpx;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.86);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.login-tip{
  box-sizing: border-box;
  padding-top: 20rpx;
  height: 140rpx;
  font-size: 42rpx;
  font-weight: bold;
}
.login-subtip{
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.84);
}
.quick-operation{
  width: 100rpx;
  padding-top: 22rpx;
}
.account-data{
  margin-top: 20rpx;
}
.data-item{
  // background: #000;
  padding-top: 30rpx;
  font-size: 24rpx;
  .label{
    margin-top: 24rpx;
  }
}
.agency-region{
  margin: 0 auto 20rpx;
  box-sizing: border-box;
  padding: 30rpx 0 0 64rpx;
  width: 736rpx;
  height: 266rpx;
  background: url(https://www.niantu.cn/img/spark-mall/static/usercenter/invitefriends.png) no-repeat 0 0;
  background-size: 100% 100%;  
  .reward-btn{
    width: 210rpx;
    margin-top: 23%;
    margin-left: 15%;
  }
}
.agency-list{
  width: 278rpx;
  // border: 4px solid yellow;
}
.agency-item{
  flex: 1;
  padding-top: 130rpx;
  text-align: center;
  font-size: 24rpx;
  .label{
    font-weight: bold;
    color: #FFFB8D;
  }
  .num{
    margin-top: 5rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: white;
  }
}

.guide-region{
}
.guide-item{
  width: 340rpx;
  height: 178rpx;
  background: #000;
}
.login-guide{
  box-sizing: border-box;
  padding: 28rpx 32rpx;
}
.guide-title{
  font-size: 30rpx;
  font-weight: bold;
  color: #262626;
}
.guide-desc{
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 34rpx;
  color: #808080;
}
.guide-btn{
  margin-top: 22rpx;
  width: 168rpx;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  border-radius: 28rpx;
  background: #24BFD6;
  color: #fff;
  font-size: 26rpx;
  font-weight: bold;
}
</style>
