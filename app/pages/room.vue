<template>
  <div class="room-container">
    <div class="chat-section">
      <header class="chat-header">
        <div class="header-info">
          <h1 class="room-title">Stanza: <span class="accent-text" id="title">Chat</span></h1>
          <p class="room-subtitle">Goditi il film e chatta con la stanza</p>
        </div>
        <button @click="leaveRoom" class="leave-button">Esci dalla Stanza</button>
      </header>

      <div class="messages-area" ref="messagesAreaRef">
        <div v-if="isLoading && messages.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>Caricamento della conversazione...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
        </div>

        <div v-else-if="messages.length === 0" class="empty-state">
          <p>Ancora nessun messaggio. Inizia la conversazione!</p>
        </div>

        <div v-else class="messages-list">
          <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="{
            'is-spoiler': msg.spoiler == 1 && !msg.revealed,
            'is-me': msg.username == currentUsername,
          }">
            <div class="message-meta">
              <span class="message-username">
                {{ msg.username == currentUsername ? 'Tu' : msg.username }}
              </span>
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>

            <p v-if="!msg.spoiler" class="message-text">
              {{ msg.message }}
            </p>

            <div v-else class="spoiler-wrapper">
              <p class="message-text" :class="{ 'blur-text': !msg.revealed }">
                {{ msg.message }}
              </p>
              <button v-if="!msg.revealed" @click="msg.revealed = true" class="spoiler-badge">
                ⚠️ Spoiler - Clicca per rivelare
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer class="input-area">
        <form @submit.prevent="sendMessage" class="message-form">
          <input v-model="newMessage" type="text" placeholder="Scrivi un messaggio (max 500 caratteri)..."
            maxlength="500" class="message-input" :disabled="isSending" />

          <div class="form-actions">
            <div class="left-actions">
              <label class="spoiler-checkbox-label">
                <input v-model="sendAsSpoiler" type="checkbox" class="spoiler-checkbox" />
                <span class="checkbox-text">Spoiler</span>
              </label>

              <button type="button" @click="isSidebarOpen = true" class="toggle-users-button" title="Mostra spettatori">
                👥 <span class="badge-count">{{ Object.keys(activeUsers).length }}</span>
              </button>
            </div>

            <button type="submit" class="send-button" :disabled="isSending || !newMessage.trim()">
              {{ isSending ? '...' : 'Invia' }}
            </button>
          </div>
        </form>
      </footer>
    </div>

    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="sidebar-backdrop"></div>

    <aside class="users-sidebar" :class="{ 'is-open': isSidebarOpen }">
      <div class="sidebar-header">
        <h3 class="sidebar-title">Spettatori Attivi</h3>
        <button @click="isSidebarOpen = false" class="close-sidebar-button">✕</button>
      </div>

      <div class="users-list">
        <div v-for="(joinedAt, username) in activeUsers" :key="username" class="user-item">
          <div class="user-status-dot"></div>
          <div class="user-info">
            <span class="user-name">
              {{ username == currentUsername ? 'Tu' : username }}
            </span>
            <span class="user-joined">Entrato alle {{ formatTime(joinedAt) }}</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const movieId = ref(route.query.movieId || null)

const user = useSupabaseUser()

const currentUsername = ref(user.value?.user_metadata?.username)
const messages = ref([])
const activeUsers = ref({})
const newMessage = ref('')
const sendAsSpoiler = ref(false)
const isLoading = ref(true)
const isSending = ref(false)
const error = ref(null)
const messagesAreaRef = ref(null)
const isSidebarOpen = ref(false)

const supabase = useSupabaseClient()

const channel = supabase.channel(`room:${movieId.value}:messages`, {
  config: {
    broadcast: {
      self: true,
    },
  },
})

const subscribeToChannel = () => {
  channel
    .on('broadcast', { event: '*' }, (payload) => {
      if (payload.event === 'new_message') {
        messages.value.push(payload.payload)
        scrollToBottom()
      } else if (payload.event === 'user_joined' || payload.event === 'user_left') {
        activeUsers.value = payload.payload.activeUsers
      }
    })
    .subscribe((status) => {
      console.log('Channel status:', status)
    })
}

const unsubscribeFromChannel = () => {
  channel.unsubscribe()
}

const sendMessageToChannel = async (message) => {
  try {
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: message,
    })
  } catch (error) {
    console.error('Errore durante l\'invio del messaggio al canale:', error)
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

const leaveRoom = async () => {
  unsubscribeFromChannel()
  await navigateTo('/')
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesAreaRef.value) {
    messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const enterRoom = async () => {
  const { error } = await supabase
    .from('rooms')
    .insert([
      {
        movie: movieId.value,
        user: user.value.sub,
      }
    ])
  if (error) {
    console.error('Errore durante l\'unione alla stanza:', error)
  } else {
    console.log('Unito con successo alla stanza', movieId.value)
  }
}

const deleteRoom = async () => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('movie', movieId.value)
    .eq('user', user.value.sub)
  if (error) {
    console.error('Errore durante l\'uscita dalla stanza:', error)
  } else {
    console.log('Uscito con successo dalla stanza', movieId.value)
  }
}

onMounted(async () => {
  await enterRoom()
  subscribeToChannel()
})
onUnmounted(async () => {
  unsubscribeFromChannel()
  await deleteRoom()
})
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--muted-teal);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--mint-leaf);
}

