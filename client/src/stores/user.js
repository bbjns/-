import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const preferences = ref({
    language: 'zh',
    theme: 'financial',
    currency: 'USDT'
  })

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const membership = computed(() => user.value?.membership || { type: 'free', isActive: false })

  // 登录
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token: newToken, user: userData } = response.data
      
      token.value = newToken
      user.value = userData
      preferences.value = userData.preferences || preferences.value
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('preferences', JSON.stringify(preferences.value))
      
      ElMessage.success('登录成功')
      return { success: true }
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '登录失败')
      return { success: false, error: error.response?.data?.message }
    }
  }

  // 注册
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token: newToken, user: newUser } = response.data
      
      token.value = newToken
      user.value = newUser
      preferences.value = newUser.preferences || preferences.value
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('preferences', JSON.stringify(preferences.value))
      
      ElMessage.success('注册成功，请查收验证邮件')
      return { success: true }
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '注册失败')
      return { success: false, error: error.response?.data?.message }
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('preferences')
    ElMessage.success('退出成功')
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!token.value) return

    try {
      const response = await api.get('/auth/me')
      user.value = response.data.user
      preferences.value = response.data.user.preferences || preferences.value
    } catch (error) {
      console.error('获取用户信息失败:', error)
      logout()
    }
  }

  // 更新偏好设置
  const updatePreferences = async (newPreferences) => {
    try {
      const response = await api.put('/user/preferences', newPreferences)
      preferences.value = { ...preferences.value, ...newPreferences }
      localStorage.setItem('preferences', JSON.stringify(preferences.value))
      ElMessage.success('设置已保存')
      return { success: true }
    } catch (error) {
      ElMessage.error('保存设置失败')
      return { success: false }
    }
  }

  // 更新用户资料
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData)
      user.value = { ...user.value, ...response.data.user }
      ElMessage.success('资料更新成功')
      return { success: true }
    } catch (error) {
      ElMessage.error('更新资料失败')
      return { success: false }
    }
  }

  // 修改密码
  const changePassword = async (passwordData) => {
    try {
      await api.put('/user/password', passwordData)
      ElMessage.success('密码修改成功')
      return { success: true }
    } catch (error) {
      ElMessage.error('密码修改失败')
      return { success: false }
    }
  }

  // 初始化
  const init = async () => {
    const savedPreferences = localStorage.getItem('preferences')
    if (savedPreferences) {
      preferences.value = { ...preferences.value, ...JSON.parse(savedPreferences) }
    }
    
    if (token.value) {
      await fetchUserInfo()
    }
  }

  return {
    user,
    token,
    preferences,
    isLoggedIn,
    membership,
    login,
    register,
    logout,
    fetchUserInfo,
    updatePreferences,
    updateProfile,
    changePassword,
    init
  }
})