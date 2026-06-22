<template>
  <div class="theme-switch-container">
    <span class="theme-emoji">
      {{ !isDark ? '☀️' : '🌙' }}
    </span>

    <label class="theme-switch" for="theme-checkbox">
      <input type="checkbox" id="theme-checkbox" :checked="isDark" @change="toggleTheme" />
      <div class="slider round">
        <div class="ball"></div>
      </div>
    </label>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  isDark.value = theme === 'dark'
  localStorage.setItem('frameLog-theme', theme)
}

const toggleTheme = (e) => {
  const nextTheme = e.target.checked ? 'dark' : 'light'
  applyTheme(nextTheme)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('frameLog-theme')
  if (savedTheme) {
    applyTheme(savedTheme)
  } else {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(systemPrefersDark ? 'dark' : 'light')
  }
})
</script>

<style scoped>
.theme-switch-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-emoji {
  font-size: 1.2rem;
  user-select: none;
  line-height: 1;
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-switch {
  display: inline-block;
  height: 26px;
  position: relative;
  width: 48px;
  cursor: pointer;
  margin: 0;
}

.theme-switch input {
  display: none;
}

.slider {
  background-color: var(--muted-teal);
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: var(--transition-standard);
}

.slider.round {
  border-radius: 34px;
}

.ball {
  background-color: var(--bg-card);
  bottom: 3px;
  height: 20px;
  left: 3px;
  position: absolute;
  transition: var(--transition-standard);
  width: 20px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background-color: var(--mint-leaf);
}

input:checked + .slider .ball {
  transform: translateX(22px);
}
</style>
