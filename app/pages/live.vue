<template>
  <div class="p-4 mobilel:p-5 tablet:p-6 laptop:p-8 max-w-313 my-0 mx-auto min-h-[80vh]">
    <BasePopup :show="isPopupOpen" title="Errore" :content="popupMessage" @close="isPopupOpen = false"
      @action="isPopupOpen = false" />

    <header class="mb-10">
      <h1 class="text-2xl mobilel:text-3xl tablet:text-4xl font-extrabold text-evergreen mb-2">Live <span
          class="text-mint-leaf">Rooms</span></h1>
      <p>Scopri cosa stanno guardando gli utenti in live.</p>
    </header>

    <div v-if="isLoading && rooms.length === 0"
      class="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div class="w-10 h-10 border-4 border-gray-300 border-t-mint-leaf rounded-full animate-spin mb-6"></div>
      <p>Caricando stanze attive...</p>
    </div>

    <div v-else-if="rooms.length === 0" class="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div class="text-6xl mb-4">🎬</div>
      <h3 class="mb-2 text-evergreen">Nessuna stanza attiva</h3>
      <p>Nessuno sta guardando film per adesso!!</p>
    </div>

    <div v-else
      class="grid grid-cols-[1fr] mobilem:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 mobilel:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] mobilel:gap-5 tablet:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] tablet:gap-6 laptop:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] laptop:gap-8">
      <div v-for="room in rooms" :key="room.idFilm"
        class="rounded-2xl overflow-hidden shadow-sm border border-gray-300 cursor-pointer flex flex-col transition-all hover:-translate-y-1.5 hover:shadow-lg group"
        @click="joinRoom(room)">
        <div class="relative w-full pt-[140%] bg-alabaster-grey">
          <img v-if="room.poster_path" :src="`${IMAGE_URL}${room.poster_path}`" :alt="room.title"
            class="absolute top-0 left-0 w-full h-full object-cover" />
          <img v-else :src="PLACEHOLDER_IMAGE" :alt="movie.title"
            class="absolute top-0 left-0 w-full h-full object-cover" />
        </div>

        <div class="p-4 mobilel:p-6 flex flex-col grow">
          <h3
            class="text-base mobilel:text-xl font-bold mb-2 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-mint-leaf"
            :title="room.title">{{ room.title }}</h3>
          <div class="flex flex-col gap-2 mobiles:flex-row mobiles:gap-3 text-sm mb-4">
            <span v-if="room.vote_average" class=" bg-amber-200 text-amber-600 py-1 px-2 rounded-full font-semibold">★
              {{ Number(room.vote_average).toFixed(1) }}</span>
            <span v-if="room.release_date" class="py-1">{{
              room.release_date.substring(0, 4)
              }}</span>
          </div>

          <div class="mt-auto border-t border-gray-300 pt-3">
            <span class="text-sm text-evergreen font-semibold"> 👥 {{ room.activeUsers || 1 }} watching </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BasePopup from '~/components/base_popup.vue'

const runtimeConfig = useRuntimeConfig()
const IMAGE_URL = runtimeConfig.public.imageUrl
const PLACEHOLDER_IMAGE = runtimeConfig.public.placeholderImage

const rooms = ref([])
const isLoading = ref(true)

const isPopupOpen = ref(false)
const popupMessage = ref('')

const supabase = useSupabaseClient()

const fetchLiveRooms = async () => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*, rooms!inner(user)')

    if (error) throw error

    const activeRooms = data.map((movie) => {
      return { ...movie, idFilm: movie.id, activeUsers: movie.rooms.length }
    })

    rooms.value = activeRooms || []
  } catch (err) {
    console.error(err)
    showPopup('Errore nel caricamento delle stanze live. Riprova più tardi.')
  } finally {
    isLoading.value = false
  }
}

const joinRoom = async (room) => {
  if (!room || !room.idFilm) return
  await navigateTo({ path: '/room', query: { movieId: room.idFilm } })
}

