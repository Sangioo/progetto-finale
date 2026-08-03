<script setup>
import { computed, onUnmounted, ref, onMounted } from 'vue'
import ReviewPopup from '~/components/review_popup.vue'

const runtimeConfig = useRuntimeConfig()
const IMAGE_URL = runtimeConfig.public.imageUrl
const GET_REVIEWS = runtimeConfig.public.getReviews
const ADD_REVIEW = runtimeConfig.public.addReview
const ADD_TO_WATCHLIST_ENDPOINT = runtimeConfig.public.addToWatchlist
const DELETE_FROM_WATCHLIST_ENDPOINT = runtimeConfig.public.deleteFromWatchlist
const ADD_TO_WATCHED_ENDPOINT = runtimeConfig.public.addToWatched
const DELETE_FROM_WATCHED_ENDPOINT = runtimeConfig.public.deleteFromWatched
const PLACEHOLDER_IMAGE = runtimeConfig.public.placeholderImage

const user = useSupabaseUser()

const userVoteStars = ref(3)
const hoverVoteStars = ref(null)
const recensioneTesto = ref('')
const reviewsList = ref([])
const isLoadingRoom = ref(false)
const isReviewPopupOpen = ref(false)
const selectedReviewForPopup = ref(null)
const isErrorOpen = ref(false)
const errorMessage = ref('')

const currentUserAvatar = ref(user.value?.user_metadata?.profile_picture || null)
const isAuthenticated = computed(() => !!user.value)

const displayVoteStars = computed(() =>
  hoverVoteStars.value !== null ? hoverVoteStars.value : userVoteStars.value,
)
const voteForBackend = computed(() => Math.round(displayVoteStars.value * 2))

const movie = computed(() => {
  const storedMovie = sessionStorage.getItem('selectedMovie')
  let parsedMovie = null
  if (storedMovie && storedMovie !== 'undefined' && storedMovie !== 'null') {
    try {
      parsedMovie = JSON.parse(storedMovie)
    } catch (e) {
      console.warn('Errore nel parsing di selectedMovie:', e)
    }
  }
  return (
    parsedMovie || {
      id: null,
      title: 'Dettagli Film',
      poster_path: PLACEHOLDER_IMAGE,
      backdrop_path: null,
      vote_average: 0,
      overview: 'Informazioni non disponibili.',
      genre_ids: [],
      release_date: '',
      isLive: false,
      watchStatus: 0,
    }
  )
})
const localWatchStatus = ref(movie.value?.watchStatus || 0)

async function loadReviews() {
  try {
    const payload = await callApi({
      endpoint: GET_REVIEWS,
      query: { movieId: movie.value.id },
    })
    reviewsList.value = Array.isArray(payload) ? payload : []
  } catch (err) {
    console.error('Errore caricamento recensioni:', err)
  }
}

async function handleInviaRecensione() {
  if (!recensioneTesto.value.trim()) return

  try {
    await callApi({
      endpoint: ADD_REVIEW,
      query: {
        movieId: movie.value.id,
        score: Math.round(userVoteStars.value * 2),
        content: recensioneTesto.value.trim(),
      },
      parseJson: false,
    })

    recensioneTesto.value = ''
    userVoteStars.value = 3
    await loadReviews()
  } catch (err) {
    errorMessage.value = err.message || 'Errore durante l\'invio della recensione. Riprova più tardi.'
    isErrorOpen.value = true
  }
}

function updateSessionMovieStatus(newStatus) {
  const storedMovie = sessionStorage.getItem('selectedMovie')
  if (storedMovie) {
    const parsedMovie = JSON.parse(storedMovie)
    parsedMovie.watchStatus = newStatus
    sessionStorage.setItem('selectedMovie', JSON.stringify(parsedMovie))
  }
}

async function toggleWatchlist() {
  localWatchStatus.value = localWatchStatus.value === 1 ? 0 : 1
  try {
    const endpoint =
      localWatchStatus.value === 1 ? ADD_TO_WATCHLIST_ENDPOINT : DELETE_FROM_WATCHLIST_ENDPOINT
    await callActionApi(endpoint, movie.value.id)

    updateSessionMovieStatus(localWatchStatus.value)
  } catch (err) {
    errorMessage.value = err.message || 'Errore durante l\'aggiornamento della watchlist. Riprova più tardi.'
    isErrorOpen.value = true
  }
}

