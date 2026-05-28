<route lang="jsonc" type="page">
  {
    "layout": "default",
    "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "登录"
    }
  }
</route>


<script setup lang="ts">
defineOptions({
  name: 'Login',
})
import { ref, reactive, onMounted } from 'vue'
// import { login, saveLoginState } from '@/api/auth'
import { useUserStore } from '@/store'

// pinia
const userStore = useUserStore()

// 响应式数据
const formData = reactive({
  phone: '',
  password: '',
  type: 2
})

const phoneFocused = ref(false)
const passwordFocused = ref(false)
const isLoading = ref(false)
const redirectUrl = ref('')
const tabbarPages = ['/pages/home/home', '/pages/box/index/index', '/pages/points/index/index', '/pages/usercenter/index']

const normalizeRedirectUrl = (url = '') => {
  if (!url || url.split('?')[0] === '/pages/login/login') {
    return '/pages/usercenter/index'
  }
  return url
}

const getTargetUrl = () => {
  return normalizeRedirectUrl(redirectUrl.value || uni.getStorageSync('pageUrl') || '/pages/usercenter/index')
}

const jumpToTarget = (url: string) => {
  const targetUrl = normalizeRedirectUrl(url)
  const targetPath = targetUrl.split('?')[0]

  if (tabbarPages.includes(targetPath)) {
    uni.reLaunch({ url: targetUrl })
    return
  }

  uni.redirectTo({ url: targetUrl })
}

const clearRedirect = () => {
  uni.removeStorageSync('pageUrl')
  redirectUrl.value = ''
}

onLoad((options) => {
  if (typeof options?.redirect === 'string') {
    try {
      redirectUrl.value = decodeURIComponent(options.redirect)
    }
    catch {
      redirectUrl.value = options.redirect
    }
  }
})

// 请先阅读并勾选协议
const isAgreePrivacy = ref(false)
const isAgreePrivacyShakeY = ref(false)

const checkedAgreePrivacy = async () => {
  console.log('checkedAgreePrivacy')
  if (!isAgreePrivacy.value) {
    uni.showToast({
      icon: "none",
      title: "请先阅读并勾选协议",
    });
    // 震动提示
    isAgreePrivacyShakeY.value = true;
    setTimeout(() => {
      isAgreePrivacyShakeY.value = false;
    }, 500);
    // 返回错误
    return Promise.reject(new Error("请先阅读并勾选协议"))
  }
}


// #ifdef MP-WEIXIN
// 获取 code 登录凭证
let loginCode = ''
onLoad(async () => {
  console.log('wx ----------')
  // userStore.logout()
  // 获取 openID
  await userStore.wxOpenId()
})

// 获取用户手机号码
const getPhoneNumber = async (ev) => {
  // 只有code有用
  console.log('ev', ev)
  const { encryptedData, iv, code } = ev.detail
  console.log('encryptedData', encryptedData)
  console.log('iv', iv)
  console.log('code', code)

  // 使用 pinia 调用微信手机号登录
  const response = await userStore.wxPhoneLogin({
    openId: userStore.userInfo.openId,
    code
  })

  // 获取 openID
  // await userStore.wxOpenId()

  loginSuccess(response)
}

// 获取手机号实时验证
const getRealTimePhoneNumber = async (e) => {
  console.log('getRealTimePhoneNumber------', e)
  console.log(e.detail.code)  // 动态令牌
  console.log(e.detail.errMsg) // 回调信息（成功失败都会返回）
  console.log(e.detail.errno)  // 错误码（失败时返回）
  // 使用 pinia 调用微信手机号登录
  const response = await userStore.wxPhoneLogin({
    code: e.detail.code
  })

  loginSuccess(response)
}

// 检查登录是否过期（貌似没什么用）
const checkSession = () => {
  uni.checkSession({
    success: (res) => {
      if(res.errMsg == 'checkSession:ok'){
        console.log(res);
        console.log('登录暂未过期');
        console.log(uni.getStorageSync('openid'));
      }
    },
    fail: (err) => {
      console.log(err)
    }
  })
}

// #endif


