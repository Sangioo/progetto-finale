<script setup>
defineProps({
  show: Boolean,
  title: String,
  type: { type: String, default: 'info' },
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show"
        class="fixed top-0 left-0 w-screen h-screen bg-black/50 flex justify-center items-center z-100 backdrop-blur-xs"
        @click.self="emit('close')">
        <div class="bg-white text-gray-800 p-8 rounded-2xl shadow-lg text-center max-w-100 w-[90%]">
          <h3 v-if="title" class="mt-0 mb-4 text-evergreen">{{ title }}</h3>

          <div>
            <slot name="content"></slot>
          </div>

          <div class="flex gap-4 justify-center mt-6">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>