<script setup>
import Buttons from './buttons.vue'
const props = defineProps({
  movie: { type: Object, required: true },
  inWatchlist: { type: Boolean, default: false },
  inWatched: { type: Boolean, default: false },
})
const emit = defineEmits(['left-click', 'right-click', 'reviews-click'])

const runtimeConfig = useRuntimeConfig()
const IMAGE_URL = runtimeConfig.public.imageUrl
const PLACEHOLDER_IMAGE = runtimeConfig.public.placeholderImage

const handleCardClick = () => {
  emit('reviews-click', props.movie.id)
}
</script>

<template>
  <div
    class="group bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 border border-alabaster-grey shadow relative cursor-pointer hover:shadow-lg hover:transform hover:-translate-y-2"
    @click="handleCardClick">
    <div class="relative aspect-2/3 overflow-hidden">
      <img :src="movie.poster_path ? `${IMAGE_URL}${movie.poster_path}` : PLACEHOLDER_IMAGE"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" :alt="movie.title" />

      <div v-if="movie.isLive"
        class="absolute top-2.5 left-2.5 bg-red-500 text-white text-xs font-extrabold py-1 px-2.5 rounded-[10px] flex items-center gap-1.25 tracking-[0.5px] shadow z-100">
        <span class="w-1.5 h-1.5 bg-white rounded-full inline-block animate-pulse"></span> LIVE
      </div>

      <div
        class="absolute top-2.5 right-2.5 bg-white text-evergreen text-xs font-extrabold py-1 px-2.5 rounded-[10px] flex items-center gap-1.25 tracking-[0.5px] shadow-sm z-100">
        <span class="text-[#ffc107] mr-0.5">★</span> {{ movie.vote_average?.toFixed(1) }}
      </div>

      <div class="absolute inset-0 bg-linear-to-b from-black/50 to-transparent pointer-events-none"></div>
    </div>

    <div class="p-4 pb-5 flex flex-col gap-4">
      <div class="flex flex-col gap-0.5">
        <h4
          class="text-base font-extrabold m-0 text-evergreen whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-300 group-hover:text-mint-leaf"
          :title="movie.title">{{ movie.title }}</h4>

        <span class="text-sm text-gray-500 font-medium">
          {{
            movie.release_date ? movie.release_date.split('-')[0] : 'N/A'
          }}
        </span>
      </div>

      <Buttons :movie="movie" :inWatchlist="inWatchlist" :inWatched="inWatched"
        @left-click="$emit('left-click', $event)" @right-click="$emit('right-click', $event)" />
    </div>
  </div>
</template>