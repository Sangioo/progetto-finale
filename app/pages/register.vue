<script setup>
import { ref } from 'vue'
import PasswordInput from '~/components/password_input.vue'

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  }
})

const supabase = useSupabaseClient()

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const successMsg = ref('')


const handleSignup = async () => {
  try {
    errorMsg.value = ''
    successMsg.value = ''

    if (password.value !== confirmPassword.value) {
      errorMsg.value = 'Le password non corrispondono.'
      return
    }

    if (!checkPassword(password.value).isValid) {
      errorMsg.value = 'La password non soddisfa i requisiti di sicurezza.'
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          username: username.value,
        },
      },
    })

    if (error) throw error

    successMsg.value = 'Registrazione completata! Controlla la tua casella email per confermare l\'account.'

    email.value = ''
    password.value = ''
    confirmPassword.value = ''
  } catch (err) {
    errorMsg.value = 'Si è verificato un errore durante la registrazione. Riprova più tardi.'
    console.error(err)
  }
}
</script>

<template>
  <div class="min-h-screen bg-alabaster-grey dark:bg-dark-alabaster-grey flex items-center justify-center">
    <main class="w-full max-w-113 4k:max-w-140">
      <section
        class="y-6 px-4 mobiles:py-8 mobiles:px-6 rounded-xl shadow-sm mobilel:py-10 mobilel:px-8 border border-gray-300 dark:border-dark-muted-teal 4k:py-12 4k:px-10">
        <h1
          class="text-2xl mb-2 mobiles:text-4xl font-extrabold text-evergreen dark:text-dark-evergreen tracking-tight">
          Crea il tuo account</h1>
        <p class="mb-4 dark:text-white">Inizia a tenere traccia dei film che ami.</p>

        <form @submit.prevent="handleSignup" class="flex flex-col gap-3">
          <div class="flex flex-col gap-2">
            <label for="username"
              class="text-evergreen dark:text-dark-evergreen font-semibold text-base">Username</label>
            <input v-model="username" type="text"
              class="w-full p-3 text-base border border-muted-teal dark:border-dark-muted-teal rounded-lg transition bg-alabaster-grey dark:bg-dark-alabaster-grey focus:outline-0 focus:shadow-sm dark:text-white"
              id="username" placeholder="es. user1234" required />
          </div>

          <div class="flex flex-col gap-2">
            <label for="email" class="text-evergreen dark:text-dark-evergreen font-semibold text-base">Email</label>
            <input v-model="email" type="email"
              class="w-full p-3 text-base border border-muted-teal dark:border-dark-muted-teal rounded-lg transition bg-alabaster-grey dark:bg-dark-alabaster-grey focus:outline-0 focus:shadow-sm dark:text-white"
              id="email" placeholder="es. user@example.com" required />
          </div>

          <PasswordInput v-model:password="password" v-model:confirmPassword="confirmPassword" />

          <button
            class="bg-mint-leaf text-white font-bold h-12 rounded-lg transition-all cursor-pointer hover:bg-evergreen mt-2"
            type="submit">
            Registrati
          </button>

          <div v-if="errorMsg"
            class="bg-red-600/50 dark:bg-red-300/50 border border-red-900 dark:border-red-700 text-red-900 dark:text-red-700 font-semibold rounded-lg text-center p-3 h-12"
            role="alert">
            {{ errorMsg }}
          </div>
        </form>

        <p class="text-center text-sm mt-4 dark:text-white">
          Hai già un account? <NuxtLink to="/login"
            class="text-mint-leaf dark:text-dark-mint-leaf font-bold transition-all hover:text-evergreen dark:hover:text-dark-evergreen hover:underline">
            Accedi</NuxtLink>
        </p>
      </section>
    </main>
  </div>
</template>
