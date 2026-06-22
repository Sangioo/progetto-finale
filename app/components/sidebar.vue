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

const genreOptions = [
  { id: 28, name: 'Azione' },
  { id: 12, name: 'Avventura' },
  { id: 16, name: 'Animazione' },
  { id: 35, name: 'Commedia' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentario' },
  { id: 18, name: 'Dramma' },
  { id: 10751, name: 'Famiglia' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'Storia' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Musica' },
  { id: 9648, name: 'Mistero' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Fantascienza' },
  { id: 10770, name: 'TV' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Western' },
]

sessionStorage.setItem('genres', JSON.stringify(genreOptions))

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
  <div class="sidebar-filters-container">
    <div class="mobile-filter-toolbar">
      <button type="button" class="mobile-filter-toggle" @click="toggleFiltersVisibility">
        {{ isFiltersOpen ? 'Nascondi Opzioni' : 'Mostra Filtri Avanzati' }}
      </button>
    </div>

    <form
      v-show="shouldShowFilters"
      id="filters-form"
      class="filters-form"
      @submit.prevent="applyFilters"
    >
      <div class="filter-section">
        <label class="section-title" for="sort-by-select">Ordina per</label>
        <select v-model="filters.sort_by" class="custom-input custom-select" id="sort-by-select">
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-section">
        <label class="section-title">Lingua e Area</label>
        <div class="input-row">
          <div class="input-col">
            <label class="input-label" for="with-origin-country">Paese d'origine</label>
            <input
              v-model="filters.with_origin_country"
              type="text"
              maxlength="2"
              class="custom-input text-uppercase"
              placeholder="IT"
              id="with-origin-country"
            />
          </div>
          <div class="input-col">
            <label class="input-label" for="with-original-language">Lingua originale</label>
            <input
              v-model="filters.with_original_language"
              type="text"
              class="custom-input"
              placeholder="it"
              id="with-original-language"
            />
          </div>
        </div>
      </div>

      <div class="filter-section">
        <label class="section-title">Periodo di Uscita</label>
        <div class="input-group-vertical">
          <label class="input-label" for="year">Anno specifico</label>
          <input
            v-model="filters.year"
            type="number"
            class="custom-input"
            min="1900"
            max="2100"
            id="year"
            placeholder="Es. 2024"
          />
        </div>
        <div class="input-row mt-2 date-row">
          <div class="input-col">
            <label class="input-label" for="release-date-gte">Da</label>
            <input
              v-model="filters.release_date_gte"
              type="date"
              class="custom-input"
              id="release-date-gte"
            />
          </div>
          <div class="input-col">
            <label class="input-label" for="release-date-lte">A</label>
            <input
              v-model="filters.release_date_lte"
              type="date"
              class="custom-input"
              id="release-date-lte"
            />
          </div>
        </div>
      </div>

      <div class="filter-section">
        <label class="section-title">Generi</label>
        <table class="genre-table">
          <tr v-for="[g1, g2] in genreRows" :key="g1.id">
            <td>
              <button
                type="button"
                class="genre-btn"
                :class="{ active: isGenreSelected(g1.id) }"
                @click="toggleGenre(g1.id)"
              >
                {{ g1.name }}
              </button>
            </td>
            <td>
              <button
                v-if="g2"
                type="button"
                class="genre-btn"
                :class="{ active: isGenreSelected(g2.id) }"
                @click="toggleGenre(g2.id)"
              >
                {{ g2.name }}
              </button>
            </td>
          </tr>
        </table>
      </div>

      <div class="filter-section">
        <label class="section-title">Valutazione Pubblico</label>
        <div class="input-row">
          <div class="input-col">
            <label class="input-label" for="vote-average-gte">Min (0-10)</label>
            <input
              v-model="filters.vote_average_gte"
              type="number"
              class="custom-input text-center"
              min="0"
              max="10"
              step="0.1"
              id="vote-average-gte"
              @input="enforceNumericRange('vote_average_gte', 'vote_average_lte', 0, 10)"
            />
          </div>
          <div class="input-col">
            <label class="input-label" for="vote-average-lte">Max (0-10)</label>
            <input
              v-model="filters.vote_average_lte"
              type="number"
              class="custom-input text-center"
              min="0"
              max="10"
              step="0.1"
              id="vote-average-lte"
              @input="enforceNumericRange('vote_average_gte', 'vote_average_lte', 0, 10)"
            />
          </div>
        </div>
        <div class="input-group-vertical mt-2">
          <label class="input-label" for="vote-count-gte">Numero voti minimo</label>
          <input
            v-model="filters.vote_count_gte"
            type="number"
            class="custom-input"
            min="0"
            step="1"
            id="vote-count-gte"
            placeholder="Es. 100"
          />
        </div>
      </div>

      <div class="filter-section">
        <label class="section-title">Durata (Minuti)</label>
        <div class="input-row align-center">
          <input
            v-model="filters.runtime_gte"
            type="number"
            class="custom-input text-center"
            min="0"
            step="1"
            @input="normalizeRangeOrder('runtime_gte', 'runtime_lte')"
            placeholder="Min"
          />
          <span class="separator">-</span>
          <input
            v-model="filters.runtime_lte"
            type="number"
            class="custom-input text-center"
            min="0"
            step="1"
            @input="normalizeRangeOrder('runtime_gte', 'runtime_lte')"
            placeholder="Max"
          />
        </div>
      </div>

      <div class="filter-section">
        <label class="section-title">Età (Classificazione IT)</label>
        <div class="input-row">
          <select
            v-model="filters.certification_gte"
            class="custom-input custom-select"
            @change="normalizeCertificationRange('certification_gte', 'certification_lte')"
          >
            <option value="">Min</option>
            <option v-for="cert in italianCertificationOptions" :key="cert" :value="cert">
              {{ cert }}
            </option>
          </select>
          <select
            v-model="filters.certification_lte"
            class="custom-input custom-select"
            @change="normalizeCertificationRange('certification_gte', 'certification_lte')"
          >
            <option value="">Max</option>
            <option v-for="cert in italianCertificationOptions" :key="cert" :value="cert">
              {{ cert }}
            </option>
          </select>
        </div>
      </div>

      <div class="action-buttons">
        <button type="submit" class="btn-submit">Applica Filtri</button>
        <button type="button" class="btn-clear" @click="resetFilters">Svuota tutto</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.sidebar-filters-container {
  width: 100%;
  padding: 1.5rem;
  background-color: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  font-family: 'Inter', system-ui, sans-serif;
  box-sizing: border-box;
}

.filters-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--alabaster-grey);
}

.filter-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--evergreen);
  letter-spacing: -0.01em;
  margin-bottom: 0.25rem;
}

