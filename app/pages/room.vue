<template>
  <div class="flex min-w-screen min-h-screen my-0 dark:bg-dark-alabaster-grey">
    <div
      class="m-4 rounded-xl mobilel:max-w-full mobilel:my-8 mobilel:mx-4 h-[70vh] flex laptop:max-w-313 laptop:my-8 laptop:mx-auto laptop:h-[75vh] laptop:rounded-2xl border border-gray-300 dark:border-dark-muted-teal shadow-sm overflow-hidden relative dark:bg-dark-alabaster-grey w-full">
      <BasePopup :show="isPopupOpen" title="Errore" :content="popupMessage" @close="isPopupOpen = false"
        @action="isPopupOpen = false" />
      <div
        class="border-r-0 flex flex-1 flex-col h-full tablet:border-r tablet:border-r-gray-300 dark:tablet:border-r-dark-muted-teal">
        <header
          class="p-4 mobilel:py-5 mobilel:px-6 border-b border-b-gray-300 dark:border-dark-muted-teal flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-extrabold uppercase tracking-wide dark:text-white">Stanza: <span
                class="text-mint-leaf dark:text-dark-mint-leaf" id="title">chat</span></h1>
            <p class="mt-1 text-sm dark:text-gray-300">Goditi il film e chatta con la stanza</p>
          </div>
          <NuxtLink to="/"
            class="bg-red-500 text-white py-3 px-5 rounded-2xl cursor-pointer text-sm font-semibold shadow-sm transition-all hover:brightness-110 hover:shadow-lg">
            Esci dalla Stanza</NuxtLink>
        </header>

        <div class="p-4 mobilel:p-6 flex flex-1 overflow-y-auto flex-col transition-all" ref="messagesAreaRef">

          <div v-if="messages.length === 0" class="m-auto text-center font-medium">
            <p>Ancora nessun messaggio. Inizia la conversazione!</p>
          </div>

          <div v-else class="flex flex-col gap-5">
            <div v-for="(msg, index) in messages" :key="index"
              class="max-w-full mobilel:max-w-[75%] py-4 px-5 rounded-2xl border border-gray-300 dark:border-dark-muted-teal shadow-sm relative transition-all"
              :class="{
                'is-spoiler': msg.spoiler == 1 && !msg.revealed,
                'self-end rounded-br-xs bg-mint-leaf/30 dark:bg-dark-mint-leaf/30': msg.username === currentUsername,
                'self-start rounded-bl-xs': msg.username !== currentUsername
              }">
              <div class="flex items-center gap-2 mb-2 text-xs">
                <span class="font-bold text-evergreen dark:text-dark-evergreen">
                  {{ msg.username == currentUsername ? 'Tu' : msg.username }}
                </span>
                <span class="text-xs dark:text-gray-300">{{ formatTime(msg.timestamp) }}</span>
              </div>

              <p v-if="!msg.spoiler" class="break-normal dark:text-gray-300">
                {{ msg.message }}
              </p>

              <div v-else class="relative">
                <p class="break-normal dark:text-gray-300"
                  :class="{ 'blur-sm select-none pointer-events-none opacity-80': !msg.revealed }">
                  {{ msg.message }}
                </p>
                <button v-if="!msg.revealed" @click="msg.revealed = true"
                  class="absolute top-[50%] left-[50%] translate-[-50%] bg-black/60 backdrop-blur-sm text-white border border-white/20 py-2 px-3 rounded-3xl text-xs font-semibold cursor-pointer whitespace-nowrap shadow-sm">
                  ⚠️ Spoiler - Clicca per rivelare
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer class="p-4 mobilel:py-5 mobilel:px-6 border-t border-gray-300 dark:border-dark-muted-teal">
          <form @submit.prevent="sendMessage" class="flex flex-col gap-4">
            <input v-model="newMessage" type="text" placeholder="Scrivi un messaggio (max 500 caratteri)..."
              maxlength="500"
              class="border border-gray-300 dark:border-dark-muted-teal py-4 px-5 rounded-2xl outline-none shadow-sm transition-all focus:border-mint-leaf dark:focus:border-dark-mint-leaf dark:text-white focus:shadow-lg" />

            <div
              class="flex flex-col items-stretch gap-3 mobilel:flex-row justify-between mobilel:items-center tablet:justify-between mobilel:py-0 mobilel:px-2">
              <div class="flex justify-between mobilel:justify-normal items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer font-medium">
                  <input v-model="sendAsSpoiler" type="checkbox"
                    class="accent-mint-leaf dark:accent-dark-mint-leaf cursor-pointer w-4 h-4" />
                  <span class="dark:text-gray-300">Spoiler</span>
                </label>

                <button type="button" @click="isSidebarOpen = true"
                  class="flex tablet:hidden border border-gray-300 dark:border-dark-muted-teal py-2 px-4 rounded-2xl cursor-pointer font-semibold items-center gap-2 transition-all"
                  title="Mostra spettatori">
                  👥 <span
                    class="bg-mint-leaf dark:bg-dark-mint-leaf text-white dark:text-black text-xs py-px px-1 rounded-lg font-semibold">{{
                      Object.keys(activeUsers).length }}</span>
                </button>
              </div>

              <button type="submit"
                class="bg-mint-leaf dark:bg-dark-mint-leaf text-white dark:text-black py-2 px-7 rounded-2xl font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                :disabled="!newMessage.trim()">
                Invia
              </button>
            </div>
          </form>
        </footer>
      </div>

      <div v-if="isSidebarOpen" @click="isSidebarOpen = false"
        class="fixed top-0 h-screen left-0 w-screen bg-black/60 backdrop-blur-md z-1">
      </div>

      <aside
        class="fixed tablet:relative top-16 tablet:top-0 right-0 bottom-0 w-screen h-screen z-2 tablet:w-65 bg-white dark:bg-dark-alabaster-grey p-6 transition-all tablet:flex tablet:flex-col"
        :class="{ 'hidden': !isSidebarOpen, 'flex flex-col': isSidebarOpen }">
        <div class="flex justify-between items-center mb-5 border-b border-gray-300 dark:border-dark-muted-teal pb-3">
          <h3 class="font-extrabold uppercase tracking-wide dark:text-white">Spettatori Attivi</h3>
          <button @click="isSidebarOpen = false"
            class="block tablet:hidden bg-transparent text-lg cursor-pointer p-1 dark:text-dark-muted-teal">✕</button>
        </div>

        <div class="flex flex-1 overflow-y-auto flex-col gap-2">
          <div v-for="(joinedAt, username) in activeUsers" :key="username"
            class="flex items-center gap-3 py-2 px-4 rounded-xl">
            <div class="flex flex-col">
              <span class="font-bold dark:text-gray-200">
                {{ username == currentUsername ? 'Tu' : username }}
              </span>
              <span class="text-xs dark:text-gray-300">Entrato alle {{ formatTime(joinedAt) }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import BasePopup from '~/components/base_popup.vue'

const route = useRoute()
const movieId = ref(route.query.movieId || null)

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const currentUsername = ref(user.value?.user_metadata?.username)
const messages = ref([])
const activeUsers = ref({})
const newMessage = ref('')
const sendAsSpoiler = ref(false)
const messagesAreaRef = ref(null)
const isSidebarOpen = ref(false)

const isPopupOpen = ref(false)
const popupMessage = ref('')

const cliccato = () => {
  isSidebarOpen.value = false
  console.log('cliccato')
}

const messagesChannel = supabase.channel(`${movieId.value}:messages`, {
  config: {
    broadcast: {
      self: true,
    },
  },
})

const presenceChannel = supabase.channel(`${movieId.value}:presence`, {
  config: {
    presence: {
      key: currentUsername.value || user.value?.sub || 'guest',
    },
  },
})

function showPopup(message) {
  popupMessage.value = message
  isPopupOpen.value = true
}

const syncActiveUsersFromPresence = () => {
  const presenceState = presenceChannel.presenceState()

  activeUsers.value = Object.fromEntries(
    Object.entries(presenceState).map(([key, presences]) => [
      key,
      presences?.[0]?.joined_at ?? 0,
    ])
  )
}

const subscribeToChannel = () => {
  messagesChannel
    .on('broadcast', { event: '*' }, (payload) => {
      if (payload.event === 'new_message') {
        messages.value.push(payload.payload)
        scrollToBottom()
      }
    })
    .subscribe()

  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      syncActiveUsersFromPresence()
    })
    .subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return

      await presenceChannel.track({
        joined_at: Math.floor(Date.now()),
      })
      syncActiveUsersFromPresence()
    })
}