// 页面加载时检查登录状态
onMounted(() => {
  if (userStore.isLoggedIn()) {
    const pageUrl = getTargetUrl()
    clearRedirect()
    jumpToTarget(pageUrl)
  }
})

// 输入框聚焦处理
const handleFocus = (field: 'phone' | 'password') => {
  if (field === 'phone') {
    phoneFocused.value = true
  } else {
    passwordFocused.value = true
  }
}

// 输入框失焦处理
const handleBlur = (field: 'phone' | 'password') => {
  if (field === 'phone') {
    phoneFocused.value = false
  } else {
    passwordFocused.value = false
  }
}

// 登录处理
const handleLogin = async () => {
  if (isLoading.value) {
    return
  }

  const phone = String(formData.phone).trim()
  const password = formData.password.trim()

  if (!phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none',
      duration: 2000
    })
    return
  }

  if (!password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none',
      duration: 2000
    })
    return
  }

  isLoading.value = true

  try {

    // 使用 pinia 调用登录
    const response = await userStore.login({
      phone,
      password,
      code: null,
      type: 2
    })

    // 清空表单
    formData.phone = ''
    formData.password = ''

    loginSuccess(response)

  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    isLoading.value = false
  }
}

// 登录成功后续操作
const loginSuccess = (response) => {
  if (!response?.token) {
    return
  }

  // 登录成功提示
  uni.showToast({
    title: '登录成功',
    icon: 'success',
    duration: 1200
  })

  const pageUrl = getTargetUrl()
  clearRedirect()
  setTimeout(() => {
    jumpToTarget(pageUrl)
  }, 300)
}

// 忘记密码处理
const handleForgotPassword = () => {
  uni.showToast({
    title: '忘记密码功能开发中...',
    icon: 'none',
    duration: 2000
  })
}

// 跳转到注册页面
const goToRegister = () => {
  console.log('goToRegister')
  uni.navigateTo({
    url: '/pages/register/register'
  })
}