.room-container {
  display: flex;
  max-width: 1200px;
  margin: 2rem auto;
  height: 75vh;
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid rgba(162, 178, 170, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: var(--text-main);
  transition: var(--transition-standard);
  position: relative;
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgba(162, 178, 170, 0.2);
}

.chat-header {
  padding: 1.25rem 1.5rem;
  background: var(--bg-card);
  border-bottom: 1px solid rgba(162, 178, 170, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  z-index: 10;
}

.room-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.accent-text {
  color: var(--mint-leaf);
}

.room-subtitle {
  margin: 0.2rem 0 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.leave-button {
  background: var(--status-low-bg);
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.1s ease,
    filter 0.2s ease;
}

.leave-button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.messages-area {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: var(--bg-app);
  display: flex;
  flex-direction: column;
  transition: var(--transition-standard);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.message-item {
  background: var(--bg-card);
  padding: 0.85rem 1.25rem;
  border-radius: 16px 16px 16px 4px;
  border: 1px solid rgba(162, 178, 170, 0.1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  max-width: 75%;
  align-self: flex-start;
  position: relative;
  transition: var(--transition-standard);
}

.message-item.is-me {
  align-self: flex-end;
  background: var(--my-message);
  border-radius: 16px 16px 4px 16px;
  border-color: rgba(88, 179, 104, 0.2);
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.4rem;
  font-size: 0.75rem;
}

.message-username {
  font-weight: 700;
  color: var(--mint-leaf);
}

.message-time {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.message-text {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  word-break: break-word;
  color: var(--text-main);
}

.spoiler-wrapper {
  position: relative;
}

.blur-text {
  filter: blur(6px);
  user-select: none;
  pointer-events: none;
  opacity: 0.8;
}

.spoiler-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.input-area {
  padding: 1.25rem 1.5rem;
  background: var(--bg-card);
  border-top: 1px solid rgba(162, 178, 170, 0.2);
  z-index: 10;
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.message-input {
  background: var(--bg-app);
  color: var(--text-main);
  border: 1px solid rgba(162, 178, 170, 0.4);
  padding: 0.85rem 1.25rem;
  border-radius: 24px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.message-input:focus {
  border-color: var(--mint-leaf);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.02),
    0 0 0 3px rgba(88, 179, 104, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.spoiler-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.spoiler-checkbox {
  accent-color: var(--mint-leaf);
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.toggle-users-button {
  display: none;
  background: var(--bg-app);
  border: 1px solid rgba(162, 178, 170, 0.3);
  color: var(--text-main);
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.badge-count {
  background: var(--mint-leaf);
  color: var(--bg-card);
  font-size: 0.7rem;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 700;
}

.send-button {
  background: var(--mint-leaf);
  color: var(--bg-card);
  border: none;
  padding: 0.6rem 1.8rem;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(88, 179, 104, 0.3);
  transition: all 0.2s ease;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.users-sidebar {
  width: 260px;
  background: var(--bg-card);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: transform 0.3s ease-in-out;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid rgba(162, 178, 170, 0.1);
  padding-bottom: 0.75rem;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-main);
}

.close-sidebar-button {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
}

.users-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.user-item:hover {
  background: var(--bg-app);
}

.user-status-dot {
  width: 10px;
  height: 10px;
  background: var(--accent-seen);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-seen);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
}

.user-joined {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 90;
}

.loading-state,
.empty-state,
.error-state {
  margin: auto;
  text-align: center;
  color: var(--text-muted);
  font-weight: 500;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(162, 178, 170, 0.2);
  border-top: 3px solid var(--mint-leaf);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 1025px) {
  .room-container {
    max-width: 100%;
    margin: 2rem 1rem;
    height: 70vh;
  }
}

@media (max-width: 768px) {
  .chat-section {
    border-right: none;
  }

  .toggle-users-button {
    display: flex;
  }

  .users-sidebar {
    position: fixed;
    top: 65px;
    right: 0;
    bottom: 0;
    width: 280px;
    height: calc(100vh - 65px);
    z-index: 100;
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
    border-left: 1px solid rgba(162, 178, 170, 0.2);
    transform: translateX(100%);
  }

  .sidebar-backdrop {
    top: 65px;
    height: calc(100vh - 65px);
  }

  .users-sidebar.is-open {
    transform: translateX(0);
  }

  .close-sidebar-button {
    display: block;
  }

  .form-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

@media (max-width: 425px) {
  .room-container {
    margin: 1rem;
    border-radius: 10px;
  }

  .chat-header,
  .messages-area,
  .input-area {
    padding: 1rem;
  }

  .message-item {
    max-width: 100%;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .left-actions {
    justify-content: space-between;
  }

  .send-button {
    width: 100%;
  }
}
</style>
