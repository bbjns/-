<template>
  <div id="app" :class="themeClass">
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

const themeClass = computed(() => {
  return `theme-${userStore.preferences.theme}`
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  transition: all 0.3s ease;
}

// 金融主题
.theme-financial {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #ffffff;
  
  .el-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }
  
  .el-input__inner {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #ffffff;
  }
  
  .el-button--primary {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    border: none;
  }
}

// 深色主题
.theme-dark {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #ecf0f1;
  
  .el-card {
    background: rgba(44, 62, 80, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(52, 73, 94, 0.5);
    color: #ecf0f1;
  }
}

// 浅色主题
.theme-light {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #2c3e50;
  
  .el-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #2c3e50;
  }
}
</style>