async function toggleWatched() {
  localWatchStatus.value = localWatchStatus.value === 2 ? 0 : 2
  try {
    const endpoint =
      localWatchStatus.value === 2 ? ADD_TO_WATCHED_ENDPOINT : DELETE_FROM_WATCHED_ENDPOINT
    await callActionApi(endpoint, movie.value.id)

    updateSessionMovieStatus(localWatchStatus.value)
  } catch (err) {
    errorMessage.value = err.message || 'Errore durante l\'aggiornamento della lista dei visti. Riprova più tardi.'
    isErrorOpen.value = true
  }
}

async function handleLiveRoomAction() {
  if (!movie.value || !movie.value.id) return

  await navigateTo({ path: '/room', query: { movieId: movie.value.id } })
}

function apriPopupRecensione(rev) {
  selectedReviewForPopup.value = rev
  isReviewPopupOpen.value = true
}

function setRating(val) {
  userVoteStars.value = val
}

function handleInputRating(e) {
  if (e.target.value === '') {
    userVoteStars.value = 0
    return
  }
  let val = parseInt(e.target.value, 10)
  if (isNaN(val)) val = 0
  if (val < 0) val = 0
  if (val > 10) val = 10
  userVoteStars.value = val / 2
}

function handleInputBlur(e) {
  let val = parseInt(e.target.value, 10)
  if (isNaN(val) || val < 0) val = 0
  if (val > 10) val = 10
  userVoteStars.value = val / 2
  e.target.value = val
}

function genreName(id) {
  const genresStr = sessionStorage.getItem('genres')
  if (!genresStr || genresStr === 'undefined') return 'Genere'
  const genres = JSON.parse(genresStr)
  const genre = genres.find((g) => g.id === id)
  return genre ? genre.name : 'Genere'
}

function getStatusClass(val) {
  if (val < 6) return 'status-low'
  if (val < 8) return 'status-mid'
  return 'status-high'
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const dateObj = new Date(timestamp)
  return dateObj.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  await loadReviews()
})

onUnmounted(() => {
  sessionStorage.removeItem('selectedMovie')
})
</script>

