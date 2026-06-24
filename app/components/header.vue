<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ThemeToggle from './ThemeToggle.vue'

const API_URL = import.meta.env.VITE_API_URL
const CHECK_SESSION = import.meta.env.VITE_SESSION_ENDPOINT

const username = useCookie('username', { default: () => null })
const profilePicture = useCookie('profilePicture', { default: () => null })
const isLoading = ref(true)

const checkUserSession = async () => {
  try {
    const response = await fetch(`${API_URL}/${CHECK_SESSION}`, {
      method: 'GET',
      credentials: 'include',
    })

    const data = await response.json()

    if (data.authenticated) {
      username.value = data.user

      const avatarUrl = data.profilePicture || null
      profilePicture.value = avatarUrl
    } else {
      username.value = null
      profilePicture.value = null
    }
  } catch (error) {
    console.error('Errore durante il recupero della sessione:', error)
  } finally {
    isLoading.value = false
  }
}

const handleDynamicUpdate = () => {
  checkUserSession()
}

const closeHeader = () => {
  const navbarMenu = document.getElementById('mainNavbar')
  const toggleButton = document.getElementById('navbarToggleButton')

  if (navbarMenu && navbarMenu.classList.contains('show') && toggleButton) {
    toggleButton.click()
  }
}

onMounted(() => {
  checkUserSession()
  window.addEventListener('avatar-updated', handleDynamicUpdate)
})

onUnmounted(() => {
  window.removeEventListener('avatar-updated', handleDynamicUpdate)
})
</script>

<template>
  <nav class="navbar navbar-expand-lg custom-navbar shadow-sm">
    <div class="container navbar-container-flex">
      <button
        class="mobile-toggler-left"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
        id="navbarToggleButton"
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <router-link class="navbar-brand desktop-brand-only" to="/" @click="closeHeader">
        <img src="/logo.svg" alt="FrameLog" width="32" height="32" />
        <span class="fw-bold brand-text">
          <span class="brand-frame">Frame</span><span class="brand-log">Log</span>
        </span>
      </router-link>

      <router-link class="navbar-brand mobile-brand-only" to="/" @click="closeHeader">
        <span class="fw-bold fs-4 brand-text">
          <span class="brand-frame">Frame</span><span class="brand-log">Log</span>
        </span>
      </router-link>

      <div class="mobile-profile-right">
        <router-link v-if="username" to="/profile" @click="closeHeader" class="mobile-avatar-link">
          <div class="header-avatar-wrapper m-0">
            <img
              v-if="profilePicture"
              :src="profilePicture"
              alt="Foto Profilo"
              class="header-avatar-img"
            />
            <div v-else class="header-avatar-placeholder">
              {{ username?.charAt(0).toUpperCase() }}
            </div>
          </div>
        </router-link>
        <router-link v-else to="/login" @click="closeHeader" class="mobile-profile-icon-fallback">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </router-link>
      </div>

      <div class="collapse navbar-collapse" id="mainNavbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 layout-nav-links">
          <li class="nav-item">
            <router-link class="nav-link" @click="closeHeader" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" @click="closeHeader" to="/watchlist"
              >Watchlist</router-link
            >
          </li>
          <li class="nav-item">
            <router-link class="nav-link" @click="closeHeader" to="/watched">Watched</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" @click="closeHeader" to="/live">Live</router-link>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-3 actions-wrapper">
          <ThemeToggle />

          <div v-if="isLoading" class="spinner-border spinner-border-sm text-mint" role="status">
            <span class="visually-hidden">Caricamento...</span>
          </div>

          <div v-else-if="username" class="d-flex align-items-center gap-2 desktop-profile-only">
            <router-link
              to="/profile"
              @click="closeHeader"
              class="d-flex align-items-center gap-3 text-decoration-none nav-profile-link"
            >
              <span class="username-display">{{ username }}</span>

              <div class="header-avatar-wrapper">
                <img
                  v-if="profilePicture"
                  :src="profilePicture"
                  alt="Foto Profilo"
                  class="header-avatar-img"
                />
                <div v-else class="header-avatar-placeholder">
                  {{ username?.charAt(0).toUpperCase() }}
                </div>
              </div>
            </router-link>
          </div>

          <div v-else class="d-flex gap-2 authentication-buttons">
            <router-link class="btn btn-outline-custom btn-sm" @click="closeHeader" to="/login"
              >Login</router-link
            >
            <router-link class="btn btn-custom-primary btn-sm" @click="closeHeader" to="/register"
              >Register</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.navbar-brand {
  transition: var(--transition-standard);
}

.brand-text {
  display: inline-flex;
  font-size: 1.5rem;
}

.brand-frame {
  color: var(--text-main);
  transition: color 0.3s ease;
}

.brand-log {
  color: var(--mint-leaf);
}

