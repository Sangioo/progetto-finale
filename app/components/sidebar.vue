<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const emit = defineEmits(['apply-filters', 'reset-filters'])

const PHONE_BREAKPOINT = 1024
const isPhoneViewport = ref(false)
const isFiltersOpen = ref(true)

const shouldShowFilters = computed(() => {
  return !isPhoneViewport.value || isFiltersOpen.value
})

const sortOptions = [
  { value: 'popularity.desc', label: 'Popolarità (discendente)' },
  { value: 'popularity.asc', label: 'Popolarità (crescente)' },
  { value: 'release_date.desc', label: 'Uscita (più recenti)' },
  { value: 'release_date.asc', label: 'Uscita (più vecchi)' },
  { value: 'title.asc', label: 'Alfabetico (A-Z)' },
  { value: 'title.desc', label: 'Alfabetico (Z-A)' },
  { value: 'vote_average.desc', label: 'Valutazione (alta-bassa)' },
  { value: 'vote_average.asc', label: 'Valutazione (bassa-alta)' },
  { value: 'vote_count.desc', label: 'Numero voti (discendente)' },
  { value: 'vote_count.asc', label: 'Numero voti (crescente)' },
  { value: 'revenue.desc', label: 'Incassi (discendente)' },
  { value: 'revenue.asc', label: 'Incassi (crescente)' },
]

const italianCertificationOptions = ['T', 'VM14', 'VM18']
const genreOptions = JSON.parse(sessionStorage.getItem('genres'))

const genreRows = computed(() => {
  const rows = []
  for (let i = 0; i < genreOptions.length; i += 2) {
    rows.push([genreOptions[i], genreOptions[i + 1] ?? null])
  }
  return rows
})

function createDefaultFilters() {
  return {
    sort_by: 'popularity.desc',
    language: 'it-IT',
    region: 'IT',
    watch_region: 'IT',
    with_original_language: '',
    with_origin_country: '',
    year: '',
    release_date_gte: '',
    release_date_lte: '',
    vote_average_gte: 0,
    vote_average_lte: 10,
    vote_count_gte: '',
    vote_count_lte: '',
    runtime_gte: '',
    runtime_lte: '',
    certification_country: 'IT',
    certification_gte: '',
    certification_lte: '',
    with_genres: [],
  }
}

const filters = reactive(createDefaultFilters())

function updateViewportState() {
  const isPhone = window.innerWidth < PHONE_BREAKPOINT
  if (isPhoneViewport.value !== isPhone) {
    isPhoneViewport.value = isPhone
    isFiltersOpen.value = isPhone
    return
  }
  if (!isPhone) isFiltersOpen.value = true
}

function toggleFiltersVisibility() {
  if (isPhoneViewport.value) isFiltersOpen.value = !isFiltersOpen.value
}

function toNumberOrEmpty(value) {
  if (value === '' || value === null || value === undefined) return ''
  const number = Number(value)
  return Number.isNaN(number) ? '' : number
}

function enforceNumericRange(minKey, maxKey, minLimit, maxLimit) {
  let min = toNumberOrEmpty(filters[minKey])
  let max = toNumberOrEmpty(filters[maxKey])

  if (min !== '') {
    min = Math.min(Math.max(min, minLimit), maxLimit)
    filters[minKey] = min
  }
  if (max !== '') {
    max = Math.min(Math.max(max, minLimit), maxLimit)
    filters[maxKey] = max
  }

  if (min !== '' && max !== '' && min > max) {
    if (String(filters[minKey]) === String(min)) filters[maxKey] = min
    else filters[minKey] = max
  }
}

function toggleGenre(genreId) {
  const selectedGenres = filters.with_genres
  const index = selectedGenres.indexOf(genreId)
  if (index >= 0) selectedGenres.splice(index, 1)
  else selectedGenres.push(genreId)
}

function isGenreSelected(genreId) {
  return filters.with_genres.includes(genreId)
}

function normalizeRangeOrder(minKey, maxKey) {
  const minValue = toNumberOrEmpty(filters[minKey])
  const maxValue = toNumberOrEmpty(filters[maxKey])
  if (minValue === '' || maxValue === '') return
  if (minValue > maxValue) filters[maxKey] = minValue
}

