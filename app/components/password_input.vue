<script setup>
import { ref, computed } from 'vue'

const password = defineModel('password')
const confirmPassword = defineModel('confirmPassword')
const typingPassword = ref(false)
const hasUpperCase = computed(() => checkPassword(password.value).hasUpperCase)
const hasLowerCase = computed(() => checkPassword(password.value).hasLowerCase)
const hasNumber = computed(() => checkPassword(password.value).hasNumber)
const hasSpecialChar = computed(() => checkPassword(password.value).hasSpecialChar)
const isLong = computed(() => checkPassword(password.value).isLong)

</script>
<template>
  <div class="flex flex-col gap-2">
    <label for="password" class="text-evergreen font-semibold text-base">Password</label>
    <input v-model="password" type="password"
      class="w-full p-3 text-base border border-muted-teal rounded-lg transition bg-alabaster-grey focus:outline-0 focus:shadow-sm"
      id="password" placeholder="********" required @input="typingPassword = true" />
  </div>

  <div v-if="typingPassword" class="border border-muted-teal rounded-lg p-3 bg-alabaster-grey">
    <ul class="list-none p-0 m-0 flex flex-col gap-2 *:flex *:items-center *:gap-2 *:text-sm">
      <li :class="{ 'text-mint-leaf': hasUpperCase, 'text-red-600': !hasUpperCase }">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
          class="shrink-0" v-if="hasUpperCase">
          <path
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z">
          </path>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
          class="shrink-0" v-else>
          <path
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
        </svg>Almeno una lettera maiuscola
      </li>

      <li :class="{ 'text-mint-leaf': hasLowerCase, 'text-red-600': !hasLowerCase }">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
          class="shrink-0" v-if="hasLowerCase">
          <path
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z">
          </path>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
          class="shrink-0" v-else>
          <path
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
        </svg>Almeno una lettera minuscola
      </li>

      <li :class="{ 'text-mint-leaf': hasNumber, 'text-red-600': !hasNumber }">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
          class="shrink-0" v-if="hasNumber">
          <path
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z">
          </path>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
          class="shrink-0" v-else>
          <path
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
        </svg>Almeno un numero
      </li>

      <li :class="{ 'text-mint-leaf': hasSpecialChar, 'text-red-600': !hasSpecialChar }">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
          class="shrink-0" v-if="hasSpecialChar">
          <path
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z">
          </path>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
          class="shrink-0" v-else>
          <path
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
        </svg>Almeno un carattere speciale
      </li>

      <li :class="{ 'text-mint-leaf': isLong, 'text-red-600': !isLong }">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
          class="shrink-0" v-if="isLong">
          <path
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z">
          </path>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
          class="shrink-0" v-else>
          <path
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
        </svg>Almeno 8 caratteri
      </li>
    </ul>
  </div>

  <div class="flex flex-col gap-2">
    <label for="confirmPassword" class="text-evergreen font-semibold text-base">Conferma Password</label>
    <input v-model="confirmPassword" type="password"
      class="w-full p-3 text-base border border-muted-teal rounded-lg transition bg-alabaster-grey focus:outline-0 focus:shadow-sm"
      id="confirmPassword" placeholder="********" required />
  </div>
</template>