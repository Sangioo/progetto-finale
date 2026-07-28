<script setup>
import { onMounted, ref } from 'vue'
import MovieCard from '@/components/moviecard.vue'

const runtimeConfig = useRuntimeConfig()
const API_URL = runtimeConfig.public.apiUrl
const GET_WATCHLIST_ENDPOINT = runtimeConfig.public.getWatchlistEndpoint
const ADD_TO_WATCHED_ENDPOINT = runtimeConfig.public.addToWatchedEndpoint
const DELETE_FROM_WATCHLIST_ENDPOINT = runtimeConfig.public.deleteFromWatchlistEndpoint

const movies = ref([])
const isLoading = ref(false)

const getMovies = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`${API_URL}/${GET_WATCHLIST_ENDPOINT}`, {
      method: 'GET',
      credentials: 'include',
    })
    const payload = await response.json()
    const data = payload.movies || []
    console.log('Watchlist data:', data)
    movies.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Errore recupero watchlist:', error)
  } finally {
    isLoading.value = false
  }
}

async function deleteActionApi(endpoint, idFilm, successMsg) {
  try {
    const url = `${API_URL}/${endpoint}?movieId=${idFilm}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      console.error(`Errore HTTP: ${response.status}`)
      alert(`Si è verificato un errore del server (${response.status}).`)
      return
    }

    const data = await response.json()

    if (data.success) {
      movies.value = movies.value.filter((m) => m.id !== idFilm)
      console.log(successMsg)
    } else {
      alert('Errore: ' + (data.message || 'Sconosciuto'))
    }
  } catch (error) {
    console.error('Errore di rete:', error)
    alert("Errore di rete durante l'operazione.")
  }
}

const deleteFromWatchlist = async (movie) => {
  try {
    await deleteActionApi(DELETE_FROM_WATCHLIST_ENDPOINT, movie.id, 'Rimosso dalla Watchlist!')
    movie.watchStatus = 0
  } catch (e) {
    console.error(e)
  }
}

const addToWatched = async (movie) => {
  try {
    await deleteActionApi(ADD_TO_WATCHED_ENDPOINT, movie.id, 'Segnato come Visto!')
    movie.watchStatus = 2
  } catch (e) {
    console.error(e)
  }
}

const handleReviewsClick = (movie) => {
  const movieToSave = {
    ...movie,
    watchStatus: 1,
  }
  sessionStorage.setItem('selectedMovie', JSON.stringify(movieToSave))
  navigateTo('/reviews')
}

onMounted(() => {
  getMovies()
})
</script>

<template>
  <div class="watchlist-page">
    <header class="watchlist-hero">
      <h1 class="watchlist-title text-evergreen">La mia Watchlist</h1>
      <p class="watchlist-subtitle">Film salvati per essere guardati in futuro.</p>
    </header>

    <div class="content-container">
      <div v-if="isLoading" class="state-box">
        <div class="spinner"></div>
        <p>Caricamento in corso...</p>
      </div>

      <div v-else-if="movies.length === 0" class="empty-state">
        <span class="empty-icon">🎬</span>
        <h2 class="empty-title text-evergreen">Watchlist vuota</h2>
        <p class="empty-subtitle">Esplora il catalogo e aggiungi i film che ti ispirano.</p>
        <nuxt-link to="/" class="btn-primary-custom">Vai al Catalogo</nuxt-link>
      </div>

      <div v-else class="movie-grid">
        <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" @reviews-click="handleReviewsClick(movie)"
          @left-click="deleteFromWatchlist(movie)" @right-click="addToWatched(movie)" :swl="false" :swd="true" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.watchlist-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.watchlist-hero {
  background-color: var(--bg-card);
  border-bottom: 4px solid var(--mint-leaf);
  padding: 1.5rem 2rem;
  border-radius: 16px 16px 0 0;
  margin-bottom: 2.5rem;
}

.watchlist-title {
  font-weight: 800;
  font-size: 2.2rem;
  margin: 0;
}

.watchlist-subtitle {
  color: var(--muted-teal);
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2rem;
}

.state-box {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--bg-card);
  border-radius: 20px;
  border: 1px solid var(--alabaster-grey);
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-title {
  font-weight: 700;
}

.empty-subtitle {
  color: var(--text-muted);
}

.btn-primary-custom {
  display: inline-block;
  margin-top: 1.5rem;
  background-color: var(--evergreen);
  color: var(--bg-card);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  transition: var(--transition-standard);
}

.btn-primary-custom:hover {
  background-color: var(--mint-leaf);
  color: var(--bg-card);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--alabaster-grey);
  border-top: 4px solid var(--mint-leaf);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 425px) {
  .watchlist-page {
    padding: 1.5rem 1rem;
  }

  .watchlist-hero {
    padding: 1.25rem;
  }

  .watchlist-title {
    font-size: 1.7rem;
  }

  .watchlist-subtitle {
    font-size: 0.95rem;
  }
}

@media (max-width: 375px) {
  .movie-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 320px) {
  .watchlist-hero {
    padding: 1rem;
  }

  .watchlist-title {
    font-size: 1.5rem;
  }
}
</style>
