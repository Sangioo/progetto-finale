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
        class="fixed top-0 left-0 w-screen h-screen bg-black/50 flex justify-center items-center z-100 backdrop-blur-xs"
        @click.self="emit('close')">
        <div class="bg-white text-gray-800 p-8 rounded-2xl shadow-lg text-center max-w-100 w-[90%]">
          <h3 v-if="title" class="mt-0 mb-4 text-evergreen">{{ title }}</h3>

          <p v-if="content" class="mb-6 text-gray-600">{{ content }}</p>

          <div class="flex gap-4 justify-center mt-6">
            <button v-for="action in actions" :key="action.label"
              @click="$emit('action', `${identifier}:${action.label.toLowerCase()}`)"
              class="px-4 py-2 rounded-lg font-semibold cursor-pointer" :class="{
                'bg-evergreen text-white hover:bg-evergreen/80': action.type === 'primary',
                'border-evergreen text-evergreen border-2 hover:bg-evergreen/80 hover:text-white': action.type === 'secondary'
              }">
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>