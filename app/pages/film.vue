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
const isReviewPopupOpen = ref(false)
const selectedReviewForPopup = ref(null)
const isPopupOpen = ref(false)
const popupTitle = ref('')
const popupMessage = ref('')
const popupActions = ref([])
const popupId = ref('')

const currentUserAvatar = ref(user.value?.user_metadata?.profile_pic_url || null)
const isAuthenticated = computed(() => !!user.value)

const displayVoteStars = computed(() =>
  hoverVoteStars.value !== null ? hoverVoteStars.value : userVoteStars.value,
)
const voteForBackend = computed(() => Math.round(displayVoteStars.value * 2))

const movie = ref(JSON.parse(
  sessionStorage.getItem('selectedMovie') ||
  JSON.stringify({
    id: null,
    title: 'Titolo non disponibile',
    poster_path: null,
    backdrop_path: null,
    vote_average: 0,
    overview: 'Informazioni non disponibili.',
    genre_ids: [],
    release_date: '',
    watchStatus: 0,
  })
))

async function loadReviews() {
  try {
    const payload = await callApi({
      endpoint: GET_REVIEWS,
      query: { movieId: movie.value.id },
    })
    reviewsList.value = Array.isArray(payload) ? payload : []
  } catch (err) {
    console.error(err.message)
    showPopup('Errore', 'Errore durante il caricamento delle recensioni. Riprova più tardi.')
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
    console.error(err.message)
    showPopup('Errore', 'Errore durante l\'invio della recensione. Riprova più tardi.')
  }
}

function updateSessionMovieStatus(newStatus) {
  const storedMovie = sessionStorage.getItem('selectedMovie')
  if (storedMovie) {
    const parsedMovie = JSON.parse(storedMovie)
    parsedMovie.watchStatus = newStatus
    movie.value.watchStatus = newStatus
    sessionStorage.setItem('selectedMovie', JSON.stringify(parsedMovie))
  }
}

async function toggleWatchlist() {
  if (!movie.value || !movie.value.id) return
  if (!isAuthenticated.value) {
    showPopup('Attenzione', 'Devi essere loggato per modificare la watchlist.', [
      { label: 'Accedi', type: 'primary' },
      { label: 'Annulla', type: 'secondary' }
    ], 'auth')
    return
  }
  try {
    const endpoint =
      movie.value.watchStatus === 1 ? DELETE_FROM_WATCHLIST_ENDPOINT : ADD_TO_WATCHLIST_ENDPOINT
    await callActionApi(endpoint, movie.value.id)

    updateSessionMovieStatus(movie.value.watchStatus === 1 ? 0 : 1)
  } catch (err) {
    console.error(err.message)
    showPopup('Errore', 'Errore durante l\'aggiornamento della watchlist. Riprova più tardi.')
  }
}

async function toggleWatched() {
  if (!movie.value || !movie.value.id) return
  if (!isAuthenticated.value) {
    showPopup('Attenzione', 'Devi essere loggato per modificare i film visti.', [
      { label: 'Accedi', type: 'primary' },
      { label: 'Annulla', type: 'secondary' }
    ], 'auth')
    return
  }
  try {
    const endpoint =
      movie.value.watchStatus === 2 ? DELETE_FROM_WATCHED_ENDPOINT : ADD_TO_WATCHED_ENDPOINT
    await callActionApi(endpoint, movie.value.id)

    updateSessionMovieStatus(movie.value.watchStatus === 2 ? 0 : 2)
  } catch (err) {
    console.error(err.message)
    showPopup('Errore', 'Errore durante l\'aggiornamento della lista dei visti. Riprova più tardi.')
  }
}

