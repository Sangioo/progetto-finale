<script setup>
import { ref, onMounted } from 'vue'
import BasePopup from '~/components/base_popup.vue'
import ReviewPopup from '~/components/review_popup.vue'

const runtimeConfig = useRuntimeConfig()
const IMAGE_URL = runtimeConfig.public.imageUrl
const PLACEHOLDER_IMAGE = runtimeConfig.public.placeholderImage
const GET_REVIEWS = runtimeConfig.public.getMyReviews
const DEL_REVIEW = runtimeConfig.public.deleteReview
const UPDATE_PASSWORD = runtimeConfig.public.updatePassword
const UPLOAD_AVATAR = runtimeConfig.public.addProfilePicture
const DEL_AVATAR = runtimeConfig.public.deleteProfilePicture

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const userReviews = ref([])
const currentUsername = ref(user.value?.user_metadata?.username || '')

const userAvatarUrl = computed(() => {
  return user.value ? user.value?.user_metadata?.profile_pic_url : null
})
const fileInput = ref(null)
const isActionLoading = ref(false)

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const isPopupOpen = ref(false)
const popupTitle = ref('')
const popupMessage = ref('')
const popupActions = ref([])
const popupId = ref('')

const isReadPopupOpen = ref(false)
const selectedReviewToRead = ref(null)

async function fetchUserReviews() {
  try {
    const payload = await callApi({ endpoint: GET_REVIEWS })
    userReviews.value = Array.isArray(payload) ? payload : []
  } catch (err) {
    showPopup('Errore', err.message || 'Impossibile caricare lo storico recensioni.')
  }
}

async function handleDeleteReview(review) {
  const idFilm = review.id

  if (!idFilm) {
    showPopup('Errore', 'Impossibile identificare il film di questa recensione.')
    return
  }

  try {
    await callApi({
      endpoint: DEL_REVIEW,
      query: { movieId: parseInt(idFilm, 10) },
      parseJson: false,
    })

    userReviews.value = userReviews.value.filter((r) => r.id !== idFilm)
    showPopup('Successo', 'Recensione rimossa con successo.')
  } catch (err) {
    showPopup('Errore', err.message || 'Errore di rete durante la cancellazione.')
  }
}

function triggerFileInput() {
  fileInput.value.click()
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('profile_picture', file)

  isActionLoading.value = true
  try {
    await callApi({
      endpoint: UPLOAD_AVATAR,
      method: 'POST',
      body: formData,
      parseJson: false,
    })

    const { error } = await supabase.auth.refreshSession()
    if (error) throw error

    showPopup('Successo', 'Foto profilo aggiornata con successo!')

  } catch (err) {
    showPopup('Errore', err.message || 'Errore di connessione durante il caricamento del file.')
  } finally {
    isActionLoading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}


async function confirmRemoveAvatar() {
  isPopupOpen.value = false
  isActionLoading.value = true
  try {
    await callApi({
      endpoint: DEL_AVATAR,
      method: 'POST',
      parseJson: false,
    })

    const { error } = await supabase.auth.refreshSession()
    if (error) throw error

    showPopup('Successo', 'Foto profilo rimossa!')
  } catch (err) {
    showPopup('Errore', err.message || 'Errore di connessione durante la rimozione.')
  } finally {
    isActionLoading.value = false
  }
}

async function handleCambiaPassword() {
  if (newPassword.value !== confirmPassword.value) {
    showPopup('Attenzione', 'La nuova password e quella di conferma non coincidono.')
    return
  }

  if (!checkPassword(newPassword.value).isValid) {
    showPopup('Attenzione', 'La nuova password non soddisfa i requisiti di sicurezza.')
    return
  }

  isActionLoading.value = true
  try {
    await callApi({
      endpoint: UPDATE_PASSWORD,
      method: 'POST',
      body: JSON.stringify({
        password: oldPassword.value,
        newPassword: newPassword.value,
      }),
      parseJson: false,
    })

    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showPopup('Successo', 'Password aggiornata con successo.')
  } catch (err) {
    showPopup('Errore', err.message || "Errore di rete durante l'aggiornamento della password.")
  } finally {
    isActionLoading.value = false
  }
}

async function confirmLogout() {
  isPopupOpen.value = false
  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    await navigateTo('/login')
  } catch (error) {
    showPopup('Errore', error.message || 'Errore durante il logout.')
  }
}

function openReadReviewPopup(review) {
  selectedReviewToRead.value = review
  isReadPopupOpen.value = true
}

function getStatusClass(val) {
  if (val < 6) return 'bg-red-500'
  if (val < 8) return 'bg-yellow-500'
  return 'bg-green-500'
}

