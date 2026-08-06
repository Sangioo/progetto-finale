<script setup>
import { ref } from 'vue'

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  }
})
const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const errorMsg = ref('')

const handleLogin = async () => {
  try {
    errorMsg.value = ''

    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    await navigateTo('/')
  } catch (err) {
    console.error(err)
    errorMsg.value = err.message.startsWith('Invalid login credentials') ? 'Credenziali non valide' : 'Si è verificato un errore durante il login.'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-alabaster-grey dark:bg-dark-alabaster-grey p-4">
    <main class="w-full max-w-113 4k:max-w-140">
      <section
        class="py-6 px-4 mobiles:py-8 mobiles:px-6 rounded-xl shadow-sm mobilel:py-10 mobilel:px-8 border border-gray-300 dark:border-dark-muted-teal 4k:py-12 4k:px-10">
        <h1
          class="text-2xl mb-2 mobiles:text-4xl font-extrabold text-evergreen dark:text-dark-evergreen tracking-tight">
          Accedi a FrameLog</h1>
        <p class="mb-4 dark:text-white">Inserisci le credenziali per continuare.</p>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-3">
          <div class="flex flex-col gap-2">
            <label for="email" class="text-evergreen dark:text-dark-evergreen font-semibold text-base">Email</label>
            <input v-model="email" type="email"
              class="w-full p-3 text-base border border-muted-teal dark:border-dark-muted-teal rounded-lg transition bg-alabaster-grey dark:bg-dark-alabaster-grey focus:outline-0 focus:shadow-sm dark:text-white"
              id="email" placeholder="es. user@example.com" required />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password"
              class="text-evergreen dark:text-dark-evergreen font-semibold text-base">Password</label>
            <input v-model="password" type="password"
              class="w-full p-3 text-base border border-muted-teal dark:border-dark-muted-teal rounded-lg transition bg-alabaster-grey dark:bg-dark-alabaster-grey focus:outline-0 focus:shadow-sm dark:text-white"
              id="password" placeholder="********" required />
          </div>

          <button
            class="bg-mint-leaf dark:bg-dark-mint-leaf text-white dark:text-black font-bold h-12 rounded-lg transition-all cursor-pointer hover:bg-evergreen dark:hover:bg-dark-evergreen mt-2"
            type="submit">
            Login
          </button>

          <div v-if="errorMsg"
            class="bg-red-600/50 dark:bg-red-300/50 border border-red-900 dark:border-red-700 text-red-900 dark:text-red-700 font-semibold rounded-lg text-center p-3 h-12"
            role="alert">
            {{ errorMsg }}
          </div>
        </form>

        <p class="text-center text-sm mt-4 dark:text-white">
          Non hai un account? <NuxtLink to="/register"
            class="text-mint-leaf dark:text-dark-mint-leaf font-bold transition-all hover:text-evergreen dark:hover:text-dark-evergreen hover:underline">
            Registrati</NuxtLink>
        </p>
      </section>
    </main>
  </div>
</template>