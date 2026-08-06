<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  review: { type: Object, default: null },
})
const emit = defineEmits(['close'])
const IMAGE_URL = useRuntimeConfig().public.imageUrl

const getStatusClass = (val) => {
  if (val < 6) return 'bg-red-500'
  if (val < 8) return 'bg-yellow-500'
  return 'bg-green-500'
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
      class="fixed top-0 left-0 w-screen h-screen bg-black/75 dark:bg-gray-500/75 flex justify-center items-center z-100 backdrop-blur-xs tablet:p-4"
      @click.self="emit('close')">
      <div
        class="relative bg-white dark:bg-dark-alabaster-grey w-screen h-screen shadow-lg overflow-hidden flex flex-col pt-20 tablet:p-0 tablet:max-h-212.5 tablet:max-w-275 tablet:w-[95vw] tablet:h-[85vh] tablet:rounded-3xl">
        <div v-if="review?.poster_path || review?.backdrop_path"
          class="absolute inset-[-10%] bg-cover bg-center backdrop-blur-3xl backdrop-saturate-150 opacity-12 pointer-events-none z-0"
          :style="{
            backgroundImage: `url(${IMAGE_URL}${review.poster_path || review.backdrop_path})`,
          }"></div>

        <button
          class="absolute top-6 right-7 bg-transparent border-none text-2xl text-gray-500 dark:text-gray-400 cursor-pointer z-10 transition duration-300 hover:text-evergreen dark:hover:text-dark-evergreen hover:scale-110 hidden tablet:block"
          @click="emit('close')">✕</button>

        <div
          class="flex flex-col p-6 overflow-y-auto gap-6 relative z-1 flex-1 overflow-hidden tablet:gap-10 tablet:p-11 tablet:flex-row">
          <div
            class="flex flex-col flex-none max-w-45 my-0 mx-auto gap-4 tablet:grow-0 tablet:shrink-0 tablet:basis-65 tablet:max-w-full tablet:m-0">
            <img v-if="review?.poster_path" :src="`${IMAGE_URL}${review.poster_path}`" :alt="review?.title"
              class="w-100 rounded-2xl shadow-md object-cover aspect-2/3" />
            <div v-else
              class="w-100 aspect-2/3 bg-alabaster-grey dark:bg-dark-alabaster-grey rounded-2xl flex items-center justify-center text-[4rem]">
              🎬
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center font-semibold m-0">
              {{ review?.original_title || 'Titolo originale non disponibile' }}
            </p>
          </div>

          <div class="flex flex-col gap-5 flex-1 min-w-0">
            <h2
              class="text-[22px] pr-0 text-center tablet:text-start tablet:text-[28px] font-bold text-evergreen dark:text-dark-evergreen m-0 tablet:pr-10">
              {{ review?.title || 'Titolo non disponibile' }}
            </h2>

            <div
              class="flex items-center gap-4 flex-wrap text-sm pb-4 border-b border-gray-500 dark:border-gray-400 justify-center tablet:justify-start">
              <span class="text-white dark:text-black py-1.5 px-3 rounded-lg font-bold shadow-sm"
                :class="getStatusClass(review?.score || review?.voto)">
                ★ {{ review?.score || review?.voto }}/10
              </span>
              <span class="text-gray-500 dark:text-gray-400 font-medium">📅 Pubblicata il: {{ formattedDate }}</span>
            </div>

            <div class="flex-1 overflow-y-visible pr-0 tablet:overflow-y-auto tablet:pr-3 mb-2">
              <p
                class="text-base text-black dark:text-white m-0 leading-relaxed whitespace-pre-wrap wrap-break-word break-all">
                {{ review?.content || review?.testo }}</p>
            </div>

            <button @click="emit('close')"
              class="mt-auto w-100 max-w-full bg-mint-leaf dark:bg-dark-mint-leaf text-white dark:text-black p-4 rounded-[14px] font-bold text-[16px] border-none cursor-pointer shadow-md transition duration-300 text-center hover:bg-evergreen dark:hover:bg-dark-evergreen hover:shadow-lg hover:-translate-y-0.5">Chiudi
              Lettura</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>