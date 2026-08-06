<script setup>
import { onMounted, ref } from 'vue'
import MovieCard from '~/components/moviecard.vue'
import BasePopup from '~/components/base_popup.vue'

const runtimeConfig = useRuntimeConfig()
const GET_WATCHLIST_ENDPOINT = runtimeConfig.public.getWatchlist
const ADD_TO_WATCHED_ENDPOINT = runtimeConfig.public.addToWatched
const DELETE_FROM_WATCHLIST_ENDPOINT = runtimeConfig.public.deleteFromWatchlist

const movies = ref([])
const isLoading = ref(false)
const isPopupOpen = ref(false)
const popupMessage = ref('')

function showPopup(message) {
  popupMessage.value = message
  isPopupOpen.value = true
}

const getMovies = async () => {
  isLoading.value = true
  try {
    const payload = await callApi({
      endpoint: GET_WATCHLIST_ENDPOINT,
    })
    movies.value = Array.isArray(payload) ? payload : []
  } catch (err) {
    console.error(err)
    showPopup('Errore durante il recupero dei film in watchlist. Riprova più tardi.')
  } finally {
    isLoading.value = false
  }
}

const deleteFromWatchlist = async (movie) => {
  try {
    await callApi({
      endpoint: DELETE_FROM_WATCHLIST_ENDPOINT,
      query: { movieId: movie.id },
      parseJson: false,
    })
    movies.value = movies.value.filter((m) => m.id !== movie.id)
    movie.watchStatus = 0
  } catch (err) {
    console.error(err)
    showPopup('Errore durante la rimozione dalla watchlist. Riprova più tardi.')
  }
}

const addToWatched = async (movie) => {
  try {
    await callApi({
      endpoint: ADD_TO_WATCHED_ENDPOINT,
      query: { movieId: movie.id },
      parseJson: false,
    })
    movies.value = movies.value.filter((m) => m.id !== movie.id)
    movie.watchStatus = 2
  } catch (err) {
    console.error(err)
    showPopup('Errore durante l\'aggiunta ai visti. Riprova più tardi.')
  }
}

const handleReviewsClick = async (movie) => {
  const movieToSave = {
    ...movie,
    watchStatus: 1,
  }
  sessionStorage.setItem('selectedMovie', JSON.stringify(movieToSave))
  await navigateTo('/film')
}

onMounted(async () => {
  await getMovies()
})
</script>

<template>
  <div class="py-6 px-4 max-w-313 my-0 mx-auto mobilel:py-8 mobilel:px-6">
    <BasePopup :show="isPopupOpen" title="Errore" :content="popupMessage" @close="isPopupOpen = false"
      @action="isPopupOpen = false" />
    <header class="p-4 mobiles:p-5 mobilel:py-6 mobilel:px-8 border-b-4 border-b-mint-leaf rounded-2xl mb-10 shadow">
      <h1 class="text-2xl mobiles:text-3xl mobilel:text-4xl text-evergreen font-extrabold">La mia Watchlist</h1>
      <p class="mt-2 text-lg">Film salvati per essere guardati in futuro.</p>
    </header>

    <div>
      <div v-if="isLoading" class="text-center py-16 px-8">
        <div class="w-10 h-10 border-4 border-gray-300 border-t-mint-leaf rounded-full animate-spin mb-6 mx-auto"></div>
        <p>Caricamento in corso...</p>
      </div>

      <div v-else-if="movies.length === 0" class="text-center py-16 px-8 rounded-3xl border border-gray-300">
        <span class="text-7xl block mb-4">🎬</span>
        <h2 class="text-evergreen font-bold mb-2">Watchlist vuota</h2>
        <p>Esplora il catalogo e aggiungi i film che ti ispirano.</p>
        <NuxtLink to="/"
          class="inline-block mt-6 bg-evergreen text-white py-4 px-6 rounded-xl font-bold hover:bg-mint-leaf">Vai al
          Catalogo</NuxtLink>
      </div>

      <div v-else
        class="grid grid-cols-[1fr] mobilem:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] tablet:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-8">
        <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" @reviews-click="handleReviewsClick(movie)"
          @left-click="deleteFromWatchlist(movie)" @right-click="addToWatched(movie)" :inWatchlist="true"
          :inWatched="false" />
      </div>
    </div>
  </div>
</template>