// 返回
const goBackHandle = () => {
  console.log('goBackHandle')
  uni.navigateBack()
}
</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      title=""
      page-name="Login"
      :show-icon="true"
      :bg-color="''"
    >
    </custom-nav-bar>

    <!-- #ifdef APP-PLUS -->
    <!-- app端表单登录 -->
    <view class="login-container">
      <view class="bg-gradient"></view>
      <view class="login-content">
        <!-- Logo区域 -->
        <view class="logo-section">
          <view class="logo-container">
            <view class="logo-icon">E</view>
          </view>
          <text class="welcome-text">欢迎回来</text>
          <text class="subtitle">请登录您的账户</text>
        </view>

        <!-- 表单区域 -->
        <view class="form-section">
          <!-- 用户名输入框 -->
          <view class="input-group" :class="{ 'focused': phoneFocused }">
            <input 
              type="text" 
              class="input-field"
              placeholder="请输入用户名/手机号"
              placeholder-class="user-input-placeholder"
              v-model="formData.phone"
              @focus="handleFocus('phone')"
              @blur="handleBlur('phone')"
              @confirm="handleLogin"
            />
            <text class="input-icon">👤</text>
          </view>

          <!-- 密码输入框 -->
          <view class="input-group" :class="{ 'focused': passwordFocused }">
            <input 
              type="password" 
              class="input-field"
              placeholder-class="user-input-placeholder"
              placeholder="请输入密码"
              v-model="formData.password"
              @focus="handleFocus('password')"
              @blur="handleBlur('password')"
              @confirm="handleLogin"
            />
            <text class="input-icon">🔒</text>
          </view>

          <!-- 登录按钮 -->
          <button 
            class="login-btn" 
            :class="{ 'loading': isLoading }"
            @click="handleLogin"
            :disabled="isLoading"
          >
            <text v-if="!isLoading">登录</text>
            <text v-else>登录中...</text>
          </button>


          <!-- 注册链接 -->
          <view class="register-link-section">
            <text class="register-link" @click="goToRegister">没有账号？立即注册</text>
          </view>

        </view>
      </view>
      <!-- 底部装饰 -->
      <view class="bottom-decoration"></view>
    </view>
    <!-- #endif -->    
    
    <!-- #ifdef H5 -->
    <!-- 网页端表单登录 -->
    <view class="login-container">
      <view class="bg-gradient"></view>
      <view class="login-content">
        <!-- Logo区域 -->
        <view class="logo-section">
          <view class="logo-container">
            <view class="logo-icon">E</view>
          </view>
          <text class="welcome-text">欢迎回来</text>
          <text class="subtitle">请登录您的账户</text>
        </view>

        <!-- 表单区域 -->
        <view class="form-section">
          <!-- 用户名输入框 -->
          <view class="input-group" :class="{ 'focused': phoneFocused }">
            <input 
              type="text" 
              class="input-field"
              placeholder="请输入用户名/手机号"
              placeholder-class="user-input-placeholder"
              v-model="formData.phone"
              @focus="handleFocus('phone')"
              @blur="handleBlur('phone')"
              @confirm="handleLogin"
            />
            <text class="input-icon">👤</text>
          </view>

          <!-- 密码输入框 -->
          <view class="input-group" :class="{ 'focused': passwordFocused }">
            <input 
              type="password" 
              class="input-field"
              placeholder-class="user-input-placeholder"
              placeholder="请输入密码"
              v-model="formData.password"
              @focus="handleFocus('password')"
              @blur="handleBlur('password')"
              @confirm="handleLogin"
            />
            <text class="input-icon">🔒</text>
          </view>

          <!-- 登录按钮 -->
          <button 
            class="login-btn" 
            :class="{ 'loading': isLoading }"
            @click="handleLogin"
            :disabled="isLoading"
          >
            <text v-if="!isLoading">登录</text>
            <text v-else>登录中...</text>
          </button>

          <!-- 注册链接 -->
          <view class="register-link-section">
            <text class="register-link" @click="goToRegister">没有账号？立即注册</text>
          </view>

        </view>
      </view>
      <!-- 底部装饰 -->
      <view class="bottom-decoration"></view>
    </view>
    <!-- #endif -->


    <!-- 小程序端授权登录 -->
    <!-- #ifdef MP-WEIXIN -->
    <view class="wx-login">
      <view class="app-intro flex flex-col justify-center items-center">
        <view class="logo">
          <wd-img :src="'https://img.niantu.cn/spark-mall/static/app-logo.png'" width="100%" height="100%"></wd-img>
        </view>
        <view class="name mt-42rpx font-size-28rpx fw-bold color-#404040">
          <text>火花优选</text>
        </view>
      </view>

      <view class="login-tips mt-174rpx pl-30rpx pr-30rpx">
        <view class="title pb-22rpx">
          <text class="font-size-30rpx color-#404040 fw-bold">授权使用手机号注册</text>
        </view>
        <view class="tips" :class="{'animate-shake-y': isAgreePrivacyShakeY}">
          <label class="label" @click="isAgreePrivacy = !isAgreePrivacy">
            <wd-icon name="check-outline" size="26rpx" :color="isAgreePrivacy ? '#28bb9c' : '#ccc'"></wd-icon>
            <text class="ml-1">我已阅读并同意</text>
          </label>
          <navigator class="link" hover-class="none" url="./protocal">《用户服务协议》</navigator>和<text class="link">《隐私政策》</text>
          <text>且已满18周岁</text>
        </view>
      </view>

      <!--
      <template v-if="false">
        <button @click="wxLogin">微信授权登录</button>

        <wd-divider class="mt-5 mb-5"></wd-divider>
      </template>
      -->

      <template v-if="true">
        <view class="button-privacy-wrap">
          <button
            :hidden="isAgreePrivacy"
            class="button-opacity button phone"
            @click="checkedAgreePrivacy"
          >
            请先阅读并勾选协议
          </button>

          <button class="button phone" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
            <text class="icon icon-phone"></text>
            手机号快捷登录
          </button>
        </view>

        <view class="mt-24rpx no-login text-center h-50rpx">
          <text class="font-size-24rpx fw-bold color-#808080" @click="goBackHandle">暂不登录</text>
        </view>

      </template>

      <template v-if="false">
        <button class="button phone" open-type="getRealtimePhoneNumber" @getrealtimephonenumber="getRealTimePhoneNumber">
          <text class="icon icon-phone"></text>
          手机号实时验证登录
        </button>
      </template>
    </view>
    <!-- #endif -->

  </view>
