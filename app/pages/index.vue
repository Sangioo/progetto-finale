<script setup>
import { computed, onMounted, ref, nextTick } from 'vue'
import Sidebar from '@/components/sidebar.vue'
import MovieCard from '@/components/moviecard.vue'
import BasePopup from '~/components/base_popup.vue'

const API_URL = import.meta.env.VITE_API_URL
const DISCOVER_ENDPOINT = import.meta.env.VITE_DISCOVER_ENDPOINT
const SEARCH_ENDPOINT = import.meta.env.VITE_SEARCH_ENDPOINT
const ADD_TO_WATCHLIST_ENDPOINT = import.meta.env.VITE_ADD_TO_WATCHLIST_ENDPOINT
const DELETE_FROM_WATCHLIST_ENDPOINT = import.meta.env.VITE_DELETE_FROM_WATCHLIST_ENDPOINT
const ADD_TO_WATCHED_ENDPOINT = import.meta.env.VITE_ADD_TO_WATCHED_ENDPOINT
const DELETE_FROM_WATCHED_ENDPOINT = import.meta.env.VITE_DELETE_FROM_WATCHED_ENDPOINT

const activeTab = ref('search')
const movies = ref([[], [], [], [], []])
const searchResults = ref([])
const totalResults = ref(0)
const isLoading = ref(false)
const fetchError = ref('')
const index = ref(0)
const filters = ref({})
const isAuthenticated = ref(false)
const showAuthModal = ref(false)
const authModalMessage = ref('')
const searchTerm = ref('')
const hasSearched = ref(false)
const galleryRef = ref(null)

const displayedMovies = computed(() => {
  if (activeTab.value === 'search' && hasSearched.value) {
    return searchResults.value
  }
  return movies.value[index.value] || []
})

const hasMovies = computed(() => {
  return Array.isArray(displayedMovies.value) && displayedMovies.value.length > 0
})

const setTab = (tab) => {
  activeTab.value = tab
  fetchError.value = ''

  if (tab === 'search') {
    filters.value = {}
    index.value = 0
    if (!movies.value[0]?.length) loadMovies()
  } else if (tab === 'filters') {
    searchTerm.value = ''
    hasSearched.value = false
    searchResults.value = []
    if (!movies.value[0]?.length) loadMovies()
  }
}

