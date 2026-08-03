<script setup>
import { ref, onMounted } from 'vue'
import BasePopup from '~/components/base_popup.vue'
import ReviewPopup from '~/components/review_popup.vue'

const runtimeConfig = useRuntimeConfig()
const IMAGE_URL = runtimeConfig.public.imageUrl
const GET_REVIEWS = runtimeConfig.public.getMyReviews
const DEL_REVIEW = runtimeConfig.public.deleteReview
const UPDATE_PASSWORD = runtimeConfig.public.updatePassword
const UPLOAD_AVATAR = runtimeConfig.public.addProfilePicture
const DEL_AVATAR = runtimeConfig.public.deleteProfilePicture

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const userReviews = ref([])
const currentUsername = ref(user.value?.user_metadata?.username || '')
const isFetchingReviews = ref(false)

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
  if (val < 6) return 'status-low'
  if (val < 8) return 'status-mid'
  return 'status-high'
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
  <div class="profile-wrapper">
    <BasePopup :show="isPopupOpen" :title="popupTitle" :content="popupMessage" :actions="popupActions"
      :identifier="popupId" @close="isPopupOpen = false" @action="routePopupEvent" />

    <ReviewPopup :show="isReadPopupOpen" :review="selectedReviewToRead" @close="isReadPopupOpen = false" />

    <div class="profile-container">
      <header class="profile-card main-header-card">
        <div class="avatar-column">
          <div class="avatar-wrapper" @click="triggerFileInput">
            <img v-if="userAvatarUrl" :src="userAvatarUrl" alt="Avatar utente" class="avatar-img" />
            <div v-else class="avatar-placeholder">
              {{ currentUsername?.charAt(0).toUpperCase() }}
            </div>
            <div class="avatar-hover-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                <path
                  d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" />
              </svg>
            </div>
            <input type="file" ref="fileInput" @change="handleAvatarUpload" accept="image/png, image/jpeg"
              class="hidden-input" />
          </div>

          <button v-if="userAvatarUrl" @click="handleRemoveAvatarClick" class="btn-remove-avatar"
            :disabled="isActionLoading" title="Rimuovi foto profilo">
            Rimuovi foto
          </button>
        </div>

        <div class="user-info-meta">
          <span class="badge-role">Account Utente</span>
          <h1>{{ currentUsername }}</h1>
        </div>

        <div class="header-actions-side">
          <button @click="handleLogoutClick" class="btn-logout-header" title="Disconnetti account"
            :disabled="isActionLoading">
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

      <div class="profile-grid">
        <section class="profile-card security-section">
          <div class="section-title-wrapper">
            <h3>Sicurezza Account</h3>
            <p class="card-subtitle">Aggiorna le credenziali di accesso</p>
          </div>
          <hr class="card-divider" />

          <form @submit.prevent="handleCambiaPassword" class="password-form">
            <div class="input-group">
              <label>Vecchia Password</label>
              <input v-model="oldPassword" type="password" placeholder="••••••••" required />
            </div>

            <PasswordInput v-model:password="newPassword" v-model:confirmPassword="confirmPassword" />

            <button type="submit" class="btn-submit-password" :disabled="isActionLoading">
              {{ isActionLoading ? 'Aggiornamento...' : 'Salva Nuova Password' }}
            </button>
          </form>
        </section>

        <section class="profile-card reviews-section">
          <div class="reviews-header-flex">
            <div>
              <h3>Archivio Recensioni</h3>
              <p class="card-subtitle">
                Clicca sul testo per visualizzare l'anteprima a schermo intero
              </p>
            </div>
            <span class="count-badge">{{ userReviews.length }}</span>
          </div>
          <hr class="card-divider" />

          <div v-if="isFetchingReviews" class="reviews-loader">
            <div class="spinner"></div>
          </div>

          <div v-else-if="userReviews.length > 0" class="dashboard-reviews-container">
            <div v-for="review in userReviews" :key="review.id" class="dashboard-review-row">
              <div class="movie-details-side">
                <div class="movie-thumb-wrapper" @click="goToFilm(review)">
                  <img v-if="review.poster_path" :src="`${IMAGE_URL}${review.poster_path}`" :alt="review.title"
                    class="movie-thumb-img" />
                  <div v-else class="movie-thumb-placeholder">🎬</div>

                  <div class="movie-thumb-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"
                      viewBox="0 0 16 16">
                      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                      <path
                        d="M0 8s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                    </svg>
                  </div>
                </div>

                <div class="movie-meta-titles">
                  <span class="movie-link-title" @click="goToFilm(review)">
                    {{ review.title || 'Dettagli Film' }}
                  </span>
                  <span class="meta-date">
                    {{ formatDate(review.time) }}
                  </span>
                </div>
              </div>

              <div class="review-body-side review-body-clickable" @click="openReadReviewPopup(review)"
                title="Leggi tutto">
                <div class="mini-score-badge" :class="getStatusClass(review.score)">
                  <span class="star-icon">★</span>
                  <span class="score-value">{{ review.score }}</span>
                  <span class="score-max">/10</span>
                </div>
                <p class="review-paragraph-text">{{ review.content }}</p>
              </div>

              <div class="review-action-side">
                <button @click="handleDeleteReview(review)" class="btn-delete-review-minimal"
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

          <div v-else class="profile-reviews-empty">
            <div class="empty-bubble">✍️</div>
            <h4>Ancora nessuna recensione</h4>
            <br />
            <NuxtLink to="/" class="btn-redirect-home">Esplora Film</NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-wrapper {
  min-height: 100vh;
  padding: 4rem 2rem;
  background-color: var(--alabaster-grey);
  color: var(--text-main);
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

.profile-container {
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card {
  background-color: var(--bg-card);
  border-radius: 20px;
  padding: 2.25rem;
  border: 1px solid rgba(162, 178, 170, 0.25);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
}

.card-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.card-divider {
  border: 0;
  height: 1px;
  background: rgba(162, 178, 170, 0.15);
  margin: 1.5rem 0;
}

.main-header-card {
  display: flex;
  align-items: center;
  gap: 3rem;
  position: relative;
  overflow: hidden;
  border-left: 5px solid var(--evergreen);
}

.header-actions-side {
  margin-left: auto;
}

.avatar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(2, 39, 4, 0.12);
  border: 4px solid var(--bg-card);
  background-color: var(--evergreen);
  transition: var(--transition-standard);
}

.avatar-wrapper:hover {
  transform: scale(1.03);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-card);
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--evergreen), #000);
}

