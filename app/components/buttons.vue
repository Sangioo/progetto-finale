<script setup>
const props = defineProps({
    movie: { type: Object, required: true },
    inWatchlist: { type: Boolean, default: false },
    inWatched: { type: Boolean, default: false },
})
const emit = defineEmits(['left-click', 'right-click'])
</script>
<template>
    <div class="flex gap-2">
        <button
            class="flex-1 flex flex-col items-center py-2 px-0 bg-white dark:bg-dark-alabaster-grey border border-alabaster-grey dark:border-dark-alabaster-grey shadow dark:shadow-gray-600 rounded-xl cursor-pointer transition-all duration-300 text-gray-500 hover:bg-alabaster-grey dark:hover:bg-dark-alabaster-grey hover:border-mint-leaf dark:hover:border-dark-mint-leaf hover:text-evergreen dark:hover:text-dark-evergreen w-[50%]"
            @click.stop="emit('left-click', movie.id)" :hidden="inWatched"
            :title="!inWatchlist ? 'Aggiungi' : 'Rimuovi'">
            <span class="text-lg font-bold dark:text-white">{{ inWatchlist ? '-' : '+' }}</span>
            <span class="text-xs font-bold uppercase tracking-[0.5px] dark:text-white">Watchlist</span>
        </button>

        <button
            class="flex-1 flex flex-col items-center py-2 px-0 bg-white dark:bg-dark-alabaster-grey border border-alabaster-grey dark:border-dark-alabaster-grey shadow dark:shadow-gray-600 rounded-xl cursor-pointer transition-all duration-300 text-gray-500 hover:bg-alabaster-grey dark:hover:bg-dark-alabaster-grey hover:border-mint-leaf dark:hover:border-dark-mint-leaf hover:text-evergreen dark:hover:text-dark-evergreen w-[50%]"
            @click.stop="emit('right-click', movie.id)" :title="!inWatched ? 'Visto' : 'Rimosso'">
            <span class="text-lg font-bold dark:text-white">{{ inWatched ? '✓' : '👁' }}</span>
            <span class="text-xs font-bold uppercase tracking-[0.5px] dark:text-white">Visto</span>
        </button>
    </div>
</template>