function formatDate(timestamp) {
  if (!timestamp) return 'Data non disponibile'

  const dateObj = isNaN(timestamp) ? new Date(timestamp) : new Date(Number(timestamp))
  return dateObj.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function goToFilm(movie) {
  const movieData = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    release_date: movie.release_date,
    vote_average: Number(movie.vote_average),
    genre_ids: movie.genre_ids,
    watchStatus: 2,
  }
  sessionStorage.setItem('selectedMovie', JSON.stringify(movieData))
  await navigateTo(`/film`)
}

async function routePopupEvent(event) {
  if (event === 'logout:esci') {
    await confirmLogout()
  } else if (event === 'removeAvatar:rimuovi') {
    await confirmRemoveAvatar()
  } else {
    isPopupOpen.value = false
  }
}

function handleRemoveAvatarClick() {
  showPopup('Conferma Rimozione', 'Sei sicuro di voler rimuovere la tua foto profilo?', [{
    label: 'Annulla',
    type: 'secondary'
  }, {
    label: 'Rimuovi',
    type: 'primary'
  }], 'removeAvatar')
}

function handleLogoutClick() {
  showPopup('Conferma Disconnessione', 'Sei sicuro di voler uscire dal tuo account?', [{
    label: 'Annulla',
    type: 'secondary'
  }, {
    label: 'Esci',
    type: 'primary'
  }], 'logout')
}

function showPopup(title, message, actions, id) {
  popupTitle.value = title
  popupMessage.value = message
  popupActions.value = actions
  popupId.value = id
  isPopupOpen.value = true
}

onMounted(async () => {
  await fetchUserReviews()
})
</script>

