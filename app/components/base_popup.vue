<script setup>
const props = defineProps({
  show: Boolean,
  title: { type: String, default: 'Notifica' },
  content: { type: String, default: '' },
  actions: { type: Array, default: () => [{ label: 'Chiudi', type: 'secondary' }] },
  identifier: { type: String, default: '' }
})

const emit = defineEmits(['action', 'close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show"
        class="fixed top-0 left-0 w-screen h-screen bg-black/75 dark:bg-white/75 flex justify-center items-center z-100 backdrop-blur-xs"
        @click.self="emit('close')">
        <div class="bg-white dark:bg-dark-alabaster-grey p-8 rounded-2xl shadow-lg text-center max-w-100 w-[90%]">
          <h3 v-if="title"
            class="mt-0 mb-4 pb-3 text-xl text-evergreen dark:text-dark-evergreen border-b border-b-gray-500 dark:border-b-gray-400">
            {{ title }}
          </h3>

          <p v-if="content" class="mb-6 text-gray-500 dark:text-gray-400">{{ content }}</p>

          <div class="flex gap-4 justify-center mt-6">
            <button v-for="action in actions" :key="action.label"
              @click="$emit('action', `${identifier}:${action.label.toLowerCase()}`)"
              class="px-4 py-2 rounded-lg font-semibold cursor-pointer" :class="{
                'bg-evergreen dark:bg-dark-evergreen text-white dark:text-black hover:bg-evergreen/80 dark:hover:bg-dark-evergreen/80': action.type === 'primary',
                'border-evergreen dark:border-dark-evergreen text-evergreen dark:text-dark-evergreen border hover:bg-evergreen/80 dark:hover:bg-dark-evergreen/80 hover:text-white dark:hover:text-black': action.type === 'secondary'
              }">
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>