async function loadMovies(appliedFilters = {}) {
  isLoading.value = true
  fetchError.value = ''
  try {
    const baseUrl = `${API_URL}/${DISCOVER_ENDPOINT}`.replace(/([^:]\/)\/+/g, '$1')
    const url = new URL(baseUrl)

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') url.searchParams.set(key, value)
    })
    url.searchParams.set('page', index.value + 1)

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Errore: ${response.status}`)

    const payload = await response.json()
    movies.value[index.value] = payload.results || (Array.isArray(payload) ? payload : [])

    if (!hasSearched.value) {
      totalResults.value =
        payload.total_results ??
        (Array.isArray(payload) ? payload.length : (payload.results?.length ?? 0))
    }
  } catch (error) {
    fetchError.value = 'Servizio momentaneamente non disponibile.'
  } finally {
    isLoading.value = false
  }
}

const searchMovies = async () => {
  const term = searchTerm.value.trim()

  if (!term) {
    fetchError.value = ''
    searchResults.value = []
    hasSearched.value = false
    return
  }

  isLoading.value = true
  fetchError.value = ''
  hasSearched.value = true

  try {
    const url = new URL(`${API_URL}/${SEARCH_ENDPOINT}`)
    url.searchParams.set('query', term)

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) throw new Error(`Errore: ${response.status}`)

    const payload = await response.json()
    const results = Array.isArray(payload) ? payload : payload.results || []
    searchResults.value = results
  } catch (error) {
    console.error('Errore ricerca film:', error)
    fetchError.value = 'Nessun risultato trovato. Riprova con un altro titolo.'
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

async function callActionApi(endpoint, idFilm) {
  try {
    const url = `${API_URL}/${endpoint}?idFilm=${idFilm}`
    const response = await fetch(url, { method: 'GET', credentials: 'include' })
    if (!response.ok) throw new Error('Azione fallita')
  } catch (error) {
    console.error('Errore API:', error)
  }
}

const handleLeftClick = async (movie) => {
  if (!isAuthenticated.value) {
    authModalMessage.value =
      "Devi effettuare l'accesso per aggiungere questo film alla tua watchlist."
    return (showAuthModal.value = true)
  }
  movie.watchStatus = movie.watchStatus === 1 ? 0 : 1
  const endpoint =
    movie.watchStatus === 1 ? ADD_TO_WATCHLIST_ENDPOINT : DELETE_FROM_WATCHLIST_ENDPOINT
  await callActionApi(endpoint, movie.id)
}

const handleRightClick = async (movie) => {
  if (!isAuthenticated.value) {
    authModalMessage.value = "Devi effettuare l'accesso per aggiungere questo film ai film visti."
    return (showAuthModal.value = true)
  }
  movie.watchStatus = movie.watchStatus === 2 ? 0 : 2
  const endpoint = movie.watchStatus === 2 ? ADD_TO_WATCHED_ENDPOINT : DELETE_FROM_WATCHED_ENDPOINT
  await callActionApi(endpoint, movie.id)
}

const handleReviewsClick = (movie) => {
  sessionStorage.setItem('selectedMovie', JSON.stringify(movie))
  navigateTo(`/film`)
}

const handleLogin = () => {
  showAuthModal.value = false
  navigateTo('/login')
}

const closeAuthModal = () => {
  showAuthModal.value = false
}

const goToPage = async (newIndex) => {
  if (newIndex >= 0 && newIndex <= 4) {
    index.value = newIndex
    if (!movies.value[index.value]?.length) await loadMovies(filters.value)
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleApplyFilters = async (params) => {
  movies.value = [[], [], [], [], []]
  index.value = 0
  filters.value = params

  await loadMovies(params)

  nextTick(() => {
    if (galleryRef.value) {
      galleryRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

const handleResetFilters = () => {
  movies.value = [[], [], [], [], []]
  filters.value = {}
  index.value = 0
  loadMovies()
}

onMounted(() => {
  loadMovies()
})
</script>

<template>
  <div class="app-container">
    <aside v-if="activeTab === 'filters'" class="sidebar">
      <div class="sidebar-inner">
        <header class="sidebar-header">
          <p class="pre-title">Framelog Research</p>
          <h2 class="text-evergreen">Filtri <span class="accent">Avanzati</span></h2>
        </header>

        <div class="sidebar-scroll">
          <Sidebar @apply-filters="handleApplyFilters" @reset-filters="handleResetFilters" />
        </div>
      </div>
    </aside>

    <main class="content" :class="{ 'full-width': activeTab === 'search' }">
      <div class="navigation-tabs">
        <button :class="['tab-button', { active: activeTab === 'search' }]" @click="setTab('search')">
          🔎 Ricerca Rapida
        </button>
        <button :class="['tab-button', { active: activeTab === 'filters' }]" @click="setTab('filters')">
          ✨ Esplorazione Avanzata
        </button>
      </div>

      <header class="main-header">
        <div class="title-area">
          <template v-if="activeTab === 'search'">
            <h1 class="text-evergreen">Trova un <span class="light">Film</span></h1>
            <p class="subtitle">Cerca per titolo o esplora i titoli in evidenza qui sotto.</p>
          </template>
          <template v-else>
            <h1 class="text-evergreen">Esplora <span class="light">su Misura</span></h1>
            <p v-if="!isLoading && hasMovies" class="stats">
              Rilevati
              <strong class="text-evergreen">{{ totalResults.toLocaleString() }}</strong> titoli
            </p>
          </template>
        </div>

        <button v-if="activeTab === 'filters'" @click="handleResetFilters" class="btn-reset">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          Reset Vista
        </button>
      </header>

      <div v-if="activeTab === 'search'" class="search-hero-section">
        <form class="search-form" @submit.prevent="searchMovies">
          <div class="search-box">
            <input v-model="searchTerm" type="text" class="search-input" placeholder="Scrivi il nome di un film ..."
              autocomplete="off" spellcheck="false" name="search-box" id="search-box" />
            <button class="search-button" type="submit">Cerca</button>
          </div>
        </form>
      </div>

      <section ref="galleryRef" class="gallery">
        <h3 v-if="activeTab === 'search' && !hasSearched && hasMovies && !isLoading"
          class="section-title text-evergreen">
          Titoli in evidenza
        </h3>
        <h3 v-if="activeTab === 'search' && hasSearched && hasMovies && !isLoading"
          class="section-title text-evergreen">
          Risultati per "{{ searchTerm }}"
        </h3>

        <div v-if="isLoading" class="grid">
          <div v-for="n in 12" :key="n" class="skeleton"></div>
        </div>

        <div v-else-if="hasMovies" class="grid">
          <MovieCard v-for="movie in displayedMovies" :key="movie.id" :movie="movie"
            @left-click="handleLeftClick(movie)" @right-click="handleRightClick(movie)"
            @reviews-click="handleReviewsClick(movie)" :swl="movie.watchStatus === 0" :swd="movie.watchStatus < 2" />
        </div>

        <div v-else class="state-card-empty">
          <span class="empty-icon">🔎</span>
          <h2 class="text-evergreen">Nessun risultato trovato</h2>
          <p class="text-muted">
            {{
              fetchError ||
              'Nessun film corrisponde ai criteri attuali. Prova a modificare i parametri.'
            }}
          </p>
        </div>

        <nav v-if="!isLoading && hasMovies && activeTab === 'filters'" class="pagination">
          <button @click="goToPage(index - 1)" :disabled="index === 0" class="nav-arrow">
            &lsaquo;
          </button>
          <button v-for="n in 5" :key="n" @click="goToPage(n - 1)" :class="['page-num', { active: index === n - 1 }]">
            {{ n }}
          </button>
          <button @click="goToPage(index + 1)" :disabled="index === 4" class="nav-arrow">
            &rsaquo;
          </button>
        </nav>
      </section>
    </main>

    <BasePopup :show="showAuthModal" title="Autenticazione necessaria" @close="closeAuthModal">
      <template #content>
        <p class="text-main">{{ authModalMessage }}</p>
      </template>
      <template #actions>
        <button class="btn-sec" @click="closeAuthModal">Annulla</button>
        <button class="btn-danger" @click="handleLogin">Login</button>
      </template>
    </BasePopup>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--alabaster-grey);
}

.sidebar {
  flex: 0 0 25%;
  height: calc(100vh - 3rem);
  position: sticky;
  top: 1.5rem;
  margin: 1.5rem 0 1.5rem 1.5rem;
}

.sidebar-inner {
  background-color: var(--bg-card);
  height: 100%;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
  border: 1px solid rgba(162, 178, 170, 0.2);
  overflow: hidden;
}

.sidebar-header {
  padding: 2rem 2rem 1rem;
}

.pre-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--mint-leaf);
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.sidebar-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.accent {
  font-weight: 300;
  opacity: 0.8;
}

.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 1rem;
}

.content {
  flex: 1;
  padding: 1.5rem 3.5rem 4rem;
  min-width: 0;
  transition: var(--transition-standard);
}

.content.full-width {
  max-width: 1250px;
  margin: 0 auto;
  padding: 1.5rem 2rem 4rem;
}

.navigation-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background-color: rgba(162, 178, 170, 0.15);
  padding: 0.4rem;
  border-radius: 12px;
  width: fit-content;
}

.tab-button {
  border: none;
  background: transparent;
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 8px;
  transition: var(--transition-standard);
}

.tab-button:hover {
  color: var(--evergreen);
}

.tab-button.active {
  background-color: var(--bg-card);
  color: var(--evergreen);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
  border-bottom: 1px solid rgba(162, 178, 170, 0.2);
  padding-bottom: 1.5rem;
}

.main-header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
}

.main-header .light {
  font-weight: 400;
}

.subtitle,
.stats {
  margin-top: 0.5rem;
  font-size: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.search-hero-section {
  margin-bottom: 3rem;
}

.search-box {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--bg-card);
  border: 1px solid rgba(162, 178, 170, 0.4);
  border-radius: 14px;
  padding: 0.6rem 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  transition: var(--transition-standard);
}

.search-box:focus-within {
  border-color: var(--mint-leaf);
  box-shadow: 0 0 0 3.5px rgba(88, 179, 104, 0.12);
}

.search-input {
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 1.05rem;
  color: var(--text-main);
  padding: 0.45rem 0;
}

.search-button {
  border: 0;
  border-radius: 8px;
  padding: 0.65rem 1.5rem;
  background-color: var(--mint-leaf);
  color: var(--bg-card);
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-standard);
}

.search-button:hover {
  background-color: var(--evergreen);
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-card);
  border: 1px solid rgba(162, 178, 170, 0.4);
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: var(--transition-standard);
}

.btn-reset:hover {
  background-color: var(--evergreen);
  color: var(--bg-card);
  border-color: var(--evergreen);
}

.btn-danger {
  background-color: var(--status-low-bg);
  color: var(--bg-card);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-sec {
  background-color: var(--alabaster-grey);
  border: 1px solid rgba(162, 178, 170, 0.3);
  color: var(--text-main);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.skeleton {
  background-color: rgba(162, 178, 170, 0.2);
  height: 320px;
  border-radius: 14px;
  animation: pulse-loading 1.5s infinite ease-in-out;
}

@keyframes pulse-loading {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

.state-card-empty {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--bg-card);
  border-radius: 16px;
  border: 1px solid rgba(162, 178, 170, 0.2);
  max-width: 600px;
  margin: 2rem auto;
}

.empty-icon {
  display: inline-flex;
  font-size: 2.2rem;
  background-color: rgba(88, 179, 104, 0.08);
  padding: 1rem;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 4.5rem;
  background-color: var(--bg-card);
  padding: 0.5rem;
  border-radius: 16px;
  width: fit-content;
  margin-inline: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(162, 178, 170, 0.15);
}

.page-num,
.nav-arrow {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: var(--transition-standard);
}

.page-num:hover,
.nav-arrow:hover:not(:disabled) {
  background-color: var(--alabaster-grey);
}

.page-num.active {
  background-color: var(--evergreen);
  color: var(--bg-card);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .app-container {
    flex-direction: column;
  }

  .sidebar {
    flex: none;
    width: 100%;
    height: auto;
    position: static;
    padding: 1.5rem;
    margin: 0;
  }

  .content,
  .content.full-width {
    padding: 1.5rem;
  }

  .search-box {
    grid-template-columns: 1fr;
  }

  .search-button {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .navigation-tabs {
    flex-wrap: wrap;
  }

  .content,
  .content.full-width {
    padding: 1.25rem;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 1.5rem;
  }

  .pagination {
    flex-wrap: wrap;
  }
}

@media (max-width: 425px) {
  .sidebar {
    padding: 1rem;
  }

  .sidebar-header {
    padding: 1.5rem 1.5rem 0.75rem;
  }

  .sidebar-scroll {
    padding: 0 1.5rem 1rem;
  }

  .content,
  .content.full-width {
    padding: 1rem;
  }

  .main-header h1 {
    font-size: 1.7rem;
  }

  .search-input {
    font-size: 0.95rem;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 375px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 320px) {
  .main-header h1 {
    font-size: 1.5rem;
  }

  .tab-button {
    padding: 0.5rem 0.9rem;
    font-size: 0.8rem;
  }

  .page-num,
  .nav-arrow {
    width: 34px;
    height: 34px;
  }
}
</style>
