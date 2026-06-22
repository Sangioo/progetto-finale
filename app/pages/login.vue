<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = import.meta.env.VITE_API_URL
const LOGIN_ENDPOINT = import.meta.env.VITE_LOGIN_ENDPOINT
const SESSION_ENDPOINT = import.meta.env.VITE_SESSION_ENDPOINT

const router = useRouter()
const credentials = reactive({ username: '', password: '' })
const errorMessage = ref('')
const isLoading = ref(false)

onMounted(async () => {
  try {
    const res = await fetch(`${API_URL}/${SESSION_ENDPOINT}`, {
      credentials: 'include',
    })
    const data = await res.json()

    if (data.authenticated) {
      router.push('/')
    }
  } catch (err) {
    console.error('Errore nel controllo della sessione:', err)
  }
})

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${API_URL}/${LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      window.location.href = '/'
    } else {
      errorMessage.value = data.message || 'Credenziali non valide.'
    }
  } catch (err) {
    errorMessage.value = 'Errore di connessione.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper">
    <main class="auth-section">
      <section class="auth-card">
        <h1 class="auth-title mb-2">Accedi a FrameLog</h1>
        <p class="auth-subtitle mb-4">Inserisci le credenziali per continuare.</p>

        <form @submit.prevent="handleLogin" class="d-grid gap-3">
          <div>
            <label for="username" class="form-label">Username</label>
            <input
              v-model="credentials.username"
              type="text"
              class="form-control"
              id="username"
              placeholder="es. user1234"
              required
            />
          </div>

          <div>
            <label for="password" class="form-label">Password</label>
            <input
              v-model="credentials.password"
              type="password"
              class="form-control"
              id="password"
              placeholder="********"
              required
            />
          </div>

          <button class="btn btn-primary mt-2" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Connessione...' : 'Login' }}
          </button>

          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>
        </form>

        <p class="auth-extra mb-0 mt-3">
          Non hai un account? <a href="/register" class="link-muted">Registrati</a>
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--alabaster-grey);
  padding: 1rem;
}

.auth-section {
  width: 100%;
  max-width: 450px;
}

.auth-card {
  background-color: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  padding: 2.5rem 2rem;
  border: 1px solid rgba(162, 178, 170, 0.2);
}

.auth-title {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  color: var(--evergreen);
  letter-spacing: -0.02em;
}

.auth-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.form-label {
  color: var(--evergreen);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}

.form-control {
  border-color: rgba(162, 178, 170, 0.4);
  transition: var(--transition-standard);
}

.form-control:focus {
  outline: none;
  border-color: var(--mint-leaf);
  box-shadow: 0 0 0 3.5px rgba(88, 179, 104, 0.15);
}

.btn-primary {
  background-color: var(--mint-leaf) !important;
  border-color: var(--mint-leaf) !important;
  color: var(--bg-card) !important;
  font-weight: 700;
  padding: 0.7rem;
  border-radius: 8px;
  transition: var(--transition-standard) !important;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--evergreen) !important;
  border-color: var(--evergreen) !important;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-extra {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.link-muted {
  color: var(--mint-leaf);
  font-weight: 700;
  text-decoration: none;
  transition: var(--transition-standard);
}

.link-muted:hover {
  color: var(--evergreen);
  text-decoration: underline;
}

.alert-danger {
  background-color: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
  color: var(--status-low-bg);
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  margin-top: 1rem;
}

@media (max-width: 425px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 320px) {
  .auth-card {
    padding: 1.5rem 1rem;
  }

  .auth-title {
    font-size: 1.4rem;
  }
}

@media (min-width: 2560px) {
  .auth-section {
    max-width: 560px;
  }

  .auth-card {
    padding: 3rem 2.5rem;
  }
}
</style>
