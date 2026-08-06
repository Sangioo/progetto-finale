<script setup>
import { computed, onMounted, ref, nextTick } from 'vue'
import Sidebar from '@/components/sidebar.vue'
import MovieCard from '@/components/moviecard.vue'
import BasePopup from '~/components/base_popup.vue'

const runtimeConfig = useRuntimeConfig()
const DISCOVER_ENDPOINT = runtimeConfig.public.discover
const SEARCH_ENDPOINT = runtimeConfig.public.search
const ADD_TO_WATCHLIST_ENDPOINT = runtimeConfig.public.addToWatchlist
const DELETE_FROM_WATCHLIST_ENDPOINT = runtimeConfig.public.deleteFromWatchlist
const ADD_TO_WATCHED_ENDPOINT = runtimeConfig.public.addToWatched
const DELETE_FROM_WATCHED_ENDPOINT = runtimeConfig.public.deleteFromWatched

const user = useSupabaseUser()

const genreOptions = [
  { id: 28, name: 'Azione' },
  { id: 12, name: 'Avventura' },
  { id: 16, name: 'Animazione' },
  { id: 35, name: 'Commedia' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentario' },
  { id: 18, name: 'Dramma' },
  { id: 10751, name: 'Famiglia' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'Storia' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Musica' },
  { id: 9648, name: 'Mistero' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Fantascienza' },
  { id: 10770, name: 'TV' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Western' },
]

const activeTab = ref('search')
const movies = ref([[], [], [], [], []])
const searchResults = ref([])
const totalResults = ref(0)
const isLoading = ref(false)
const index = ref(0)
const filters = ref({})
const isAuthenticated = computed(() => !!user.value)
const isPopupOpen = ref(false)
const popupTitle = ref('')
const popupMessage = ref('')
const popupActions = ref([])
const popupId = ref('')
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
  try {
    const payload = await callApi({
      endpoint: DISCOVER_ENDPOINT,
      query: { ...appliedFilters, page: index.value + 1 },
      headers: { Accept: 'application/json' },
    })

    movies.value[index.value] = Array.isArray(payload) ? payload : []

    if (!hasSearched.value) {
      totalResults.value =
        payload.total_results ??
        (Array.isArray(payload) ? payload.length : (payload.results?.length ?? 0))
    }
  } catch (err) {
    console.error(err.message)
    showPopup('Errore', 'Errore durante il caricamento dei film. Riprova più tardi.')
  } finally {
    isLoading.value = false
  }
}

const searchMovies = async () => {
  const term = searchTerm.value.trim()

  if (!term) {
    searchResults.value = []
    hasSearched.value = false
    return
  }

  isLoading.value = true
  hasSearched.value = true

  try {
    const payload = await callApi({
      endpoint: SEARCH_ENDPOINT,
      query: { query: term },
      headers: { Accept: 'application/json' },
    })

    searchResults.value = Array.isArray(payload) ? payload : []
  } catch (err) {
    console.error(err.message)
    showPopup('Errore', 'Errore durante la ricerca. Riprova più tardi.')
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

const handleLeftClick = async (movie) => {
  if (!isAuthenticated.value) {
    showPopup("Attenzione", "Devi effettuare l'accesso per aggiungere questo film alla tua watchlist.", [
      { label: 'Accedi', type: 'primary' },
      { label: 'Chiudi', type: 'secondary' },
    ], 'auth')
    return
  }
  movie.watchStatus = movie.watchStatus === 1 ? 0 : 1
  const endpoint =
    movie.watchStatus === 1 ? ADD_TO_WATCHLIST_ENDPOINT : DELETE_FROM_WATCHLIST_ENDPOINT
  await callActionApi(endpoint, movie.id)
}

const handleRightClick = async (movie) => {
  if (!isAuthenticated.value) {
    showPopup("Attenzione", "Devi effettuare l'accesso per aggiungere questo film ai film visti.", [
      { label: 'Accedi', type: 'primary' },
      { label: 'Chiudi', type: 'secondary' },
    ], 'auth')
    return
  }
  movie.watchStatus = movie.watchStatus === 2 ? 0 : 2
  const endpoint = movie.watchStatus === 2 ? ADD_TO_WATCHED_ENDPOINT : DELETE_FROM_WATCHED_ENDPOINT
  await callActionApi(endpoint, movie.id)
}

const handleReviewsClick = async (movie) => {
  sessionStorage.setItem('selectedMovie', JSON.stringify(movie))
  await navigateTo(`/film`)
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

const handleResetFilters = async () => {
  movies.value = [[], [], [], [], []]
  filters.value = {}
  index.value = 0
  await loadMovies()
}

async function routePopupEvent(event) {
  isPopupOpen.value = false
  if (event === 'auth:accedi')
    await navigateTo('/login')
}

function showPopup(title, message, actions, id) {
  popupTitle.value = title
  popupMessage.value = message
  popupActions.value = actions
  popupId.value = id
  isPopupOpen.value = true
}

onMounted(async () => {
  await loadMovies()
  sessionStorage.setItem('genres', JSON.stringify(genreOptions))
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-alabaster-grey laptop:flex-row">
    <aside v-if="activeTab === 'filters'"
      class="p-4 flex-none w-full h-fit static mobilel:p-6 m-0 laptop:flex laptop:grow-0 laptop:shrink-0 laptop:basis-1/4 top-6 laptop:m-6">
      <div class="h-full border border-gray-300 rounded-2xl flex flex-col shadow-sm overflow-hidden">
        <header class="p-6 mobilel:p-8">
          <p class="text-xs uppercase tracking-widest text-mint-leaf font-bold mb-1">Framelog Research</p>
          <h2 class="text-evergreen text-2xl font-extrabold tracking-tight">Filtri <span
              class="font-light opacity-80">Avanzati</span>
          </h2>
        </header>

        <div class="pt-0 px-6 pb-2 flex-1 overflow-y-auto mobilel:px-8">
          <Sidebar @apply-filters="handleApplyFilters" @reset-filters="handleResetFilters" />
        </div>
      </div>
    </aside>

    <main class="p-4 mobilel:p-5 tablet:p-6 flex-1 laptop:pt-6 laptop:px-14 laptop:pb-16 min-w-0 transition-all"
      :class="{ 'max-w-313 my-0 mx-auto': activeTab === 'search' }">
      <div class="flex-wrap tablet:flex-nowrap flex gap-2 mb-8 bg-gray-300 p-2 rounded-xl w-fit">
        <button
          :class="{ 'bg-alabaster-grey text-evergreen shadow-sm': activeTab === 'search', 'bg-transparent': activeTab !== 'search' }"
          class="py-2 px-4 text-sm border-none mobiles:px-5 font-bold mobiles:text-base cursor-pointer rounded-lg transition-all hover:text-evergreen"
          @click="setTab('search')">
          🔎 Ricerca Rapida
        </button>
        <button
          :class="{ 'bg-alabaster-grey text-evergreen shadow-sm': activeTab === 'filters', 'bg-transparent': activeTab !== 'filters' }"
          class="py-2 px-4 text-sm border-none mobiles:px-5 font-bold mobiles:text-base cursor-pointer rounded-lg transition-all hover:text-evergreen"
          @click="setTab('filters')">
          ✨ Esplorazione Avanzata
        </button>
      </div>

      <header class="flex flex-col items-start gap-3 justify-between mb-10 border-b border-gray-300 pb-6">
        <div class="flex flex-col tablet:flex-row w-full justify-between">
          <div v-if="activeTab === 'search'">
            <h1 class="text-evergreen text-2xl mobiles:text-3xl">Trova un <span class="font-normal">Film</span></h1>
            <p class="mt-2">Cerca per titolo o esplora i titoli in evidenza qui sotto.</p>
          </div>
          <div v-else>
            <h1 class="text-evergreen text-2xl mobiles:text-3xl">Esplora <span class="font-normal">su Misura</span></h1>
            <p v-if="!isLoading && hasMovies" class="mt-2">
              Rilevati
              <strong class="text-evergreen">{{ totalResults.toLocaleString() }}</strong> titoli
            </p>
          </div>

          <button v-if="activeTab === 'filters'" @click="handleResetFilters"
            class="flex items-center gap-2 bg-white border border-gray-300 py-2 px-5 rounded-xl font-semibold cursor-pointer transition-all h-fit w-fit hover:bg-evergreen hover:text-white hover:border-evergreen">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Reset Vista
          </button>
        </div>
      </header>

      <div v-if="activeTab === 'search'" class="mb-12">
        <form @submit.prevent="searchMovies">
          <div
            class="grid grid-cols-[1fr] laptop:grid-cols-[1fr_auto] items-center gap-3 border border-gray-300 rounded-2xl p-3 shadow-sm transition-all focus-within:border-mint-leaf focus-within:shadow-lg">
            <input v-model="searchTerm" type="text" class="border-none outline-none bg-transparent"
              placeholder="Scrivi il nome di un film ..." autocomplete="off" spellcheck="false" name="search-box"
              id="search-box" />
            <button
              class="w-full laptop:w-auto rounded-xl py-2 px-6 bg-mint-leaf text-white font-bold cursor-pointer transition-all hover:bg-evergreen"
              type="submit">Cerca</button>
          </div>
        </form>
      </div>

      <section ref="galleryRef" class="gallery">
        <h3 v-if="activeTab === 'search' && !hasSearched && hasMovies && !isLoading"
          class="text-evergreen text-xl font-bold mb-6">
          Titoli in evidenza
        </h3>
        <h3 v-if="activeTab === 'search' && hasSearched && hasMovies && !isLoading"
          class="text-evergreen text-xl font-bold mb-6">
          Risultati per "{{ searchTerm }}"
        </h3>

        <div v-if="isLoading"
          class="grid grid-cols-[1fr] gap-4 mobilem:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] mobilel:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] mobilel:gap-6 tablet:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] tablet:gap-8">
          <div v-for="n in 12" :key="n" class="bg-gray-300 h-80 rounded-2xl animate-pulse"></div>
        </div>

        <div v-else-if="hasMovies"
          class="grid grid-cols-[1fr] gap-4 mobilem:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] mobilel:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] mobilel:gap-6 tablet:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] tablet:gap-8">
          <MovieCard v-for="movie in displayedMovies" :key="movie.id" :movie="movie"
            @left-click="handleLeftClick(movie)" @right-click="handleRightClick(movie)"
            @reviews-click="handleReviewsClick(movie)" :inWatchlist="movie.watchStatus === 1"
            :inWatched="movie.watchStatus === 2" />
        </div>

        <div v-else class="text-center py-16 px-8 rounded-2xl border border-gray-300 my-8 mx-auto">
          <span class="inline-flex text-4xl bg-mint-leaf/30 p-4 rounded-full mb-4">🔎</span>
          <h2 class="text-evergreen">Nessun risultato trovato</h2>
          <p>
            Nessun film corrisponde ai criteri attuali. Prova a modificare i parametri.
          </p>
        </div>

        <nav v-if="!isLoading && hasMovies && activeTab === 'filters'"
          class="flex flex-wrap justify-center items-center gap-1.5 mt-18 p-2 rounded-2xl w-fit mx-auto shadow-sm border border-gray-300">
          <button @click="goToPage(index - 1)" :disabled="index === 0"
            class="w-8 h-8 mobilem:w-10 mobilem:h-10 border-none bg-transparent rounded-full font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-mint-leaf">
            &lsaquo;
          </button>
          <button v-for="n in 5" :key="n" @click="goToPage(n - 1)"
            :class="['w-8 h-8 mobilem:w-10 mobilem:h-10 border-none rounded-full font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-mint-leaf', { 'bg-evergreen text-white': index === n - 1 }]">
            {{ n }}
          </button>
          <button @click="goToPage(index + 1)" :disabled="index === 4"
            class="w-8 h-8 mobilem:w-10 mobilem:h-10 border-none bg-transparent rounded-full font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-mint-leaf">
            &rsaquo;
          </button>
        </nav>
      </section>
    </main>

    <BasePopup :show="isPopupOpen" :title="popupTitle" :content="popupMessage" :actions="popupActions"
      :identifier="popupId" @close="isPopupOpen = false" @action="routePopupEvent" />
  </div>
</template>