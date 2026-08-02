<script setup>
const props = defineProps({
    movie: { type: Object, required: true },
    inWatchlist: { type: Boolean, default: false },
    inWatched: { type: Boolean, default: false },
    isAuthenticated: { type: Boolean, default: false },
})
const emit = defineEmits(['left-click', 'right-click'])
</script>
<template>
    <div class="flex gap-2">
        <button
            class="flex-1 flex flex-col items-center py-2 px-0 bg-transparent border border-alabaster-grey rounded-xl cursor-pointer transition-all duration-300 text-gray-500 hover:bg-alabaster-grey hover:border-mint-leaf hover:text-evergreen"
            @click.stop="emit('left-click', movie.id)" :hidden="inWatched"
            :title="!inWatchlist ? 'Aggiungi' : 'Rimuovi'" :disabled="!isAuthenticated">
            <span class="text-lg font-bold">{{ inWatchlist ? '-' : '+' }}</span>
            <span class="text-xs font-bold uppercase tracking-[0.5px]">Watchlist</span>
        </button>

        <button
            class="flex-1 flex flex-col items-center py-2 px-0 bg-transparent border border-alabaster-grey rounded-xl cursor-pointer transition-all duration-300 text-gray-500 hover:bg-alabaster-grey hover:border-mint-leaf hover:text-evergreen"
            @click.stop="emit('right-click', movie.id)" :title="!inWatched ? 'Visto' : 'Rimosso'"
            :disabled="!isAuthenticated">
            <span class="text-lg font-bold">{{ inWatched ? '✓' : '👁' }}</span>
            <span class="text-xs font-bold uppercase tracking-[0.5px]">Visto</span>
        </button>
    </div>
</template>