<template>
  <div class="page-wrapper">
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isErrorOpen" class="modal-overlay" @click.self="isErrorOpen = false">
          <div class="modal-content">
            <h3 class="text-evergreen">Attenzione</h3>
            <p>{{ errorMessage }}</p>
            <div class="modal-actions">
              <button @click="isErrorOpen = false" class="btn-confirm">Ho capito</button>
            </div>
          </div>
        </div>
      </Transition>
      <ReviewPopup :show="isReviewPopupOpen" :review="selectedReviewForPopup" @close="isReviewPopupOpen = false" />
    </Teleport>

    <div class="backdrop-overlay" v-if="movie?.backdrop_path"
      :style="{ backgroundImage: `url(${IMAGE_URL}${movie.backdrop_path})` }"></div>

    <div class="content-container">
      <main class="main-content-area">
        <NuxtLink to="/" class="btn-back-top">← Torna ai film</NuxtLink>

        <div class="movie-hero-flex">
          <aside class="poster-section">
            <div class="poster-card">
              <img v-if="movie?.poster_path" :src="`${IMAGE_URL}${movie.poster_path}`" :alt="movie?.title" />
              <div v-else class="no-poster">🎬</div>
              <div class="floating-badge" :class="getStatusClass(movie?.vote_average)">
                ★ {{ movie?.vote_average?.toFixed(1) || '0.0' }}
              </div>
            </div>
          </aside>

          <section class="info-section">
            <header class="movie-header">
              <h1 class="movie-title">
                {{ movie?.title }}
                <span class="movie-year" v-if="movie?.release_date">
                  ({{ movie.release_date.split('-')[0] }})
                </span>
              </h1>
              <div class="tags-row">
                <span class="tag-item" v-for="genre in movie?.genre_ids" :key="genre">
                  {{ genreName(genre) }}
                </span>
              </div>
            </header>

            <div class="action-toolbar">
              <button @click="handleLiveRoomAction" class="btn-live-room" :class="{ 'live-active': movie?.isLive }"
                :disabled="isLoadingRoom">
                <span class="live-indicator" v-if="movie?.isLive"></span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="btn-icon-live">
                  <path
                    d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z" />
                </svg>
                <span>{{
                  isLoadingRoom
                    ? 'Avvio in corso...'
                    : movie?.isLive
                      ? 'Vai alla live room'
                      : 'Inizia una live room'
                }}</span>
              </button>

              <Buttons :movie="movie" :inWatchlist="localWatchStatus === 1" :inWatched="localWatchStatus === 2"
                :isAuthenticated="isAuthenticated" @left-click="toggleWatchlist" @right-click="toggleWatched" />
            </div>

            <hr class="mdivider" />

            <div class="movie-plot">
              <h4 class="section-label">Sinossi</h4>
              <p class="plot-text">{{ movie?.overview }}</p>
            </div>
          </section>
        </div>

        <hr class="divider" />

        <section class="review-section">
          <div class="review-card-premium">
            <div class="card-header-flex">
              <div class="card-header-left">
                <div v-if="currentUserAvatar" class="current-user-avatar-box">
                  <img :src="currentUserAvatar" alt="Il tuo Profilo" class="avatar-mini-img" />
                </div>
                <div class="card-header-text">
                  <h3>La tua Recensione</h3>
                  <p>Cosa ne pensi di questa pellicola?</p>
                </div>
              </div>

              <div class="score-pill" :class="getStatusClass(voteForBackend)">
                {{ voteForBackend }}/10
              </div>
            </div>

            <div class="editor-body">
              <div class="textarea-wrapper">
                <textarea v-model="recensioneTesto" placeholder="Scrivi qui la tua recensione..."
                  maxlength="1000"></textarea>
                <div class="char-count">{{ recensioneTesto.length }}/1000</div>
              </div>

              <div class="rating-box-professional">
                <div class="rating-interactive-side">
                  <span class="rating-label">Seleziona la tua valutazione</span>
                  <div class="stars-container" @mouseleave="hoverVoteStars = null">
                    <template v-for="star in 5" :key="star">
                      <div class="star-item">
                        <span class="star-half left" :class="{ active: displayVoteStars >= star - 0.5 }"
                          @mouseover="hoverVoteStars = star - 0.5" @click="setRating(star - 0.5)">★</span>
                        <span class="star-half right" :class="{ active: displayVoteStars >= star }"
                          @mouseover="hoverVoteStars = star" @click="setRating(star)">★</span>
                      </div>
                    </template>
                  </div>
                </div>

                <div class="rating-score-display">
                  <div class="voto-neutro-badge" :class="getStatusClass(voteForBackend)">
                    <span class="voto-label-mini">Voto</span>
                    <div class="voto-numbers">
                      <input type="number" class="voto-input" :value="voteForBackend" @input="handleInputRating"
                        @blur="handleInputBlur" min="0" max="10" step="1" title="Modifica a mano il voto" />
                      <span class="voto-max">/10</span>
                    </div>
                  </div>
                </div>
              </div>

              <button @click="handleInviaRecensione" class="btn-submit-evergreen" :disabled="!recensioneTesto.trim()">
                <span>Pubblica Recensione</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <aside class="reviews-feed">
        <div class="feed-header">
          <h3>Community</h3>
          <span class="badge-count">{{ reviewsList.length }}</span>
        </div>

        <div class="reviews-list">
          <div v-if="reviewsList.length > 0">
            <TransitionGroup name="fade-list" tag="div" class="list-container">
              <div v-for="rev in reviewsList" :key="rev.id || rev.time" class="comment-item clickable"
                @click="apriPopupRecensione(rev)">
                <div class="comment-top">
                  <div class="user-info">
                    <div class="avatar-mini">
                      <img v-if="rev.profile_pic_url" :src="rev.profile_pic_url" alt="Avatar utente"
                        class="avatar-mini-img" @error="rev.hasError = true" />
                      <template v-else>
                        {{ rev.username?.charAt(0).toUpperCase() }}
                      </template>
                    </div>

                    <div class="user-text">
                      <span class="username">{{ rev.username }}</span>
                      <span class="date">{{ formatDate(rev.time) }}</span>
                    </div>
                  </div>
                  <div class="score-pill" :class="getStatusClass(rev.score)">
                    {{ rev.score }}/10
                  </div>
                </div>
                <p class="comment-content">{{ rev.content }}</p>
              </div>
            </TransitionGroup>
          </div>

          <div v-else class="empty-state">
            <p>Nessuna recensione presente.</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  position: relative;
  min-height: 100vh;
  background-color: var(--alabaster-grey);
}