.navbar-brand:hover .brand-frame,
.navbar-brand:focus .brand-frame {
  color: var(--mint-leaf);
}

.text-mint {
  color: var(--mint-leaf) !important;
}

.navbar-container-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.mobile-toggler-left {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 4px;
  width: 36px;
  height: 36px;
  z-index: 101;
}

.mobile-toggler-left .bar {
  width: 22px;
  height: 2.5px;
  background-color: var(--evergreen);
  border-radius: 4px;
  transition: var(--transition-standard);
}

.mobile-profile-right {
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 101;
}

.mobile-profile-icon-fallback {
  color: var(--evergreen);
  display: flex;
  align-items: center;
  padding: 4px;
}

.mobile-brand-only {
  display: none;
}

.layout-nav-links {
  gap: 0.25rem;
}

.nav-item {
  padding: 0;
  display: flex;
  align-items: center;
}

.nav-link {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  position: relative;
  transition: var(--transition-standard);
}

.nav-link:hover,
.nav-link:focus {
  color: var(--evergreen);
  background-color: var(--alabaster-grey);
}

.nav-link.router-link-active {
  color: var(--mint-leaf);
  background-color: rgba(88, 179, 104, 0.08);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0.9rem;
  right: 0.9rem;
  height: 2px;
  background-color: var(--mint-leaf);
  border-radius: 2px;
}

.nav-profile-link {
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  transition: var(--transition-standard);
}

.nav-profile-link:hover {
  background-color: var(--alabaster-grey);
}

.username-display {
  color: var(--evergreen);
  font-weight: 600;
  font-size: 0.95rem;
}

.header-avatar-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--evergreen);
  border: 2px solid var(--muted-teal);
  transition: var(--transition-standard);
}

.nav-profile-link:hover .header-avatar-wrapper {
  border-color: var(--mint-leaf);
  transform: scale(1.04);
}

.header-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-avatar-placeholder {
  color: var(--bg-card);
  font-weight: 700;
  font-size: 0.9rem;
}

.btn-custom-primary {
  background-color: var(--mint-leaf);
  border-color: var(--mint-leaf);
  color: var(--bg-card);
  font-weight: 600;
  padding: 0.45rem 1.1rem;
  border-radius: 8px;
  transition: var(--transition-standard);
}

.btn-custom-primary:hover,
.btn-custom-primary:focus {
  background-color: var(--evergreen);
  border-color: var(--evergreen);
  color: var(--bg-card);
  box-shadow: 0 4px 12px rgba(2, 39, 4, 0.15);
}

.btn-outline-custom {
  color: var(--evergreen);
  border-color: var(--muted-teal);
  font-weight: 600;
  padding: 0.45rem 1.1rem;
  border-radius: 8px;
  transition: var(--transition-standard);
}

.btn-outline-custom:hover,
.btn-outline-custom:focus {
  background-color: var(--alabaster-grey);
  border-color: var(--evergreen);
  color: var(--evergreen);
}

@media (min-width: 2560px) {
  .container {
    max-width: 2200px;
  }

  .brand-text {
    font-size: 1.85rem;
  }
}

@media (min-width: 992px) and (max-width: 2559px) {
  .container {
    max-width: 1320px;
  }
}

@media (max-width: 991px) {
  .mobile-toggler-left {
    display: flex;
  }

  .mobile-profile-right {
    display: flex;
  }

  .mobile-brand-only {
    display: block;
  }

  .desktop-brand-only {
    display: none;
  }

  .desktop-profile-only {
    display: none;
  }

  .navbar-collapse {
    width: 100%;
    order: 4;
  }

  .layout-nav-links {
    padding: 1rem 0 0.5rem 0;
    border-top: 1px solid rgba(162, 178, 170, 0.15);
    margin-top: 0.75rem;
  }

  .nav-link {
    padding: 0.6rem 1rem;
  }

  .nav-link.router-link-active::after {
    left: 4px;
    right: auto;
    width: 3px;
    height: 50%;
    top: 25%;
    bottom: auto;
  }

  .actions-wrapper {
    padding: 0.75rem 0 0.5rem 0;
    border-top: 1px solid rgba(162, 178, 170, 0.15);
    justify-content: space-between;
    width: 100%;
  }

  .authentication-buttons {
    display: flex;
    gap: 10px;
    flex-grow: 1;
    justify-content: flex-end;
  }
}

@media (max-width: 425px) {
  .brand-text {
    font-size: 1.35rem;
  }

  .custom-navbar {
    padding: 0.5rem 0;
  }
}

@media (max-width: 375px) {
  .brand-text {
    font-size: 1.25rem;
  }

  .mobile-toggler-left {
    width: 32px;
    height: 32px;
  }

  .header-avatar-wrapper {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 320px) {
  .brand-text {
    font-size: 1.15rem;
  }

  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .authentication-buttons {
    gap: 6px;
  }

  .btn-sm {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
