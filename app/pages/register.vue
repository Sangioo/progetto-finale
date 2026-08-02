<script setup>
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
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const confirmPassword = ref('')

const typingPassword = ref(false)
const passwordsMatch = computed(() => password.value === confirmPassword.value)
const hasMaiusc = computed(() => /[A-Z]/.test(password.value))
const hasMinusc = computed(() => /[a-z]/.test(password.value))
const hasNum = computed(() => /[0-9]/.test(password.value))
const hasSpecial = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(password.value))
const isLong = computed(() => password.value.length >= 8)

const handleSignup = async () => {
  try {
    isLoading.value = true
    errorMsg.value = ''
    successMsg.value = ''

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
    errorMsg.value = 'Si è verificato un errore inaspettato.'
    console.error(err.message || 'Errore durante la registrazione:')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div id="container">
    <main class="auth-section">
      <section class="auth-card">
        <h1 class="auth-title text-evergreen">Crea il tuo account</h1>
        <p class="auth-subtitle">Inizia a tenere traccia dei film che ami.</p>

        <form @submit.prevent="handleSignup" class="form-grid" novalidate>
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input v-model="username" type="text" class="form-control" id="username" placeholder="es. user1234"
              required />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input v-model="email" type="email" class="form-control" id="email" placeholder="user@example.com"
              required />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input v-model="password" type="password" class="form-control" id="password" placeholder="********" required
              @input="typingPassword = true" />
          </div>

          <div v-if="typingPassword" class="password-requirements-container">
            <ul class="password-requirements">
              <li :class="{ ok: hasMaiusc, ko: !hasMaiusc }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
                  v-if="hasMaiusc">
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z">
                  </path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
                  v-else>
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                </svg>Almeno una lettera maiuscola
              </li>

              <li :class="{ ok: hasMinusc, ko: !hasMinusc }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
                  v-if="hasMinusc">
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z">
                  </path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
                  v-else>
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                </svg>Almeno una lettera minuscola
              </li>

              <li :class="{ ok: hasNum, ko: !hasNum }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
                  v-if="hasNum">
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z">
                  </path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
                  v-else>
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                </svg>Almeno un numero
              </li>

              <li :class="{ ok: hasSpecial, ko: !hasSpecial }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
                  v-if="hasSpecial">
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z">
                  </path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
                  v-else>
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                </svg>Almeno un carattere speciale
              </li>

              <li :class="{ ok: isLong, ko: !isLong }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
                  v-if="isLong">
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z">
                  </path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
                  v-else>
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                </svg>Almeno 8 caratteri
              </li>
            </ul>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Conferma Password</label>
            <input v-model="confirmPassword" type="password" class="form-control" id="confirmPassword"
              placeholder="********" required />
            <div class="error-text" v-if="!passwordsMatch && confirmPassword.length > 0">
              Le password non corrispondono.
            </div>
          </div>

          <div class="captcha-wrapper">
            <div id="recaptcha-container"></div>
          </div>

          <button class="btn-base btn-submit" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Creazione account...' : 'Registrati' }}
          </button>

          <div v-if="errorMsg" class="custom-alert" role="alert">
            {{ errorMsg }}
          </div>
        </form>

        <p class="auth-extra">Hai già un account? <NuxtLink to="/login">Accedi</NuxtLink>
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
#container,
#container *,
#container *::before,
#container *::after {
  box-sizing: border-box;
}

#container {
  margin: 0;
  min-height: 100vh;
  background-color: var(--alabaster-grey);
  color: var(--text-main);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.auth-section {
  min-height: calc(100vh - 72px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
}

.auth-card {
  width: min(440px, 100%);
  background: var(--bg-card);
  border: 1px solid var(--muted-teal);
  border-radius: 1rem;
  box-shadow: 0 14px 32px rgba(2, 39, 4, 0.08);
  padding: 2rem;
}

.auth-title {
  margin: 0 0 0.5rem 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.auth-subtitle {
  margin: 0 0 1.5rem 0;
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 500;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  color: var(--evergreen);
  font-weight: 600;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--muted-teal);
  border-radius: 0.5rem;
  transition: var(--transition-standard);
}

.form-control:focus {
  outline: none;
  border-color: var(--mint-leaf);
  box-shadow: 0 0 0 3px rgba(88, 179, 104, 0.2);
}

.password-requirements-container {
  border: 1px solid var(--muted-teal);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(248, 249, 250, 0.5);
}

.password-requirements {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
}

.password-requirements li.ok {
  color: var(--mint-leaf);
}

.password-requirements li.ko {
  color: var(--status-low-bg);
}

.password-requirements li svg {
  flex-shrink: 0;
}

.error-text {
  color: var(--status-low-bg);
  font-size: 0.85rem;
  margin-top: 0.1rem;
}

.captcha-wrapper {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
}

.custom-alert {
  padding: 0.75rem 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--status-low-bg);
  border-radius: 0.5rem;
  color: var(--status-low-bg);
  font-size: 0.9rem;
  text-align: center;
}

.btn-submit {
  width: 100%;
  background-color: var(--mint-leaf);
  color: #ffffff;
  transition: var(--transition-standard);
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--evergreen);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-extra {
  margin: 1.5rem 0 0 0;
  text-align: center;
  color: var(--text-main);
  font-size: 0.95rem;
}

.auth-extra a {
  color: var(--mint-leaf);
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition-standard);
}

.auth-extra a:hover {
  color: var(--evergreen);
  text-decoration: underline;
}

@media (max-width: 425px) {
  .auth-card {
    padding: 1.5rem;
  }
}

@media (max-width: 320px) {
  .auth-card {
    padding: 1.2rem;
  }
}

@media (min-width: 2560px) {
  .auth-card {
    width: 560px;
    max-width: 560px;
    padding: 3rem;
  }
}
</style>
