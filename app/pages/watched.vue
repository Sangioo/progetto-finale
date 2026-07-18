<script setup>
import { onMounted, ref } from 'vue'
import MovieCard from '@/components/moviecard.vue'

const API_URL = import.meta.env.VITE_API_URL
const GET_WATCHED_ENDPOINT = import.meta.env.VITE_GET_WATCHED_ENDPOINT
const DELETE_FROM_WATCHED_ENDPOINT = import.meta.env.VITE_DELETE_FROM_WATCHED_ENDPOINT

const movies = ref([])
const isLoading = ref(false)

const getMovies = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`${API_URL}/${GET_WATCHED_ENDPOINT}`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Errore nella risposta: ${response.status}`)
    }

    const data = await response.json()
    movies.value = Array.isArray(data) ? data : []
    console.log('Film Watched ricevuti:', data)
  } catch (error) {
    console.error('Errore durante il recupero dei film watched:', error)
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
      const errorText = await response.text()
      console.error('Il server ha risposto con un errore:', response.status, errorText)
      alert(`Errore del server (${response.status}): controlla la console.`)
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
    console.error("Errore durante l'operazione:", error)
    alert('Si è verificato un errore imprevisto.')
  }
}

const deleteFromWatched = async (movie) => {
  try {
    await deleteActionApi(DELETE_FROM_WATCHED_ENDPOINT, movie.id, 'Rimosso!')
    movie.watchStatus = 0
  } catch (e) {
    console.error(e)
  }
}

const handleReviewsClick = (movie) => {
  const movieToSave = {
    ...movie,
    watchStatus: 2,
  }
  sessionStorage.setItem('selectedMovie', JSON.stringify(movieToSave))
  navigateTo('/reviews')
}

onMounted(() => {
  getMovies()
})
</script>

<template>
  <div class="watched-page">
    <header class="watched-hero">
      <h1 class="watched-title">Watched</h1>
      <p class="watched-subtitle">Qui trovi i film che hai guardato.</p>
    </header>

    <div class="content-container">
      <div v-if="isLoading" class="state-box">
        <div class="spinner"></div>
        <p class="loading-text">Caricamento in corso...</p>
      </div>

      <div v-else-if="movies.length === 0" class="empty-state">
        <span class="empty-icon">🎬</span>
        <h2 class="empty-title">Non hai film guardati.</h2>
        <p class="empty-subtitle">Una volta che li avrai guardati, li troverai qui.</p>
        <nuxt-link to="/" class="btn-primary-custom">Vai al Catalogo</nuxt-link>
      </div>

      <div v-else class="movie-grid">
        <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" @reviews-click="handleReviewsClick(movie)"
          @right-click="deleteFromWatched(movie)" :swd="false" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.watched-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.watched-hero {
  background-color: var(--bg-card);
  border-bottom: 4px solid var(--mint-leaf);
  padding: 1.5rem 2rem;
  border-radius: 16px 16px 0 0;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}

.watched-title {
  color: var(--evergreen);
  font-weight: 800;
  font-size: 2.2rem;
  margin: 0;
}

.watched-subtitle {
  color: var(--text-muted);
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
}

.loading-text {
  color: var(--text-muted);
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--bg-card);
  border-radius: 20px;
  border: 1px solid rgba(162, 178, 170, 0.25);
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-title {
  color: var(--evergreen);
  font-weight: 700;
  margin-bottom: 0.5rem;
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
  .watched-page {
    padding: 1.5rem 1rem;
  }

  .watched-hero {
    padding: 1.25rem;
  }

  .watched-title {
    font-size: 1.7rem;
  }

  .watched-subtitle {
    font-size: 0.95rem;
  }
}

@media (max-width: 375px) {
  .movie-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 320px) {
  .watched-hero {
    padding: 1rem;
  }

  .watched-title {
    font-size: 1.5rem;
  }
}
</style>
