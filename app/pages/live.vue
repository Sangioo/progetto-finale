<template>
  <div class="dark:bg-dark-alabaster-grey min-h-screen">
    <div class="p-4 mobilel:p-5 tablet:p-6 laptop:p-8 max-w-313 my-0 mx-auto">
      <BasePopup :show="isPopupOpen" title="Errore" :content="popupMessage" @close="isPopupOpen = false"
        @action="isPopupOpen = false" />

      <header class="mb-10">
        <h1
          class="text-2xl mobilel:text-3xl tablet:text-4xl font-extrabold text-evergreen dark:text-dark-evergreen mb-2">
          Live <span class="text-mint-leaf dark:text-dark-mint-leaf">Rooms</span></h1>
        <p class="dark:text-gray-300">Scopri cosa stanno guardando gli utenti in live.</p>
      </header>

      <div v-if="isLoading && rooms.length === 0"
        class="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div
          class="w-10 h-10 border-4 border-gray-300 dark:border-dark-muted-teal border-t-mint-leaf dark:border-t-dark-mint-leaf rounded-full animate-spin mb-6">
        </div>
        <p class="dark:text-gray-300">Caricando stanze attive...</p>
      </div>

      <div v-else-if="rooms.length === 0" class="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div class="text-6xl mb-4">🎬</div>
        <h3 class="mb-2 text-evergreen dark:text-dark-evergreen">Nessuna stanza attiva</h3>
        <p class="dark:text-gray-300">Nessuno sta guardando film per adesso!!</p>
      </div>

      <div v-else
        class="grid grid-cols-[1fr] mobilem:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 mobilel:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] mobilel:gap-5 tablet:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] tablet:gap-6 laptop:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] laptop:gap-8">
        <div v-for="room in rooms" :key="room.idFilm"
          class="rounded-2xl overflow-hidden shadow-sm border border-gray-300 dark:border-dark-muted-teal cursor-pointer flex flex-col transition-all hover:-translate-y-1.5 hover:shadow-lg group"
          @click="joinRoom(room)">
          <div class="relative w-full pt-[140%] bg-alabaster-grey dark:bg-dark-alabaster-grey">
            <img v-if="room.poster_path" :src="`${IMAGE_URL}${room.poster_path}`" :alt="room.title"
              class="absolute top-0 left-0 w-full h-full object-cover" />
            <img v-else :src="PLACEHOLDER_IMAGE" :alt="movie.title"
              class="absolute top-0 left-0 w-full h-full object-cover" />
          </div>

          <div class="p-4 mobilel:p-6 flex flex-col grow">
            <h3
              class="text-base mobilel:text-xl font-bold mb-2 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-mint-leaf dark:group-hover:text-dark-mint-leaf dark:text-white"
              :title="room.title">{{ room.title }}</h3>
            <div class="flex flex-col gap-2 mobiles:flex-row mobiles:gap-3 text-sm mb-4">
              <span v-if="room.vote_average"
                class=" bg-amber-200 dark:bg-amber-300 text-amber-600 dark:text-amber-700 py-1 px-2 rounded-full font-semibold">★
                {{ Number(room.vote_average).toFixed(1) }}</span>
              <span v-if="room.release_date" class="py-1 dark:text-gray-300">{{
                room.release_date.substring(0, 4)
                }}</span>
            </div>

            <div class="mt-auto border-t border-gray-300 dark:border-dark-muted-teal pt-3">
              <span class="text-sm text-evergreen dark:text-dark-evergreen font-semibold"> 👥 {{
                room.activeUsers || 1
                }} watching </span>
            </div>
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