.avatar-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(2, 39, 4, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-card);
  opacity: 0;
  transition: var(--transition-standard);
}

.avatar-wrapper:hover .avatar-hover-overlay {
  opacity: 1;
}

.hidden-input {
  display: none;
}

.btn-remove-avatar {
  background: transparent;
  color: var(--status-low-bg);
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 8px;
  transition: var(--transition-standard);
}

.btn-remove-avatar:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.user-info-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.badge-role {
  font-size: 0.72rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  background: rgba(2, 39, 4, 0.08);
  color: var(--evergreen);
  border-radius: 30px;
  margin-bottom: 0.5rem;
}

.user-info-meta h1 {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--evergreen);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.03em;
}

.btn-logout-header {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid rgba(162, 178, 170, 0.4);
  color: var(--text-muted);
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-standard);
}

.btn-logout-header:hover {
  background-color: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--status-low-bg);
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .profile-grid {
    grid-template-columns: 340px 1fr;
  }
}

.security-section h3,
.reviews-section h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--evergreen);
  margin: 0;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.03em;
}

.input-group input {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(162, 178, 170, 0.4);
  background-color: var(--bg-card);
  font-size: 0.9rem;
  outline: none;
  color: var(--text-main);
  transition: var(--transition-standard);
}

.input-group input:focus {
  border-color: var(--mint-leaf);
  box-shadow: 0 0 0 3.5px rgba(88, 179, 104, 0.12);
}

.btn-submit-password {
  margin-top: 0.5rem;
  background-color: var(--mint-leaf);
  color: var(--bg-card);
  border: none;
  padding: 0.85rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition-standard);
}

.btn-submit-password:hover:not(:disabled) {
  background-color: var(--evergreen);
}

.reviews-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.count-badge {
  background-color: var(--alabaster-grey);
  border: 1px solid rgba(162, 178, 170, 0.3);
  color: var(--text-main);
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.8rem;
}