async function handleLiveRoomAction() {
  if (!movie.value || !movie.value.id) return

  if (!isAuthenticated.value) {
    showPopup('Attenzione', 'Devi essere loggato per accedere alla live room.', [
      { label: 'Accedi', type: 'primary' },
      { label: 'Annulla', type: 'secondary' }
    ], 'auth')
    return
  }

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
  if (val < 6) return 'bg-red-500'
  if (val < 8) return 'bg-yellow-500'
  return 'bg-green-500'
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

function showPopup(title, message, actions, id) {
  popupTitle.value = title
  popupMessage.value = message
  popupActions.value = actions
  popupId.value = id
  isPopupOpen.value = true
}

async function routePopupEvent(event) {
  isPopupOpen.value = false
  if (event === 'auth:accedi')
    await navigateTo('/login')
}

onMounted(async () => {
  await loadReviews()
})

onUnmounted(() => {
  sessionStorage.removeItem('selectedMovie')
})
</script>

<template>
  <div class="relative min-h-screen bg-alabaster-grey">
    <BasePopup :show="isPopupOpen" :title="popupTitle" :content="popupMessage" :actions="popupActions"
      :identifier="popupId" @close="isPopupOpen = false" @action="routePopupEvent" />
    <ReviewPopup :show="isReviewPopupOpen" :review="selectedReviewForPopup" @close="isReviewPopupOpen = false" />

    <div v-if="movie?.backdrop_path"
      class="pointer-events-none absolute inset-x-0 top-0 z-0 h-120 bg-cover bg-top opacity-28 mask-b-to-70%"
      :style="{ backgroundImage: `url(${IMAGE_URL}${movie.backdrop_path})` }"></div>

    <div
      class="relative z-1 mx-auto grid max-w-313 grid-cols-1 gap-8 px-4 py-6 mobilel:px-6 mobilel:py-8 laptop:grid-cols-[2fr_1fr] laptop:gap-10">
      <main>
        <NuxtLink to="/"
          class="inline-block self-start pb-6 text-[0.95rem] font-semibold transition-all duration-300 ease-in-out hover:-translate-x-1 hover:text-mint-leaf">
          ← Torna ai film</NuxtLink>

        <div class="flex flex-col items-center gap-8 text-center tablet:flex-row tablet:items-start tablet:text-left">
          <aside class="flex w-45 shrink-0 flex-col gap-5 mobilel:w-50 tablet:w-55">
            <div class="relative aspect-2/3 overflow-hidden rounded-2xl shadow-lg">
              <img v-if="movie?.poster_path" :src="`${IMAGE_URL}${movie.poster_path}`" :alt="movie?.title"
                class="block h-full w-full object-cover" />
              <img v-else :src="`${PLACEHOLDER_IMAGE}`" :alt="movie?.title" class="block h-full w-full object-cover" />
              <div class="absolute right-3 top-3 rounded-4xl px-3 py-2 text-sm font-extrabold shadow-sm"
                :class="getStatusClass(movie?.vote_average)">
                ★ {{ movie?.vote_average?.toFixed(1) || '0.0' }}
              </div>
            </div>
          </aside>

          <section class="grow">
            <header>
              <h1 class="m-0 text-3xl font-extrabold text-evergreen text-shadow-xs mobilel:text-4xl">
                {{ movie?.title }}
                <span v-if="movie?.release_date" class="ml-2 font-normal">
                  ({{ movie.release_date.split('-')[0] }})
                </span>
              </h1>
              <div class="mt-3 flex flex-wrap justify-center gap-2 tablet:justify-start">
                <span v-for="genre in movie?.genre_ids" :key="genre"
                  class="rounded-4xl border border-gray-300 px-3 py-1 text-sm font-semibold shadow-sm">
                  {{ genreName(genre) }}
                </span>
              </div>
            </header>

            <div class="mt-6 flex flex-col items-stretch gap-2 tablet:grid tablet:grid-cols-[2fr_1fr]">
              <button @click="handleLiveRoomAction"
                class="flex min-w-50 flex-1 items-center justify-center gap-2 rounded-xl border border-evergreen bg-evergreen px-4 py-2 font-bold text-white shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-px hover:border-mint-leaf hover:bg-mint-leaf hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-evergreen disabled:hover:bg-evergreen"
                :disabled="!isAuthenticated">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5 fill-current">
                  <path
                    d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z" />
                </svg>
                <span>Vai alla live room</span>
              </button>

              <Buttons :movie="movie" :inWatchlist="movie.watchStatus === 1" :inWatched="movie.watchStatus === 2"
                :isAuthenticated="isAuthenticated" @left-click="toggleWatchlist" @right-click="toggleWatched" />
            </div>

            <hr class="my-4 h-px border-0 bg-gray-200" />

            <div class="mt-4">
              <h4 class="mb-2 text-base font-bold uppercase tracking-wide text-evergreen">Sinossi</h4>
              <p class=" leading-6.5">{{ movie?.overview }}</p>
            </div>
          </section>
        </div>

        <hr class="my-8 h-px border-0 bg-gray-200" />

        <section>
          <div class="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div class="mb-5 flex items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div v-if="currentUserAvatar"
                  class="h-11 w-11 overflow-hidden rounded-full border-2 border-mint-leaf bg-alabaster-grey">
                  <img :src="currentUserAvatar" alt="Il tuo Profilo" class="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 class="m-0 text-xl font-bold text-evergreen">La tua Recensione</h3>
                  <p class="m-0 text-sm">Cosa ne pensi di questa pellicola?</p>
                </div>
              </div>

              <div class="rounded-4xl px-4 py-2 font-bold" :class="getStatusClass(voteForBackend)">
                {{ voteForBackend }}/10
              </div>
            </div>

            <div class="mt-2 flex flex-col gap-6">
              <div class="relative w-full">
                <textarea v-model="recensioneTesto" placeholder="Scrivi qui la tua recensione..." maxlength="1000"
                  class="min-h-35 w-full resize-y rounded-xl border border-gray-200 bg-alabaster-grey p-5 leading-6.5 outline-none transition-all duration-300 ease-in-out focus:border-mint-leaf focus:shadow-sm"></textarea>
                <div class="absolute bottom-3.5 right-3.5 text-xs">{{
                  recensioneTesto.length }}/1000</div>
              </div>

              <div
                class="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-alabaster-grey px-6 py-5 text-center mobilel:flex-row mobilel:justify-between mobilel:text-left">
                <div class="flex flex-col items-center gap-2 mobilel:items-start">
                  <span class="text-sm font-bold uppercase tracking-wide">Seleziona
                    la tua valutazione</span>
                  <div class="flex items-center gap-1" @mouseleave="hoverVoteStars = null">
                    <template v-for="star in 5" :key="star">
                      <div
                        class="relative inline-flex h-7 w-7 items-center justify-center text-2xl leading-none transition-transform duration-200 ease-in hover:scale-[1.15]">
                        <span
                          class="absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-center [clip-path:polygon(0_0,50%_0,50%_100%,0%_100%)] transition-colors duration-150 ease-in"
                          :class="displayVoteStars >= star - 0.5 ? 'text-yellow-500 text-shadow-sm' : 'text-gray-200'"
                          @mouseover="hoverVoteStars = star - 0.5" @click="setRating(star - 0.5)">★</span>
                        <span
                          class="absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-center [clip-path:polygon(50%_0,100%_0,100%_100%,50%_100%)] transition-colors duration-150 ease-in"
                          :class="displayVoteStars >= star ? 'text-yellow-500 text-shadow-sm' : 'text-gray-200'"
                          @mouseover="hoverVoteStars = star" @click="setRating(star)">★</span>
                      </div>
                    </template>
                  </div>
                </div>

                <div class="self-center">
                  <div
                    class="flex min-w-16 flex-col items-center justify-center rounded-[10px] px-6 py-[0.6rem] shadow-[0_4px_10px_rgba(0,0,0,0.04)] mobilel:w-auto mobilel:px-3 mobilel:py-2"
                    :class="getStatusClass(voteForBackend)">
                    <span class="-mb-0.5 text-xs font-extrabold uppercase tracking-wider opacity-80">Voto</span>
                    <div class="flex flex-row items-baseline font-extrabold">
                      <input type="number"
                        class="w-8 bg-transparent p-0 text-center text-2xl font-extrabold text-inherit outline-none"
                        :value="voteForBackend" @input="handleInputRating" @blur="handleInputBlur" min="0" max="10"
                        step="1" title="Modifica a mano il voto" />
                      <span class="-ml-0.5 text-sm opacity-70">/10</span>
                    </div>
                  </div>
                </div>
              </div>

              <button @click="handleInviaRecensione"
                class="cursor-pointer rounded-xl bg-evergreen px-6 py-4 font-bold text-white shadow-sm transition-all duration-300 ease-in-out hover:bg-mint-leaf hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!isAuthenticated || !recensioneTesto.trim()">
                <span>Pubblica Recensione</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <aside class="self-start rounded-2xl border border-gray-300 p-6">
        <div class="mb-6 flex items-center gap-3 border-b border-gray-300 pb-3">
          <h3 class="m-0 text-lg font-extrabold text-evergreen">Community</h3>
          <span class="rounded-full bg-gray-300 px-3 py-1 text-sm font-bold">{{ reviewsList.length }}</span>
        </div>

        <div class="flex flex-col gap-4">
          <div v-if="reviewsList.length > 0">
            <TransitionGroup name="fade-list" tag="div">
              <div v-for="rev in reviewsList" :key="rev.id || rev.time"
                class="cursor-pointer rounded-xl border border-gray-300 bg-alabaster-grey p-4 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-mint-leaf hover:shadow-sm"
                @click="apriPopupRecensione(rev)">
                <div class="mb-3 flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-mint-leaf bg-evergreen font-bold text-white">
                      <img v-if="rev.profile_pic_url" :src="rev.profile_pic_url" alt="Avatar utente"
                        class="h-full w-full object-cover" @error="rev.hasError = true" />
                      <template v-else>
                        {{ rev.username?.charAt(0).toUpperCase() }}
                      </template>
                    </div>

                    <div class="flex flex-col">
                      <span class="font-bold">{{ rev.username }}</span>
                      <span class="text-xs">{{ formatDate(rev.time) }}</span>
                    </div>
                  </div>
                  <div class="rounded-4xl px-3 py-2 text-sm font-bold" :class="getStatusClass(rev.score)">
                    {{ rev.score }}/10
                  </div>
                </div>
                <p class="m-0 line-clamp-3 leading-normal">{{ rev.content }}</p>
              </div>
            </TransitionGroup>
          </div>

          <div v-else class="px-4 py-8 text-center">
            <p>Nessuna recensione presente.</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
