<template>
  <div class="flex items-center gap-2">
    <span class="text-xl select-none inline-block transition-transform duration-300">
      {{ !isDark ? '☀️' : '🌙' }}
    </span>

    <label class="inline-block h-6.5 relative w-12 cursor-pointer m-0" for="theme-checkbox">
      <input type="checkbox" id="theme-checkbox" :checked="isDark" @change="toggleTheme" class="hidden peer" />
      <div class="bg-muted-teal absolute top-0 bottom-0 left-0 right-0 rounded-full transition-colors duration-300 peer-checked:bg-mint-leaf peer-checked:after:translate-x-5.5 after:content-[''] after:absolute after:bottom-0.75 after:left-0.75 after:h-5 after:w-5 after:rounded-full after:bg-white dark:after:bg-[#1e293b] after:shadow-md after:transition-transform after:duration-300"></div>
    </label>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  isDark.value = theme === 'dark'
}

const toggleTheme = (e) => {
  const nextTheme = e.target.checked ? 'dark' : 'light'
  applyTheme(nextTheme)
}

onMounted(() => {
  const savedTheme = document.documentElement.getAttribute('data-theme')
  if (savedTheme) {
    applyTheme(savedTheme)
  } else {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(systemPrefersDark ? 'dark' : 'light')
  }
})
</script>