.backdrop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 480px;
  background-size: cover;
  background-position: center 20%;
  opacity: 0.28;
  pointer-events: none;
  z-index: 0;
  mask-image: linear-gradient(to bottom,
      rgba(0, 0, 0, 1) 40%,
      rgba(0, 0, 0, 0.4) 75%,
      rgba(0, 0, 0, 0) 100%);
  -webkit-mask-image: linear-gradient(to bottom,
      rgba(0, 0, 0, 1) 40%,
      rgba(0, 0, 0, 0.4) 75%,
      rgba(0, 0, 0, 0) 100%);
}

.content-container {
  position: relative;
  z-index: 1;
  max-width: 1250px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2.5rem;
}

.btn-back-top {
  align-self: flex-start;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0 0 1.5rem 0;
  transition: var(--transition-standard);
}

.btn-back-top:hover {
  color: var(--mint-leaf);
  transform: translateX(-4px);
}

.movie-hero-flex {
  display: flex;
  gap: 2rem;
}

.poster-section {
  flex-shrink: 0;
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.poster-card {
  position: relative;
  background-color: var(--bg-card);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  aspect-ratio: 2 / 3;
}

.poster-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.no-poster {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background-color: var(--alabaster-grey);
  opacity: 0.4;
}

.floating-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.4rem 0.75rem;
  border-radius: 30px;
  font-weight: 800;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
  align-items: stretch;
}

.btn-live-room {
  flex: 1 1 auto;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background-color: var(--evergreen);
  color: var(--bg-card);
  border: 1px solid var(--evergreen);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-standard);
  box-shadow: 0 4px 12px rgba(2, 39, 4, 0.15);
}

.btn-live-room:hover:not(:disabled) {
  background-color: var(--mint-leaf);
  border-color: var(--mint-leaf);
  box-shadow: 0 4px 14px rgba(88, 179, 104, 0.3);
  transform: translateY(-1px);
}

