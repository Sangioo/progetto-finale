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
    errorMsg.value = 'Si è verificato un errore durante il login.'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-alabaster-grey p-4">
    <main class="w-full max-w-113 4k:max-w-140">
      <section
        class="py-6 px-4 mobiles:py-8 mobiles:px-6 rounded-xl shadow-sm mobilel:py-10 mobilel:px-8 border border-gray-300 4k:py-12 4k:px-10">
        <h1 class="text-2xl mb-2 mobiles:text-4xl font-extrabold text-evergreen tracking-tight">Accedi a FrameLog</h1>
        <p class="mb-4">Inserisci le credenziali per continuare.</p>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-3">
          <div class="flex flex-col gap-2">
            <label for="email" class="text-evergreen font-semibold text-base">Email</label>
            <input v-model="email" type="email"
              class="w-full p-3 text-base border border-muted-teal rounded-lg transition bg-alabaster-grey focus:outline-0 focus:shadow-sm"
              id="email" placeholder="es. user@example.com" required />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="text-evergreen font-semibold text-base">Password</label>
            <input v-model="password" type="password"
              class="w-full p-3 text-base border border-muted-teal rounded-lg transition bg-alabaster-grey focus:outline-0 focus:shadow-sm"
              id="password" placeholder="********" required />
          </div>

          <button
            class="bg-mint-leaf text-white font-bold h-12 rounded-lg transition-all cursor-pointer hover:bg-evergreen mt-2"
            type="submit">
            Login
          </button>

          <div v-if="errorMsg"
            class="bg-red-600/50 border border-red-900 text-red-900 font-semibold rounded-lg text-center p-3 h-12"
            role="alert">
            {{ errorMsg }}
          </div>
        </form>

        <p class="text-center text-sm mt-4">
          Non hai un account? <NuxtLink to="/register"
            class="text-mint-leaf font-bold transition-all hover:text-evergreen hover:underline">Registrati</NuxtLink>
        </p>
      </section>
    </main>
  </div>
</template>