const parsePayload = async (payload) => {
  const { eventType, new: newRoom, old: oldRoom } = payload

  try {
    if (eventType === 'INSERT' && newRoom) {
      const existingRoomIndex = rooms.value.findIndex((room) => room.idFilm === newRoom.idFilm)
      if (existingRoomIndex === -1) {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .eq('id', newRoom.movie)

        if (error) throw error

        if (data && data.length > 0) {
          rooms.value.push({
            ...data[0],
            activeUsers: 1,
          })
        }
      } else {
        rooms.value[existingRoomIndex].activeUsers++
      }
    } else if (eventType === 'DELETE' && oldRoom) {
      const roomIndex = rooms.value.findIndex((room) => room.idFilm === oldRoom.idFilm)
      if (roomIndex === -1) return
      rooms.value[roomIndex].activeUsers--
      if (rooms.value[roomIndex].activeUsers <= 0) {
        rooms.value.splice(roomIndex, 1)
      }
    }
  } catch (err) {
    console.error(err)
    showPopup('Errore durante l\'elaborazione degli aggiornamenti in tempo reale. Riprova più tardi.')
  }
}

const channel = supabase
  .channel('schema-db-changes')
  .on('postgres_changes', { event: 'insert', schema: 'public', table: 'rooms' },
    (payload) => {
      parsePayload(payload)
    })
  .on('postgres_changes', { event: 'delete', schema: 'public', table: 'rooms' },
    (payload) => {
      parsePayload(payload)
    })

function showPopup(message) {
  popupMessage.value = message
  isPopupOpen.value = true
}

onMounted(() => {
  fetchLiveRooms()
  channel.subscribe((status, error) => {
    if (error) {
      console.error(error)
      showPopup('Impossibile connettersi al server per ricevere aggiornamenti in tempo reale. Riprova più tardi.')
    }
  })
})

onUnmounted(() => {
  if (channel) {
    supabase.removeChannel(channel)
  }
})
</script>

<style scoped>
.live-rooms-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 80vh;
}

.live-header {
  margin-bottom: 2.5rem;
}

.live-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--evergreen);
  margin: 0 0 0.5rem 0;
}

.accent-text {
  color: var(--mint-leaf);
}

.live-subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: 1rem;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
}

.room-card {
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(162, 178, 170, 0.15);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition:
    transform var(--transition-standard),
    box-shadow var(--transition-standard);
}

.room-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px rgba(88, 179, 104, 0.1);
}

.poster-wrapper {
  position: relative;
  width: 100%;
  padding-top: 140%;
  background: var(--alabaster-grey);
}

.movie-poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  background: var(--alabaster-grey);
}

.live-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #ef4444;
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.room-details {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.movie-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.4rem 0;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-card:hover .movie-title {
  color: var(--mint-leaf);
}

.movie-meta {
  margin-bottom: 1rem;
  font-size: 0.85rem;
  display: flex;
  gap: 0.75rem;
}

.movie-score {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
}

.movie-year {
  color: var(--text-muted);
  padding: 0.2rem 0;
}

.room-stats {
  margin-top: auto;
  border-top: 1px solid rgba(162, 178, 170, 0.1);
  padding-top: 0.75rem;
}

.spectators-count {
  font-size: 0.85rem;
  color: var(--evergreen);
  font-weight: 600;
}

.message-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(162, 178, 170, 0.2);
  border-top-color: var(--mint-leaf);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-button {
  background: var(--evergreen);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 1rem;
  cursor: pointer;
  transition: var(--transition-standard);
}

.retry-button:hover {
  background: var(--mint-leaf);
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--evergreen);
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

@media (max-width: 1024px) {
  .live-rooms-container {
    padding: 1.5rem;
  }

  .rooms-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .live-rooms-container {
    padding: 1.25rem;
  }

  .live-title {
    font-size: 1.8rem;
  }

  .rooms-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 425px) {
  .live-rooms-container {
    padding: 1rem;
  }

  .rooms-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .room-details {
    padding: 1rem;
  }

  .movie-title {
    font-size: 1rem;
  }
}

@media (max-width: 375px) {
  .rooms-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 320px) {
  .live-title {
    font-size: 1.6rem;
  }

  .movie-meta {
    flex-direction: column;
    gap: 0.4rem;
  }
}
</style>