function normalizeCertificationRange(minKey, maxKey) {
  if (!filters[minKey] || !filters[maxKey]) return
  const minValue = italianCertificationOptions.indexOf(filters[minKey])
  const maxValue = italianCertificationOptions.indexOf(filters[maxKey])
  if (minValue === -1 || maxValue === -1) return
  if (minValue > maxValue) filters[maxKey] = filters[minKey]
}

function sanitizeFilters() {
  enforceNumericRange('vote_average_gte', 'vote_average_lte', 0, 10)
  normalizeRangeOrder('vote_count_gte', 'vote_count_lte')
  normalizeRangeOrder('runtime_gte', 'runtime_lte')
  normalizeCertificationRange('certification_gte', 'certification_lte')
}

function asString(value) {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}
function asNumber(value, fallback = '') {
  const normalized = Number(asString(value))
  return Number.isNaN(normalized) ? fallback : normalized
}

function buildDiscoverParams() {
  sanitizeFilters()
  const params = {
    sort_by: filters.sort_by,
    language: filters.language,
    region: filters.region,
    watch_region: filters.watch_region,
    certification_country: filters.certification_country,
  }

  if (filters.with_original_language) params.with_original_language = filters.with_original_language
  if (filters.with_origin_country)
    params.with_origin_country = filters.with_origin_country.toUpperCase()
  if (filters.year) params.year = asString(filters.year)
  if (filters.release_date_gte) params['release_date.gte'] = filters.release_date_gte
  if (filters.release_date_lte) params['release_date.lte'] = filters.release_date_lte
  if (filters.vote_average_gte !== '' && asNumber(filters.vote_average_gte) > 0)
    params['vote_average.gte'] = asString(filters.vote_average_gte)
  if (filters.vote_average_lte !== '' && asNumber(filters.vote_average_lte) < 10)
    params['vote_average.lte'] = asString(filters.vote_average_lte)
  if (filters.vote_count_gte !== '') params['vote_count.gte'] = asString(filters.vote_count_gte)
  if (filters.vote_count_lte !== '') params['vote_count.lte'] = asString(filters.vote_count_lte)
  if (filters.runtime_gte !== '') params['with_runtime.gte'] = asString(filters.runtime_gte)
  if (filters.runtime_lte !== '') params['with_runtime.lte'] = asString(filters.runtime_lte)
  if (filters.certification_gte) params['certification.gte'] = filters.certification_gte
  if (filters.certification_lte) params['certification.lte'] = filters.certification_lte
  if (filters.with_genres.length > 0) params.with_genres = filters.with_genres.join(',')

  return params
}

function applyFilters() {
  const params = buildDiscoverParams()
  emit('apply-filters', params)
}

function resetFilters() {
  Object.assign(filters, createDefaultFilters())
  emit('reset-filters')
}

onMounted(() => {
  updateViewportState()
  window.addEventListener('resize', updateViewportState)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportState)
})
</script>

