<script setup>
import { ref, computed } from 'vue'
import themeToggle from './theme_toggle.vue'

const user = useSupabaseUser()

const isMenuOpen = ref(false)

const username = computed(() => {
  return user.value ? user.value.user_metadata?.username : null
})

const profilePicture = computed(() => {
  return user.value ? user.value.user_metadata?.profile_pic_url : null
})

const isAuthenticated = computed(() => !!user.value)

const closeHeader = () => {
  isMenuOpen.value = false
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <nav class="sticky top-0 z-1000 border-b border-muted-teal/20 bg-white shadow-md backdrop-blur-xl">
    <div
      class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 laptop:max-w-330 4k:max-w-550">
      <div class="flex items-center gap-3">
        <!-- Mobile menu button -->
        <button
          class="inline-flex h-10 w-10 items-center justify-center text-evergreen transition hover:border-mint-leaf hover:bg-alabaster-grey focus:outline-none focus:ring-2 focus:ring-mint-leaf/30 laptop:hidden"
          type="button" :aria-expanded="isMenuOpen" aria-controls="mainNavbar" aria-label="Toggle navigation"
          @click="toggleMenu">
          <span class="flex h-4 w-4 flex-col justify-between">
            <span class="h-0.5 w-full rounded-full bg-current transition"
              :class="isMenuOpen ? 'translate-y-1.75 rotate-45' : ''"></span>
            <span class="h-0.5 w-full rounded-full bg-current transition" :class="isMenuOpen ? 'opacity-0' : ''"></span>
            <span class="h-0.5 w-full rounded-full bg-current transition"
              :class="isMenuOpen ? '-translate-y-1.75 -rotate-45' : ''"></span>
          </span>
        </button>

        <!-- Brand -->
        <NuxtLink
          class="group inline-flex items-center gap-3 text-xl font-bold tracking-tight laptop:text-2xl 4k:text-3xl"
          to="/" @click="closeHeader">
          <img src="/logo.svg" alt="FrameLog" class="hidden h-8 w-8 laptop:block" />
          <span class="inline-flex items-center">
            <span class="text-evergreen">Frame</span><span
              class="text-mint-leaf transition duration-300 group-hover:text-evergreen">Log</span>
          </span>
        </NuxtLink>
      </div>

      <!-- Mobile user profile -->
      <div class="flex items-center gap-3 laptop:hidden">
        <!-- User avatar -->
        <NuxtLink v-if="isAuthenticated" to="/profile" @click="closeHeader" class="inline-flex">
          <div
            class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-muted-teal bg-evergreen transition hover:scale-105 hover:border-mint-leaf">
            <img v-if="profilePicture" :src="profilePicture" alt="Foto Profilo" class="h-full w-full object-cover" />
            <span v-else class="text-sm font-bold text-alabaster-grey">
              {{ username?.charAt(0).toUpperCase() }}
            </span>
          </div>
        </NuxtLink>

        <!-- Fallback -->
        <NuxtLink v-else to="/login" @click="closeHeader"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-muted-teal text-evergreen transition hover:border-mint-leaf hover:bg-alabaster-grey"
          aria-label="Vai al login">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </NuxtLink>
      </div>

      <!-- Main navigation -->
      <div id="mainNavbar" :class="[
        isMenuOpen ? 'flex' : 'hidden',
        'w-full flex-col gap-4 border-t border-muted-teal/20 pt-4 laptop:flex laptop:w-auto laptop:flex-1 laptop:flex-row laptop:items-center laptop:justify-between laptop:border-t-0 laptop:pt-0',
      ]">
        <ul class="flex flex-col gap-1 laptop:flex-row laptop:items-center laptop:gap-1">
          <li>
            <NuxtLink
              class="block rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-alabaster-grey hover:text-evergreen"
              @click="closeHeader" to="/">
              Home
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              class="block rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-alabaster-grey hover:text-evergreen"
              @click="closeHeader" to="/watchlist">
              Watchlist
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              class="block rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-alabaster-grey hover:text-evergreen"
              @click="closeHeader" to="/watched">
              Watched
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              class="block rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-alabaster-grey hover:text-evergreen"
              @click="closeHeader" to="/live">
              Live
            </NuxtLink>
          </li>
        </ul>

        <div class="flex flex-col gap-3 laptop:flex-row laptop:items-center laptop:gap-3">
          <themeToggle />

          <!-- User profile -->
          <div v-if="isAuthenticated" class="hidden items-center gap-2 laptop:flex">
            <NuxtLink to="/profile" @click="closeHeader"
              class="inline-flex items-center gap-3 rounded-xl px-3 py-1 no-underline transition hover:bg-alabaster-grey">
              <span class="text-sm font-semibold text-evergreen">{{ username }}</span>

              <div
                class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-muted-teal bg-evergreen transition">
                <img v-if="profilePicture" :src="profilePicture" alt="Foto Profilo"
                  class="h-full w-full object-cover" />
                <span v-else class="text-sm font-bold text-alabaster-grey">
                  {{ username?.charAt(0).toUpperCase() }}
                </span>
              </div>
            </NuxtLink>
          </div>

          <!-- Login/Register links -->
          <div v-else class="flex flex-col gap-2 mobilel:flex-row mobilel:justify-end laptop:gap-2">
            <NuxtLink
              class="inline-flex items-center justify-center rounded-lg border border-muted-teal px-4 py-2 text-sm font-semibold text-evergreen transition hover:border-evergreen hover:bg-alabaster-grey"
              @click="closeHeader" to="/login">
              Login
            </NuxtLink>
            <NuxtLink
              class="inline-flex items-center justify-center rounded-lg border border-mint-leaf bg-mint-leaf px-4 py-2 text-sm font-semibold text-white transition hover:border-evergreen hover:bg-evergreen"
              @click="closeHeader" to="/register">
              Register
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
