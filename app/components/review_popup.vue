<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  review: { type: Object, default: null },
})
const emit = defineEmits(['close'])
const IMAGE_URL = useRuntimeConfig().public.imageUrl

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
    <div v-if="show"
      class="fixed top-0 left-0 w-screen h-screen bg-black/75 flex justify-center items-center z-100 backdrop-blur-xs p-4"
      @click.self="emit('close')">
      <div
        class="relative bg-white rounded-3xl w-[95vw] max-w-275 h-[85vh] max-h-212.5 shadow-lg overflow-hidden flex flex-col">
        <div v-if="review?.poster_path || review?.backdrop_path"
          class="absolute inset-[-10%] bg-cover bg-center backdrop-blur-3xl backdrop-saturate-150 opacity-12 pointer-events-none z-0"
          :style="{
            backgroundImage: `url(${IMAGE_URL}${review.poster_path || review.backdrop_path})`,
          }"></div>

        <button
          class="absolute top-6 right-7 bg-transparent border-none text-2xl text-gray-500 cursor-pointer z-10 transition duration-300 hover:text-evergreen hover:scale-110"
          @click="emit('close')">✕</button>

        <div class="relative z-1 flex gap-10 p-11 flex-1 overflow-hidden">
          <div class="flex flex-col gap-4 grow-0 shrink-0 basis-65">
            <img v-if="review?.poster_path" :src="`${IMAGE_URL}${review.poster_path}`" :alt="review?.title"
              class="w-100 rounded-2xl shadow-md object-cover aspect-2/3" />
            <div v-else
              class="w-100 aspect-2/3 bg-alabaster-grey rounded-2xl flex items-center justify-center text-[4rem]">🎬
            </div>
            <p class="text-sm text-gray-500 text-center font-semibold m-0">
              {{ review?.title || 'Titolo non disponibile' }}
            </p>
          </div>

          <div class="flex flex-col gap-5 flex-1 min-w-0">
            <h2 class="text-[28px] font-bold text-evergreen m-0 pr-10">{{ review?.title || 'Titolo non disponibile' }}
            </h2>

            <div class="flex items-center gap-4 flex-wrap text-sm pb-4 border-b border-gray-700">
              <span class="text-white py-1.5 px-3 rounded-lg font-bold shadow-sm"
                :class="getStatusClass(review?.score || review?.voto)">
                ★ {{ review?.score || review?.voto }}/10
              </span>
              <span class="text-gray-500 font-medium">📅 Pubblicata il: {{ formattedDate }}</span>
            </div>

            <div class="flex-1 overflow-y-auto pr-3 mb-2">
              <p class="text-base text-black m-0 leading-relaxed whitespace-pre-wrap wrap-break-word break-all">{{
                review?.content || review?.testo }}</p>
            </div>

            <button @click="emit('close')"
              class="mt-auto w-100 bg-mint-leaf text-white p-4 rounded-[14px] font-bold text-[16px] border-none cursor-pointer shadow-md transition duration-300 text-center hover:bg-evergreen hover:shadow-lg hover:-translate-y-0.5">Chiudi
              Lettura</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>