const unsubscribeFromChannel = async () => {
  await supabase.removeChannel(messagesChannel)
  await supabase.removeChannel(presenceChannel)
}

const sendMessageToChannel = async (message) => {
  try {
    await messagesChannel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: message,
    })
  } catch (error) {
    console.error(error)
    showPopup('Errore durante l\'invio del messaggio. Riprova più tardi.')
  }
}

const sendMessage = () => {
  const textToSend = newMessage.value.trim()

  sendMessageToChannel({
    username: currentUsername.value,
    message: textToSend,
    timestamp: Math.floor(Date.now()),
    spoiler: sendAsSpoiler.value ? 1 : 0,
  })
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesAreaRef.value) {
    messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  return timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
}

const enterRoom = async () => {
  try {
    const { error } = await supabase
      .from('rooms')
      .insert([
        {
          movie: movieId.value,
          user: user.value.sub,
        }
      ])

    if (error) throw error
  } catch (err) {
    console.error(err)
    showPopup('Errore durante l\'accesso alla stanza. Riprova più tardi.')
  }
}

const deleteRoom = async () => {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('movie', movieId.value)
      .eq('user', user.value.sub)

    if (error) throw error
  } catch (err) {
    console.error(err)
    showPopup('Errore durante l\'uscita dalla stanza. Riprova più tardi.')
  }
}

onMounted(async () => {
  await enterRoom()
  subscribeToChannel()
})
onUnmounted(async () => {
  await unsubscribeFromChannel()
  await deleteRoom()
})
</script>