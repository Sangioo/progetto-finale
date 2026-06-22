<script setup>
const props = defineProps({
  movie: { type: Object, required: true },
  swl: { type: Boolean, default: true },
  swd: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
})
const emit = defineEmits(['left-click', 'right-click', 'reviews-click'])
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL

const handleCardClick = () => {
  emit('reviews-click', props.movie.id)
}
</script>

<template>
  <div class="movie-card clickable" @click="handleCardClick">
    <div class="poster-wrapper">
      <img
        :src="movie.poster_path ? `${IMAGE_URL}${movie.poster_path}` : '/placeholder.png'"
        class="poster-img"
        :alt="movie.title"
      />

      <div v-if="movie.isLive" class="live-badge"><span class="live-dot"></span> LIVE</div>

      <div class="rating-tag"><span class="star">★</span> {{ movie.vote_average.toFixed(1) }}</div>

      <div class="poster-overlay"></div>
    </div>

    <div class="card-content">
      <div class="info">
        <h4 class="title" :title="movie.title">{{ movie.title }}</h4>

        <span class="year">{{
          movie.release_date ? movie.release_date.split('-')[0] : 'N/A'
        }}</span>
      </div>

      <div class="actions-group">
        <button
          class="btn-action"
          :class="{ 'is-active-wl': !swl && !isLocked, locked: isLocked }"
          @click.stop="emit('left-click', movie.id)"
          :hidden="!swd && !isLocked"
          :title="isLocked ? 'Accedi per gestire la watchlist' : swl ? 'Aggiungi' : 'Rimuovi'"
        >
          <span class="icon">{{ !swl && !isLocked ? '−' : '+' }}</span>
          <span class="label">Watchlist</span>
        </button>

        <button
          class="btn-action"
          :class="{ 'is-active-seen': !swd && !isLocked, locked: isLocked }"
          @click.stop="emit('right-click', movie.id)"
          :title="isLocked ? 'Accedi per segnare come visto' : swd ? 'Visto' : 'Rimosso'"
        >
          <span class="icon">{{ !swd && !isLocked ? '✓' : '👁' }}</span>
          <span class="label">Visto</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movie-card {
  background-color: var(--bg-card);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: var(--transition-standard);
  border: 1px solid var(--alabaster-grey);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  position: relative;
}

.movie-card.clickable {
  cursor: pointer;
}

.movie-card.clickable:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(2, 39, 4, 0.12);
}

.movie-card.clickable:hover .title {
  color: var(--mint-leaf);
}

.movie-card.clickable:hover .poster-img {
  transform: scale(1.05);
}

.poster-wrapper {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 70%, rgba(2, 39, 4, 0.05));
  transition: opacity 0.3s ease;
}

.live-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #e50914;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.live-dot {
  width: 6px;
  height: 6px;
  background-color: #ffffff;
  border-radius: 50%;
  display: inline-block;
  animation: pulse-dot 1.5s infinite ease-in-out;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.rating-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--bg-card);
  color: var(--evergreen);
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.rating-tag .star {
  color: #ffc107;
  margin-right: 2px;
}

.card-content {
  padding: 16px;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title {
  font-size: 0.95rem;
  font-weight: 800;
  margin: 0;
  color: var(--evergreen);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  transition: color 0.3s ease;
}

.year {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
}

.actions-group {
  display: flex;
  gap: 8px;
}

.btn-action {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;

  background-color: transparent;
  border: 1px solid var(--alabaster-grey);
  border-radius: 12px;

  cursor: pointer;
  transition: var(--transition-standard);
  color: var(--text-muted);
  z-index: 5;
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

.btn-action:hover:not(.locked):not([class*=\"is-active\"]) {
  background-color: var(--alabaster-grey);
  border-color: var(--mint-leaf);
  color: var(--evergreen);
}

.locked {
  cursor: not-allowed;
  opacity: 0.6;
  filter: grayscale(0.5);
}

.movie-card.is-locked:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
</style>