.input-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
  display: block;
}

.input-row {
  display: flex;
  gap: 1rem;
}

.input-col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-group-vertical {
  display: flex;
  flex-direction: column;
}

.align-center {
  align-items: center;
}

.separator {
  color: var(--muted-teal);
  font-weight: bold;
  padding: 0 0.25rem;
}

.mt-2 {
  margin-top: 0.75rem;
}

.mb-2 {
  margin-bottom: 0.75rem;
}

.custom-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--muted-teal);
  border-radius: 8px;
  background-color: var(--bg-app);
  color: var(--text-main);
  font-size: 0.85rem;
  transition: var(--transition-standard);
  box-sizing: border-box;
}

.custom-input:focus {
  outline: none;
  border-color: var(--mint-leaf);
  box-shadow: 0 0 0 3px rgba(88, 179, 104, 0.15);
}

.custom-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a2b2aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.2em;
  padding-right: 2.5rem;
  cursor: pointer;
}

[data-theme='dark'] .custom-select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
}

.genre-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0.5rem;
  margin-top: -0.5rem;
}

.genre-table td {
  width: 50%;
}

.genre-btn {
  width: 100%;
  padding: 0.65rem 0.5rem;
  background-color: var(--bg-app);
  border: 1px solid var(--muted-teal);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition-standard);
}

.genre-btn:hover {
  border-color: var(--mint-leaf);
  color: var(--text-main);
}

.genre-btn.active {
  background-color: var(--evergreen);
  color: var(--bg-card);
  border-color: var(--evergreen);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-submit {
  background-color: var(--mint-leaf);
  color: var(--bg-app);
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition-standard);
  box-shadow: 0 4px 12px rgba(88, 179, 104, 0.2);
}

.btn-submit:hover {
  background-color: var(--evergreen);
  color: var(--bg-card);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(88, 179, 104, 0.3);
}

.btn-clear {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--muted-teal);
  padding: 0.8rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition-standard);
}

.btn-clear:hover {
  background-color: var(--alabaster-grey);
  color: var(--text-main);
}

.sidebar-filters-container::-webkit-scrollbar {
  width: 6px;
}

.sidebar-filters-container::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-filters-container::-webkit-scrollbar-thumb {
  background-color: var(--muted-teal);
  border-radius: 10px;
}

@media (max-width: 425px) {
  .sidebar-filters-container {
    padding: 1.25rem;
  }

  .filters-form {
    gap: 1.25rem;
  }

  .filter-section {
    padding-bottom: 1.25rem;
  }

  .custom-input {
    padding: 0.65rem;
    font-size: 0.8rem;
  }

  .genre-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .date-row {
    flex-direction: column;
  }
}

.mobile-filter-toolbar {
  display: none;
  margin-bottom: 1.5rem;
}

.mobile-filter-toggle {
  width: 100%;
  padding: 1rem;
  border-radius: 10px;
  background-color: var(--evergreen);
  color: var(--bg-card);
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-standard);
}

.mobile-filter-toggle:hover {
  filter: brightness(1.1);
}

@media (max-width: 1024px) {
  .mobile-filter-toolbar {
    display: block;
  }
}

@media (max-width: 321px) {
  .genre-table {
    border-spacing: 0;
  }
}
</style>