<template>
  <div class="w-full box-border rounded-xl">
    <div class="mb-6 block laptop:hidden">
      <button type="button"
        class="w-full cursor-pointer rounded-xl border-0 bg-evergreen dark:bg-dark-evergreen p-4 font-bold text-white dark:text-dark-alabaster-grey transition-all duration-300 ease-in-out hover:brightness-110"
        @click="toggleFiltersVisibility">
        {{ isFiltersOpen ? 'Nascondi Opzioni' : 'Mostra Filtri Avanzati' }}
      </button>
    </div>

    <form v-show="shouldShowFilters" id="filters-form" class="flex flex-col gap-5 mobilel:gap-6"
      @submit.prevent="applyFilters">
      <div
        class="flex flex-col gap-3 border-b border-alabaster-grey dark:border-dark-alabaster-grey pb-5 last:border-b-0 last:pb-0 mobilel:pb-6">
        <label class="mb-1 block text-base font-bold tracking-tight text-evergreen dark:text-dark-evergreen"
          for="sort-by-select">Ordina
          per</label>
        <select v-model="filters.sort_by" id="sort-by-select"
          class="w-full cursor-pointer appearance-none rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-sm box-border transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white">
          <option v-for="option in sortOptions" :key="option.value" :value="option.value"
            class="dark:text-white dark:bg-dark-alabaster-grey">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div
        class="flex flex-col gap-3 border-b border-alabaster-grey dark:border-dark-alabaster-grey pb-5 last:border-b-0 last:pb-0 mobilel:pb-6">
        <label class="mb-1 block text-base font-bold tracking-tight text-evergreen dark:text-dark-evergreen">Lingua e
          Area</label>
        <div class="flex gap-4">
          <div class="flex flex-1 flex-col">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider dark:text-white"
              for="with-origin-country">Nazione
              d'origine</label>
            <input v-model="filters.with_origin_country" type="text" maxlength="2"
              class="w-full box-border rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-sm uppercase transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
              placeholder="IT" id="with-origin-country" />
          </div>
          <div class="flex flex-1 flex-col">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider dark:text-white"
              for="with-original-language">Lingua
              originale</label>
            <input v-model="filters.with_original_language" type="text"
              class="w-full box-border rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-sm transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
              placeholder="it" id="with-original-language" />
          </div>
        </div>
      </div>

      <div
        class="flex flex-col gap-3 border-b border-alabaster-grey dark:border-dark-alabaster-grey pb-5 last:border-b-0 last:pb-0 mobilel:pb-6">
        <label class="mb-1 block text-base font-bold tracking-tight text-evergreen dark:text-dark-evergreen">Periodo di
          Uscita</label>
        <div class="flex flex-col">
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider dark:text-white" for="year">Anno
            specifico</label>
          <input v-model="filters.year" type="number"
            class="w-full box-border rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-sm transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
            min="1900" max="2100" id="year" placeholder="Es. 2024" />
        </div>
        <div class="mt-3 flex gap-4 flex-col mobilel:flex-row">
          <div class="flex flex-1 flex-col">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider dark:text-white"
              for="release-date-gte">Da</label>
            <input v-model="filters.release_date_gte" type="date"
              class="w-full box-border rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-sm transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
              id="release-date-gte" />
          </div>
          <div class="flex flex-1 flex-col">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider dark:text-white"
              for="release-date-lte">A</label>
            <input v-model="filters.release_date_lte" type="date"
              class="w-full box-border rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-sm transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
              id="release-date-lte" />
          </div>
        </div>
      </div>

      <div
        class="flex flex-col gap-3 border-b border-alabaster-grey dark:border-dark-alabaster-grey pb-5 last:border-b-0 last:pb-0 mobilel:pb-6">
        <label
          class="mb-1 block text-base font-bold tracking-tight text-evergreen dark:text-dark-evergreen">Generi</label>
        <table class="-mt-2 w-full border-separate border-spacing-0 mobilem:border-spacing-2">
          <tr v-for="[g1, g2] in genreRows" :key="g1.id">
            <td class="w-1/2">
              <button type="button" :class="[
                'w-full cursor-pointer rounded-lg border border-muted-teal dark:border-dark-muted-teal px-2 py-2 text-sm font-semibold transition-all duration-300 ease-in-out hover:border-mint-leaf',
                isGenreSelected(g1.id) ? 'border-evergreen dark:border-dark-evergreen bg-evergreen dark:bg-dark-evergreen text-white dark:text-dark-alabaster-grey' : 'dark:text-gray-300',
              ]" @click="toggleGenre(g1.id)">
                {{ g1.name }}
              </button>
            </td>
            <td class="w-1/2">
              <button v-if="g2" type="button" :class="[
                'w-full cursor-pointer rounded-lg border border-muted-teal dark:border-dark-muted-teal px-2 py-2 text-sm font-semibold transition-all duration-300 ease-in-out hover:border-mint-leaf',
                isGenreSelected(g2.id) ? 'border-evergreen dark:border-dark-evergreen bg-evergreen dark:bg-dark-evergreen text-white dark:text-dark-alabaster-grey' : 'dark:text-gray-300',
              ]" @click="toggleGenre(g2.id)">
                {{ g2.name }}
              </button>
            </td>
          </tr>
        </table>
      </div>

      <div
        class="flex flex-col gap-3 border-b border-alabaster-grey dark:border-dark-alabaster-grey pb-5 last:border-b-0 last:pb-0 mobilel:pb-6">
        <label class="mb-1 block text-base font-bold tracking-tight text-evergreen dark:text-dark-evergreen">Valutazione
          Pubblico</label>
        <div class="flex gap-4">
          <div class="flex flex-1 flex-col">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider dark:text-white"
              for="vote-average-gte">Min
              (0-10)</label>
            <input v-model="filters.vote_average_gte" type="number"
              class="w-full box-border rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-center text-sm transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
              min="0" max="10" step="0.1" id="vote-average-gte"
              @input="enforceNumericRange('vote_average_gte', 'vote_average_lte', 0, 10)" />
          </div>
          <div class="flex flex-1 flex-col">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider dark:text-white"
              for="vote-average-lte">Max
              (0-10)</label>
            <input v-model="filters.vote_average_lte" type="number"
              class="w-full box-border rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-center text-sm transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
              min="0" max="10" step="0.1" id="vote-average-lte"
              @input="enforceNumericRange('vote_average_gte', 'vote_average_lte', 0, 10)" />
          </div>
        </div>
        <div class="mt-3 flex flex-col">
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider dark:text-white"
            for="vote-count-gte">Numero
            voti minimo</label>
          <input v-model="filters.vote_count_gte" type="number"
            class="w-full box-border rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-sm transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
            min="0" step="1" id="vote-count-gte" placeholder="Es. 100" />
        </div>
      </div>

      <div
        class="flex flex-col gap-3 border-b border-alabaster-grey dark:border-dark-alabaster-grey pb-5 last:border-b-0 last:pb-0 mobilel:pb-6">
        <label class="mb-1 block text-base font-bold tracking-tight text-evergreen dark:text-dark-evergreen">Durata
          (Minuti)</label>
        <div class="flex items-center gap-4 flex-col mobilel:flex-row">
          <input v-model="filters.runtime_gte" type="number"
            class="w-full box-border rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-center text-sm transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
            min="0" step="1" @input="normalizeRangeOrder('runtime_gte', 'runtime_lte')" placeholder="Min" />
          <span class="px-1 font-bold text-muted-teal">-</span>
          <input v-model="filters.runtime_lte" type="number"
            class="w-full box-border rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 text-center text-sm transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
            min="0" step="1" @input="normalizeRangeOrder('runtime_gte', 'runtime_lte')" placeholder="Max" />
        </div>
      </div>

      <div
        class="flex flex-col gap-3 border-b border-alabaster-grey dark:border-dark-alabaster-grey pb-5 last:border-b-0 last:pb-0 mobilel:pb-6">
        <label class="mb-1 block text-base font-bold tracking-tight text-evergreen dark:text-dark-evergreen">Età
          (Classificazione
          IT)</label>
        <div class="flex gap-4">
          <select v-model="filters.certification_gte"
            class="w-full cursor-pointer appearance-none rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 pr-10 text-sm box-border transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
            @change="normalizeCertificationRange('certification_gte', 'certification_lte')">
            <option value="">Min</option>
            <option v-for="cert in italianCertificationOptions" :key="cert" :value="cert"
              class="dark:text-white dark:bg-dark-alabaster-grey">
              {{ cert }}
            </option>
          </select>
          <select v-model="filters.certification_lte"
            class="w-full cursor-pointer appearance-none rounded-lg border border-muted-teal dark:border-dark-muted-teal p-2 pr-10 text-sm box-border transition-all duration-300 ease-in-out focus:border-mint-leaf dark:focus:border-dark-mint-leaf focus:outline-none focus:shadow-sm mobilel:px-4 mobilel:py-3 dark:text-white"
            @change="normalizeCertificationRange('certification_gte', 'certification_lte')">
            <option value="">Max</option>
            <option v-for="cert in italianCertificationOptions" :key="cert" :value="cert"
              class="dark:text-white dark:bg-dark-alabaster-grey">
              {{ cert }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 mb-5 flex flex-col gap-3">
        <button type="submit"
          class="cursor-pointer rounded-xl bg-mint-leaf dark:bg-dark-mint-leaf p-4 font-bold text-white dark:text-dark-alabaster-grey shadow-sm transition-all duration-300 ease-in-out h-14 hover:bg-evergreen dark:hover:bg-dark-evergreen hover:text-white dark:hover:text-black hover:shadow-lg">
          Applica Filtri
        </button>
        <button type="button"
          class="cursor-pointer rounded-xl border border-muted-teal dark:border-dark-muted-teal p-4 font-bold shadow-sm transition-all duration-300 ease-in-out h-14 hover:bg-alabaster-grey dark:hover:bg-alabaster-grey hover:shadow-lg dark:text-white dark:hover:text-black"
          @click="resetFilters">
          Svuota tutto
        </button>
      </div>
    </form>
  </div>
</template>