.btn-icon-live {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.action-group-secondary {
  display: flex;
  gap: 0.75rem;
  flex: 1 1 auto;
}

.btn-action {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  background-color: transparent;
  border: 1px solid var(--alabaster-grey);
  border-radius: 12px;
  cursor: pointer;
  transition: var(--transition-standard);
  color: var(--text-muted);
}

.btn-action .icon {
  font-size: 1.1rem;
  font-weight: bold;
}

.btn-action .label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-action.is-active-wl {
  background-color: var(--evergreen);
  border-color: var(--evergreen);
  color: var(--bg-card);
}

.btn-action.is-active-seen {
  background-color: var(--mint-leaf);
  border-color: var(--mint-leaf);
  color: var(--bg-card);
}

.btn-action:hover:not(.locked):not([class*='is-active']) {
  background-color: var(--alabaster-grey);
  border-color: var(--mint-leaf);
  color: var(--evergreen);
}

.locked {
  cursor: not-allowed;
  opacity: 0.6;
  filter: grayscale(0.5);
}

.info-section {
  flex-grow: 1;
}

.movie-title {
  font-size: 2.25rem;
  color: var(--evergreen);
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
}

.movie-year {
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 0.5rem;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.tag-item {
  background-color: var(--bg-card);
  color: var(--text-muted);
  border: 1px solid rgba(162, 178, 170, 0.4);
  padding: 0.25rem 0.75rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.movie-plot {
  margin-top: 1rem;
}

.section-label {
  color: var(--evergreen);
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.plot-text {
  color: var(--text-main);
  line-height: 1.6;
  font-size: 0.98rem;
  margin: 0;
}

.divider,
.mdivider {
  border: 0;
  height: 1px;
  background-color: rgba(162, 178, 170, 0.3);
}

.mdivider {
  margin: 1rem 0;
}

.divider {
  margin: 2rem 0;
}

.review-card-premium {
  background-color: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(162, 178, 170, 0.25);
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-user-avatar-box {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--mint-leaf);
  background-color: var(--alabaster-grey);
}

.avatar-mini-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-header-text h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--evergreen);
  font-weight: 700;
}

.card-header-text p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.score-pill {
  padding: 0.4rem 0.8rem;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.9rem;
}

.editor-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.textarea-wrapper {
  position: relative;
  width: 100%;
}

.textarea-wrapper textarea {
  width: 100%;
  min-height: 140px;
  background-color: var(--alabaster-grey);
  border: 1px solid rgba(162, 178, 170, 0.5);
  border-radius: 14px;
  padding: 1.25rem;
  line-height: 1.6;
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  outline: none;
  transition: var(--transition-standard);
}

.textarea-wrapper textarea:focus {
  border-color: var(--mint-leaf);
  box-shadow: 0 0 0 3.5px rgba(88, 179, 104, 0.15);
}

.char-count {
  position: absolute;
  bottom: 12px;
  right: 14px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.rating-box-professional {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--alabaster-grey);
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid rgba(162, 178, 170, 0.25);
}

.rating-interactive-side {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stars-container {
  display: flex;
  gap: 4px;
  align-items: center;
}

.stars-container.is-disabled {
  pointer-events: none;
  opacity: 0.6;
}

.star-item {
  position: relative;
  width: 28px;
  height: 28px;
  font-size: 28px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.star-item:hover {
  transform: scale(1.15);
}

.star-half {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: rgba(162, 178, 170, 0.4);
  cursor: pointer;
  transition: color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-half.left {
  clip-path: polygon(0 0, 50% 0, 50% 100%, 0% 100%);
}

.star-half.right {
  clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
}

.star-half.active {
  color: #ffb800;
  text-shadow: 0 0 4px rgba(255, 184, 0, 0.4);
}

.voto-neutro-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  min-width: 65px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
}

.voto-label-mini {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 800;
  opacity: 0.8;
  letter-spacing: 0.05em;
  margin-bottom: -2px;
}

.voto-numbers {
  display: flex;
  align-items: baseline;
  font-weight: 800;
}

.voto-input {
  background: transparent;
  border: none;
  font-size: 1.4rem;
  font-weight: 800;
  color: inherit;
  width: 32px;
  text-align: center;
  padding: 0;
  outline: none;
}

.voto-input::-webkit-outer-spin-button,
.voto-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.voto-input[type='number'] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.voto-max {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-left: -2px;
}

.btn-submit-evergreen {
  background-color: var(--evergreen);
  color: var(--bg-card);
  border: none;
  border-radius: 10px;
  padding: 0.85rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-standard);
  box-shadow: 0 4px 12px rgba(2, 39, 4, 0.12);
}

.btn-submit-evergreen:hover:not(:disabled) {
  background-color: var(--mint-leaf);
  box-shadow: 0 4px 14px rgba(88, 179, 104, 0.25);
}

.btn-submit-evergreen:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: var(--bg-card);
  padding: 2rem;
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.btn-confirm {
  background: var(--evergreen);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1.5rem;
  font-weight: bold;
}

.reviews-feed {
  background-color: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(162, 178, 170, 0.25);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  align-self: start;
}

.feed-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(162, 178, 170, 0.25);
  padding-bottom: 0.75rem;
}

.feed-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--evergreen);
  font-weight: 800;
}

.badge-count {
  background-color: rgba(162, 178, 170, 0.2);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  background-color: var(--alabaster-grey);
  border: 1px solid rgba(162, 178, 170, 0.3);
  border-radius: 12px;
  padding: 1rem;
  transition: var(--transition-standard);
}

.comment-item.clickable {
  cursor: pointer;
}

.comment-item.clickable:hover {
  border-color: var(--mint-leaf);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.03);
}

.comment-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-mini {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: var(--evergreen);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  overflow: hidden;
  border: 1.5px solid var(--mint-leaf);
}

.user-text {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-main);
}

.date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.comment-content {
  margin: 0;
  font-size: 0.92rem;
  color: var(--text-main);
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
  font-size: 0.92rem;
}

@media (max-width: 1024px) {
  .content-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .movie-hero-flex {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .poster-section {
    width: 200px;
    margin-bottom: 1rem;
  }

  .tags-row {
    justify-content: center;
  }

  .action-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-live-room {
    flex: none;
    width: 100%;
  }

  .action-group-secondary {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 425px) {
  .content-container {
    padding: 1.5rem 1rem;
  }

  .poster-section {
    width: 180px;
  }

  .movie-title {
    font-size: 1.8rem;
  }

  .rating-box-professional {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .rating-interactive-side {
    align-items: center;
  }

  .rating-score-display {
    align-self: center;
  }

  .voto-neutro-badge {
    flex-direction: column;
    justify-content: center;
    width: auto;
    padding: 0.6rem 1.5rem;
  }

  .voto-numbers {
    flex-direction: row;
  }
}
</style>