.dashboard-reviews-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-review-row {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 2rem;
  align-items: center;
  padding: 1.25rem;
  border-radius: 14px;
  border: 1px solid rgba(162, 178, 170, 0.25);
  background-color: var(--bg-card);
  transition: var(--transition-standard);
}

.dashboard-review-row:hover {
  border-color: var(--mint-leaf);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01);
}

.movie-details-side {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.movie-thumb-wrapper {
  position: relative;
  width: 44px;
  height: 62px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  background-color: var(--alabaster-grey);
  flex-shrink: 0;
}

.movie-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-thumb-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(2, 39, 4, 0.9);
  color: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition-standard);
}

.movie-thumb-wrapper:hover .movie-thumb-overlay {
  opacity: 1;
}

.movie-meta-titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.movie-link-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-main);
  cursor: pointer;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-link-title:hover {
  color: var(--mint-leaf);
}

.meta-date {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.review-body-side {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.review-body-clickable {
  cursor: pointer;
  background-color: var(--alabaster-grey);
  border: 1px solid rgba(162, 178, 170, 0.2);
  transition: var(--transition-standard);
}

.review-body-clickable:hover {
  background-color: var(--bg-card);
  border-color: var(--mint-leaf);
}

.mini-score-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--bg-card);
  width: fit-content;
}

.status-low {
  background-color: var(--status-low-bg);
}

.status-mid {
  background-color: var(--status-mid-bg);
}

.status-high {
  background-color: var(--status-high-bg);
}

.review-paragraph-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0;
  overflow-wrap: break-word;
  word-break: break-word;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-delete-review-minimal {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid rgba(162, 178, 170, 0.4);
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-standard);
}

.btn-delete-review-minimal:hover {
  background-color: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--status-low-bg);
}

.profile-reviews-empty {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-bubble {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.profile-reviews-empty h4 {
  margin: 0 0 4px 0;
  font-size: 1.05rem;
  color: var(--text-main);
}

.btn-redirect-home {
  background: transparent;
  border: 1px solid var(--mint-leaf);
  color: var(--mint-leaf);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-standard);
}

.btn-redirect-home:hover {
  background-color: var(--mint-leaf);
  color: var(--bg-card);
}

.popup-premium-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.modal-icon-success {
  color: var(--mint-leaf);
  display: flex;
  justify-content: center;
  align-items: center;
}

.check-icon {
  width: 56px;
  height: 56px;
}

.popup-custom-text {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.5;
  text-align: center;
  margin: 0;
}

.btn-popup-close-premium {
  width: 100%;
  padding: 0.85rem;
  border-radius: 12px;
  border: none;
  font-weight: 750;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition-standard);
}

.btn-popup-close-premium.success {
  background-color: var(--mint-leaf);
  color: var(--bg-card);
}

.btn-popup-close-premium.success:hover {
  background-color: var(--evergreen);
}

.btn-popup-close-premium.error {
  background-color: var(--status-low-bg);
  color: var(--bg-card);
}

.btn-popup-close-premium.info {
  background-color: var(--alabaster-grey);
  color: var(--text-main);
}

.btn-confirm-annulla {
  background-color: var(--alabaster-grey);
  color: var(--text-main);
  border: 1px solid rgba(162, 178, 170, 0.4);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-standard);
}

.btn-confirm-procedi {
  background-color: var(--status-low-bg);
  color: var(--bg-card);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-standard);
}

.reviews-loader {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(162, 178, 170, 0.2);
  border-top-color: var(--mint-leaf);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .dashboard-review-row {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .main-header-card {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
    padding: 2rem 1.5rem;
  }

  .header-actions-side {
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .user-info-meta {
    align-items: center;
  }
}

@media (max-width: 425px) {
  .profile-wrapper {
    padding: 2.5rem 1rem;
  }

  .profile-card {
    padding: 1.5rem;
  }

  .main-header-card {
    padding: 1.5rem;
  }

  .user-info-meta h1 {
    font-size: 1.6rem;
  }

  .reviews-header-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

@media (max-width: 321px) {
  .profile-wrapper {
    padding: 2rem 0.75rem;
  }

  .profile-card {
    padding: 1.2rem;
    max-width: 100%;
  }

  .avatar-wrapper {
    width: 80px;
    height: 80px;
  }
}
</style>
