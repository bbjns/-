<template>
  <div class="home">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1 class="brand-title">{{ $t('app.title') }}</h1>
          <p class="brand-subtitle">{{ $t('app.subtitle') }}</p>
        </div>
        <div class="nav-menu">
          <el-button 
            v-if="!userStore.isLoggedIn" 
            type="primary" 
            @click="$router.push('/login')"
          >
            {{ $t('nav.login') }}
          </el-button>
          <el-button 
            v-if="!userStore.isLoggedIn" 
            @click="$router.push('/register')"
          >
            {{ $t('nav.register') }}
          </el-button>
          <el-dropdown v-else>
            <el-button type="primary">
              {{ userStore.user?.username }}
              <el-icon><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/calculator')">
                  {{ $t('nav.calculator') }}
                </el-dropdown-item>
                <el-dropdown-item @click="$router.push('/history')">
                  {{ $t('nav.history') }}
                </el-dropdown-item>
                <el-dropdown-item @click="$router.push('/profile')">
                  {{ $t('nav.profile') }}
                </el-dropdown-item>
                <el-dropdown-item divided @click="userStore.logout()">
                  {{ $t('nav.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="main-content">
      <!-- 英雄区域 -->
      <section class="hero">
        <div class="hero-content">
          <h2 class="hero-title gradient-text">
            {{ $t('app.title') }}
          </h2>
          <p class="hero-subtitle">
            {{ $t('app.description') }}
          </p>
          <div class="hero-actions">
            <el-button 
              v-if="userStore.isLoggedIn"
              type="primary" 
              size="large"
              class="btn-gradient"
              @click="$router.push('/calculator')"
            >
              {{ $t('nav.calculator') }}
            </el-button>
            <el-button 
              v-else
              type="primary" 
              size="large"
              class="btn-gradient"
              @click="$router.push('/register')"
            >
              {{ $t('nav.register') }}
            </el-button>
          </div>
        </div>
      </section>

      <!-- 功能特性 -->
      <section class="features">
        <div class="container">
          <h3 class="section-title">核心功能</h3>
          <div class="features-grid">
            <div class="feature-card glass-card fade-in">
              <div class="feature-icon">
                <el-icon size="48"><calculator /></el-icon>
              </div>
              <h4>基础计算</h4>
              <p>精确计算止损止盈、保证金、手续费等基础交易参数</p>
            </div>
            <div class="feature-card glass-card fade-in">
              <div class="feature-icon">
                <el-icon size="48"><trend-charts /></el-icon>
              </div>
              <h4>浮盈加仓</h4>
              <p>智能计算浮盈加仓策略，优化持仓成本</p>
            </div>
            <div class="feature-card glass-card fade-in">
              <div class="feature-icon">
                <el-icon size="48"><money /></el-icon>
              </div>
              <h4>复利计算</h4>
              <p>模拟复利增长，规划长期投资策略</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 主题切换 -->
      <section class="theme-section">
        <div class="container">
          <h3 class="section-title">多主题支持</h3>
          <div class="theme-cards">
            <div 
              class="theme-card financial-theme"
              :class="{ active: userStore.preferences.theme === 'financial' }"
              @click="switchTheme('financial')"
            >
              <h4>金融风格</h4>
              <p>专业金融界面，适合专业交易者</p>
            </div>
            <div 
              class="theme-card dark-theme"
              :class="{ active: userStore.preferences.theme === 'dark' }"
              @click="switchTheme('dark')"
            >
              <h4>深色主题</h4>
              <p>护眼深色界面，适合长时间使用</p>
            </div>
            <div 
              class="theme-card light-theme"
              :class="{ active: userStore.preferences.theme === 'light' }"
              @click="switchTheme('light')"
            >
              <h4>浅色主题</h4>
              <p>清新浅色界面，简洁易用</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 语言切换 -->
      <section class="language-section">
        <div class="container">
          <h3 class="section-title">多语言支持</h3>
          <div class="language-switcher">
            <el-button 
              :type="userStore.preferences.language === 'zh' ? 'primary' : ''"
              @click="switchLanguage('zh')"
            >
              中文
            </el-button>
            <el-button 
              :type="userStore.preferences.language === 'en' ? 'primary' : ''"
              @click="switchLanguage('en')"
            >
              English
            </el-button>
            <el-button 
              :type="userStore.preferences.language === 'ko' ? 'primary' : ''"
              @click="switchLanguage('ko')"
            >
              한국어
            </el-button>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 投机计算器 - 北辰团队专注量化风险管理</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const { locale } = useI18n()
const userStore = useUserStore()

// 切换主题
const switchTheme = async (theme) => {
  await userStore.updatePreferences({ theme })
}

// 切换语言
const switchLanguage = async (lang) => {
  locale.value = lang
  await userStore.updatePreferences({ language: lang })
}

onMounted(() => {
  userStore.init()
})
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  .brand-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    color: white;
  }
  
  .brand-subtitle {
    font-size: 0.9rem;
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
  }
}

.nav-menu {
  display: flex;
  gap: 1rem;
}

.main-content {
  flex: 1;
}

.hero {
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.features {
  padding: 4rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  h4 {
    font-size: 1.5rem;
    margin: 1rem 0;
    color: white;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }
}

.feature-icon {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.theme-section, .language-section {
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.05);
}

.theme-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.theme-card {
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &.active {
    border-color: var(--primary-color);
    transform: scale(1.05);
  }
  
  h4 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: white;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
  }
}

.financial-theme {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.dark-theme {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.light-theme {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  h4, p {
    color: #2c3e50;
  }
}

.language-switcher {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.footer {
  background: rgba(0, 0, 0, 0.2);
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .nav-container {
    padding: 0 1rem;
  }
  
  .features, .theme-section, .language-section {
    padding: 2rem 1rem;
  }
}
</style>