</template>

<style lang="scss">
.wrapper{
  position: relative;
  background: #fff;
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  display: flex;
  flex-direction: column;
}

.wx-login{
  padding-top: 144rpx;
  .app-intro{
    .logo{
      width: 160rpx;
      height: 160rpx;
    }
  }
  .login-tips{
    .title{
      border-bottom: 1rpx solid #E6E6E6;
    }
    .tips{
      padding-top: 26rpx;
      font-size: 22rpx;
      .radio {
        transform: scale(0.6);
        margin-right: -4rpx;
        margin-top: -4rpx;
        vertical-align: middle;
      }

      .link {
        display: inline;
        color: #1EB7CA;
      }
    }
  }
}

.button-privacy-wrap {
  margin: 124rpx 30rpx 26rpx;
  position: relative;
  .button-opacity {
    opacity: 0;
    position: absolute;
    z-index: 1;
  }
  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 80rpx;
    font-size: 28rpx;
    border-radius: 72rpx;
    color: #fff;
    .icon {
      font-size: 40rpx;
      margin-right: 6rpx;
    }
  }

  .phone {
    background: linear-gradient(90deg, #FF4E50,#FF6E2D,#FF9700);
  }
}

.login-container {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 1;
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 120rpx 60rpx 80rpx;
  position: relative;
  z-index: 2;
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: 100rpx;
}

.logo-container {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  margin: 0 auto 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.logo-icon {
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #667eea;
  font-weight: bold;
}

.welcome-text {
  color: #fff;
  font-size: 56rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 32rpx;
  display: block;
}

/* 表单区域 */
.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.input-group {
  width: 90%;
  position: relative;
  transition: all 0.3s ease;
}

.input-group.focused {
  transform: scale(1.02);
}

.input-field {
  width: 100%;
  padding: 36rpx 40rpx;
  border: none;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20rpx);
  color: #fff;
  font-size: 32rpx;
  transition: all 0.3s ease;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.user-input-placeholder,
.input-field::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.input-group.focused .input-field {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-4rpx);
  box-shadow: 0 16rpx 50rpx rgba(0, 0, 0, 0.15);
}

.input-icon {
  position: absolute;
  right: 40rpx;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 36rpx;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 36rpx;
  border: none;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  color: #667eea;
  font-size: 36rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 40rpx;
  box-shadow: 0 16rpx 50rpx rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.login-btn:active {
  transform: translateY(-6rpx);
  box-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.2);
}

.login-btn.loading {
  opacity: 0.8;
  pointer-events: none;
}

/* 忘记密码 */
.forgot-password {
  text-align: center;
  margin-top: 40rpx;
}

.forgot-link {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  transition: color 0.3s ease;
}

.forgot-link:active {
  color: #fff;
}

/* 注册链接 */
.register-link-section {
  text-align: center;
  margin-top: 40rpx;
}

.register-link {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  transition: color 0.3s ease;
}

.register-link:active {
  color: #fff;
}

/* 测试账号提示 */
.test-account {
  text-align: center;
  margin-top: 60rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  backdrop-filter: blur(10rpx);
}

.test-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

/* 底部装饰 */
.bottom-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 60rpx 60rpx 0 0;
  z-index: 1;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(60rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-section {
  animation: fadeInUp 0.8s ease-out;
}

.input-group:nth-child(1) {
  animation: fadeInUp 0.8s ease-out 0.1s both;
}

.input-group:nth-child(2) {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.login-btn {
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.forgot-password {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.register-link-section {
  animation: fadeInUp 0.8s ease-out 0.5s both;
}

.test-account {
  animation: fadeInUp 0.8s ease-out 0.6s both;
}
</style> 