<template>
  <div class="py-8 px-3 mobiles:py-10 mobiles:px-4 min-h-screen mobilel:py-16 mobilel:px-8 bg-alabaster-grey">
    <BasePopup :show="isPopupOpen" :title="popupTitle" :content="popupMessage" :actions="popupActions"
      :identifier="popupId" @close="isPopupOpen = false" @action="routePopupEvent" />

    <ReviewPopup :show="isReadPopupOpen" :review="selectedReviewToRead" @close="isReadPopupOpen = false" />

    <div class="max-w-313 my-0 mx-auto flex flex-col gap-8">
      <header
        class="p-5 max-w-full mobiles:p-6 rounded-3xl mobilel:p-9 border border-gray-300 shadow-sm flex flex-col tablet:flex-row text-center gap-6 items-center tablet:gap-12 relative overflow-hidden border-l-5 border-l-evergreen">
        <div class="flex flex-col items-center gap-3">
          <div
            class="w-20 h-20 relative mobiles:w-25 mobiles:h-25 rounded-full overflow-hidden cursor-pointer shadow-sm border-4 border-gray-300 bg-evergreen transition-all hover:scale-105 group"
            @click="triggerFileInput">
            <img v-if="userAvatarUrl" :src="userAvatarUrl" alt="Avatar utente" class="w-full h-full object-cover" />
            <div v-else
              class="w-full h-full flex items-center justify-center text-alabaster-grey text-5xl font-extrabold">
              {{ currentUsername?.charAt(0).toUpperCase() }}
            </div>
            <div
              class="opacity-0 group-hover:opacity-100 absolute top-0 left-0 w-full h-full bg-green-900 flex items-center justify-center text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                <path
                  d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" />
              </svg>
            </div>
            <input type="file" ref="fileInput" @change="handleAvatarUpload" accept="image/png, image/jpeg"
              class="hidden" />
          </div>

          <button v-if="userAvatarUrl" @click="handleRemoveAvatarClick"
            class="bg-transparent text-red-500 text-xs font-semibold cursor-pointer py-1 px-2 transition-all hover:underline hover:scale-105"
            :disabled="isActionLoading" title="Rimuovi foto profilo">
            Rimuovi foto
          </button>
        </div>

        <div class="items-center tablet:items-start flex flex-col">
          <span
            class="text-xs uppercase font-bold tracking-wider py-1 px-3 bg-gray-300 text-evergreen rounded-full mb-2">Account
            Utente</span>
          <h1 class="text-2xl mobilel:text-4xl text-evergreen font-extrabold mb-2 tracking-tight">{{ currentUsername }}
          </h1>
        </div>

        <div class="mt-2 tablet:ml-auto">
          <button @click="handleLogoutClick"
            class="inline-flex items-center gap-2 bg-transparent border border-gray-300 py-3 px-4 rounded-xl text-sm font-bold cursor-pointer transition-all hover:bg-[#ef44440d] hover:border-red-500 hover:text-red-500"
            title="Disconnetti account" :disabled="isActionLoading">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z" />
              <path fill-rule="evenodd"
                d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z" />
            </svg>
            <span>Disconnetti</span>
          </button>
        </div>
      </header>

      <div class="grid grid-cols-[1fr] gap-8 items-start laptop:grid-cols-[340px_1fr]">
        <section class="rounded-3xl p-9 border border-gray-300 shadow-sm">
          <div>
            <h3 class="text-xl font-bold text-evergreen">Sicurezza Account</h3>
            <p class="text-sm mt-1">Aggiorna le credenziali di accesso</p>
          </div>
          <hr class="h-px bg-gray-300 border-0 my-6" />

          <form @submit.prevent="handleCambiaPassword" class="flex flex-col gap-3">
            <div class="flex flex-col gap-2">
              <label class="text-evergreen font-semibold text-base">Vecchia Password</label>
              <input v-model="oldPassword" type="password"
                class="w-full p-3 text-base border border-muted-teal rounded-lg transition bg-alabaster-grey focus:outline-0 focus:shadow-sm"
                placeholder="••••••••" required />
            </div>

            <PasswordInput v-model:password="newPassword" v-model:confirmPassword="confirmPassword" />

            <button type="submit"
              class="bg-mint-leaf text-white font-bold h-12 rounded-lg transition-all cursor-pointer hover:bg-evergreen mt-2"
              :disabled="isActionLoading">
              {{ isActionLoading ? 'Aggiornamento...' : 'Salva Nuova Password' }}
            </button>
          </form>
        </section>

        <section class="rounded-3xl p-9 border border-gray-300 shadow-sm">
          <div class="flex flex-col items-start gap-3 justify-between mobilel:items-center mobilel:flex-row">
            <div>
              <h3 class="text-lg font-bold text-evergreen">Archivio Recensioni</h3>
              <p class="text-sm mt-1">
                Clicca sul testo per visualizzare l'anteprima a schermo intero
              </p>
            </div>
            <span class="bg-alabaster-grey border border-gray-300 py-1 px-3 rounded-lg font-bold text-sm">{{
              userReviews.length }}</span>
          </div>
          <hr class="border-none h-px bg-gray-300 my-6" />

          <div v-if="userReviews.length > 0" class="flex flex-col gap-4">
            <div v-for="review in userReviews" :key="review.id"
              class="grid grid-cols-[1fr] gap-4 p-4 laptop:grid-cols-[200px_1fr_auto] laptop:gap-8 laptop:p-5 items-center rounded-2xl border border-gray-300 transition-all hover:border-mint-leaf hover:shadow-lg">
              <div class="flex items-center gap-3 overflow-hidden">
                <div
                  class="relative w-11 h-16 rounded-lg overflow-hidden cursor-pointer bg-alabaster-grey shrink-0 group"
                  @click="goToFilm(review)">
                  <img v-if="review.poster_path" :src="`${IMAGE_URL}${review.poster_path}`" :alt="review.title"
                    class="w-full h-full object-cover" />
                  <img v-else :src="PLACEHOLDER_IMAGE" :alt="review.title" class="w-full h-full object-cover" />

                  <div
                    class="absolute top-0 left-0 w-full h-full bg-green-900 text-white flex items-center justify-center opacity-0 transition-all group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"
                      viewBox="0 0 16 16">
                      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                      <path
                        d="M0 8s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                    </svg>
                  </div>
                </div>

                <div class="flex flex-col gap-1 overflow-hidden">
                  <span class="font-bold cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
                    @click="goToFilm(review)">
                    {{ review.title || 'Dettagli Film' }}
                  </span>
                  <span class="text-xs">
                    {{ formatDate(review.time) }}
                  </span>
                </div>
              </div>

              <div
                class="flex flex-col gap-2 py-2 px-3 rounded-lg cursor-pointer bg-alabaster-grey border border-gray-300 transition-all hover:border-mint-leaf"
                @click="openReadReviewPopup(review)" title="Leggi tutto">
                <div class="inline-flex items-center gap-1 text-xs font-bold py-1 px-2 rounded-sm w-fit"
                  :class="getStatusClass(review.score)">
                  <span class="tracking-wider">★ {{ review.score }}/10</span>
                </div>
                <p class="text-xs wrap-break-word break-normal overflow-hidden text-ellipsis">{{ review.content }}</p>
              </div>

              <div>
                <button @click="handleDeleteReview(review)"
                  class="inline-flex items-center gap-2 bg-transparent border border-gray-300 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:bg-[#ef44440d] hover:border-red-500 hover:text-red-500"
                  title="Elimina questa recensione">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"
                    viewBox="0 0 16 16">
                    <path
                      d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                    <path
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                  </svg>
                  <span>Elimina</span>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 px-4">
            <div class="text-4xl mb-2">✍️</div>
            <h4 class="mb-1">Ancora nessuna recensione</h4>
            <br />
            <NuxtLink to="/"
              class="bg-transparent border border-mint-leaf text-mint-leaf py-2 px-4 rounded-lg text-sm font-bold cursor-pointer transition-all hover:bg-mint-leaf hover:text-white">
              Esplora Film</NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>