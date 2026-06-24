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
      <div v-if="show" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-content">
          <h3 v-if="title" class="modal-title">{{ title }}</h3>

          <div class="modal-body">
            <slot name="content"></slot>
          </div>

          <div class="modal-actions">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--bg-card);
  color: var(--text-main);

  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  text-align: center;

  max-width: 400px;
  width: 90%;
}

.modal-title {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--evergreen);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}
</style>
