<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = import.meta.env.VITE_API_URL
const REGISTER_ENDPOINT = import.meta.env.VITE_REGISTER_ENDPOINT
const SESSION_ENDPOINT = import.meta.env.VITE_SESSION_ENDPOINT

const router = useRouter()

const recaptchaSiteKey = '6Lf40eIsAAAAAJboGYjtnjybpK1z12kTdEQICwC2'

const userData = reactive({
  username: '',
  email: '',
  password: '',
  recaptchaToken: '',
})

const errorMessage = ref('')
const isLoading = ref(false)
const typingPassword = ref(false)
const hasMaiusc = ref(false)
const hasMinusc = ref(false)
const hasNum = ref(false)
const hasSpecial = ref(false)
const isLong = ref(false)
const confirmPassword = ref('')
const passwordsMatch = ref(true)

const renderCaptcha = () => {
  if (window.grecaptcha) {
    window.grecaptcha.ready(() => {
      window.grecaptcha.render('recaptcha-container', {
        sitekey: recaptchaSiteKey,
        callback: (token) => {
          userData.recaptchaToken = token
          errorMessage.value = ''
        },
        'expired-callback': () => {
          userData.recaptchaToken = ''
        },
      })
    })
  }
}

onMounted(async () => {
  if (!window.grecaptcha) {
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
    script.onload = renderCaptcha
  } else {
    renderCaptcha()
  }

  try {
    const res = await fetch(`${API_URL}/${SESSION_ENDPOINT}`, { credentials: 'include' })
    const data = await res.json()
    if (data.authenticated) router.push('/home')
  } catch (err) {
    console.error('Errore nel controllo della sessione:', err)
  }
})

watch(
  () => userData.password,
  (newPassword) => {
    hasMaiusc.value = /[A-Z]/.test(newPassword)
    hasMinusc.value = /[a-z]/.test(newPassword)
    hasNum.value = /\d/.test(newPassword)
    hasSpecial.value = /[!@#$%^&*_+\-=;':"\\|,.<>\/?]/.test(newPassword)
    isLong.value = newPassword.length >= 8
    typingPassword.value = newPassword.length > 0

    passwordsMatch.value = confirmPassword.value === newPassword
  },
)

watch(confirmPassword, (newConfirm) => {
  passwordsMatch.value = newConfirm === userData.password
})

function isPasswordValid() {
  return hasMaiusc.value && hasMinusc.value && hasNum.value && hasSpecial.value && isLong.value
}

const handleRegister = async () => {
  if (!userData.recaptchaToken) {
    errorMessage.value = 'Per favore, conferma che non sei un robot.'
    return
  }

  if (!isPasswordValid()) {
    errorMessage.value = 'La password non soddisfa i requisiti richiesti.'
    return
  }

  if (!passwordsMatch.value || confirmPassword.value === '') {
    errorMessage.value = 'Le password non corrispondono.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${API_URL}/${REGISTER_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      router.push('/login')
    } else {
      errorMessage.value = data.message || 'Errore durante la registrazione.'
      if (window.grecaptcha) {
        window.grecaptcha.reset()
        userData.recaptchaToken = ''
      }
    }
  } catch (err) {
    errorMessage.value = 'Errore di connessione al server.'
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

        <form @submit.prevent="handleRegister" class="form-grid" novalidate>
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              v-model="userData.username"
              type="text"
              class="form-control"
              id="username"
              placeholder="es. user1234"
              required
            />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              v-model="userData.email"
              type="email"
              class="form-control"
              id="email"
              placeholder="nome@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              v-model="userData.password"
              type="password"
              class="form-control"
              id="password"
              placeholder="********"
              required
            />
          </div>

          <div v-if="typingPassword" class="password-requirements-container">
            <ul class="password-requirements">
              <li :class="{ ok: hasMaiusc, ko: !hasMaiusc }">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  v-if="hasMaiusc"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  ></path>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  v-else
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"
                  /></svg
                >Almeno una lettera maiuscola
              </li>

              <li :class="{ ok: hasMinusc, ko: !hasMinusc }">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  v-if="hasMinusc"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  ></path>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  v-else
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"
                  /></svg
                >Almeno una lettera minuscola
              </li>

              <li :class="{ ok: hasNum, ko: !hasNum }">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  v-if="hasNum"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  ></path>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  v-else
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"
                  /></svg
                >Almeno un numero
              </li>

              <li :class="{ ok: hasSpecial, ko: !hasSpecial }">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  v-if="hasSpecial"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  ></path>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  v-else
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"
                  /></svg
                >Almeno un carattere speciale
              </li>

              <li :class="{ ok: isLong, ko: !isLong }">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  v-if="isLong"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  ></path>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  v-else
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"
                  /></svg
                >Almeno 8 caratteri
              </li>
            </ul>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Conferma Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-control"
              id="confirmPassword"
              placeholder="********"
              required
            />
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

          <div v-if="errorMessage" class="custom-alert" role="alert">
            {{ errorMessage }}
          </div>
        </form>

        <p class="auth-extra">Hai già un account? <router-link to="/login">Accedi</router-link></p>
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
