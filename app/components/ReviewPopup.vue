<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },

  review: { type: Object, default: null },
})
const emit = defineEmits(['close'])
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL

const getStatusClass = (val) => {
  if (val < 6) return 'status-low'
  if (val < 8) return 'status-mid'
  return 'status-high'
}

const formattedDate = computed(() => {
  if (!props.review?.time) return 'Data non disponibile'

  const timestamp = props.review.time
  const dateObj = isNaN(timestamp) ? new Date(timestamp) : new Date(Number(timestamp))

  return dateObj.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="review-overlay" @click.self="emit('close')">
      <div class="review-modal">
        <div
          v-if="review?.poster_path || review?.backdrop_path"
          class="review-backdrop-glow"
          :style="{
            backgroundImage: `url(${IMAGE_URL}${review.poster_path || review.backdrop_path})`,
          }"
        ></div>

        <button class="btn-close-x" @click="emit('close')">✕</button>

        <div class="review-content">
          <div class="review-left">
            <img
              v-if="review?.poster_path"
              :src="`${IMAGE_URL}${review.poster_path}`"
              :alt="review?.title"
              class="review-poster"
            />
            <div v-else class="review-poster-fallback">🎬</div>
            <p class="review-caption">{{ review?.title || review?.movie_title }}</p>
          </div>

          <div class="review-right">
            <h2 class="review-title">{{ review?.title || review?.movie_title }}</h2>

            <div class="review-meta">
              <span class="review-badge" :class="getStatusClass(review?.score || review?.voto)">
                ★ {{ review?.score || review?.voto }}/10
              </span>
              <span class="review-date">📅 Pubblicata il: {{ formattedDate }}</span>
            </div>

            <div class="review-scrollable-text">
              <div class="review-text-group">
                <strong>La tua recensione</strong>
                <p class="review-synopsis">{{ review?.content || review?.testo }}</p>
              </div>
            </div>

            <button @click="emit('close')" class="btn-close-full">Chiudi Lettura</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.review-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.review-modal {
  position: relative;
  background-color: var(--bg-card);
  border-radius: 24px;
  width: 95vw;
  max-width: 1100px;
  height: 85vh;
  max-height: 850px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.review-backdrop-glow {
  position: absolute;
  top: -10%;
  left: -10%;
  right: -10%;
  bottom: -10%;
  background-size: cover;
  background-position: center;
  filter: blur(80px) saturate(180%);
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
}

.btn-close-x {
  position: absolute;
  top: 24px;
  right: 28px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
  z-index: 10;
  transition: var(--transition-standard);
}

.btn-close-x:hover {
  color: var(--evergreen);
  transform: scale(1.1);
}

.review-content {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 40px;
  padding: 44px;
  flex: 1;
  overflow: hidden;
}

.review-left {
  flex: 0 0 260px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-poster {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.3);
  object-fit: cover;
  aspect-ratio: 2/3;
}

.review-poster-fallback {
  width: 100%;
  aspect-ratio: 2/3;
  background-color: var(--alabaster-grey);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
}

.review-caption {
  font-size: 14px;
  color: var(--text-muted);
  text-align: center;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
}

.review-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.review-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--evergreen);
  margin: 0;
  line-height: 1.3;
  padding-right: 40px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(162, 178, 170, 0.2);
}

.review-badge {
  color: var(--bg-card);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-low {
  background-color: #d9534f;
}

.status-mid {
  background-color: #f0ad4e;
}

.status-high {
  background-color: var(--mint-leaf);
}

.review-date {
  color: var(--text-muted);
  font-weight: 500;
}

.review-scrollable-text {
  flex: 1;
  overflow-y: auto;
  padding-right: 12px;
  margin-bottom: 10px;
}

.review-scrollable-text::-webkit-scrollbar {
  width: 6px;
}

.review-scrollable-text::-webkit-scrollbar-track {
  background: transparent;
}

.review-scrollable-text::-webkit-scrollbar-thumb {
  background: var(--muted-teal);
  border-radius: 10px;
}

.review-text-group strong {
  display: block;
  font-size: 14px;
  color: var(--evergreen);
  margin-bottom: 8px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.review-synopsis {
  font-size: 1.05rem;
  color: var(--text-main);
  margin: 0;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
}

.btn-close-full {
  margin-top: auto;
  width: 100%;
  background-color: var(--mint-leaf);
  color: var(--bg-card);
  padding: 16px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: var(--transition-standard);
  text-align: center;
  box-shadow: 0 4px 15px rgba(88, 179, 104, 0.25);
}

.btn-close-full:hover {
  background-color: var(--evergreen);
  box-shadow: 0 4px 15px rgba(2, 39, 4, 0.25);
  transform: translateY(-2px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .review-modal {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .review-content {
    flex-direction: column;
    padding: 24px;
    overflow-y: auto;
    gap: 24px;
  }

  .review-left {
    flex: none;
    max-width: 180px;
    margin: 0 auto;
  }

  .review-scrollable-text {
    overflow-y: visible;
    padding-right: 0;
  }

  .review-title {
    font-size: 22px;
    padding-right: 0;
    text-align: center;
  }

  .review-meta {
    justify-content: center;
  }

  .btn-close-x {
    top: 16px;
    right: 20px;
  }
}
</style>
