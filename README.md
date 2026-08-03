# FrameLog

FrameLog è una piattaforma web interattiva dedicata agli appassionati di cinema.

L'obiettivo dell'applicazione è creare uno spazio social dove gli utenti possono tenere traccia delle proprie visioni e confrontarsi con altri cinefili.

Funzionalità principali:

- Movie Tracking: Cerca e aggiungi i film che hai guardato al tuo diario personale.
- Recensioni e Voti: Condividi la tua opinione assegnando un voto e scrivendo una recensione.
- Interazione Social: Esplora i profili degli altri utenti, leggi le loro recensioni e interagisci lasciando mi piace o commenti.

## Caratteristiche principali

- Progetto basato su `Nuxt 3`
- Autenticazione e storage con `Supabase` (modulo `@nuxtjs/supabase`)
- API serverless locali in `server/api`
- Stili con Tailwind

## Prerequisiti

- Node.js 18+ (o versione compatibile con Nuxt 4)
- npm
- Chiavi Supabase e TMDB (vedi variabili d'ambiente)

## Installazione

1. Clona il repository ed entra nella cartella:

```bash
git clone <repo-url>
cd progetto-finale
```

2. Installa le dipendenze:

```bash
npm install
```

## Variabili d'ambiente

Questo progetto usa alcune variabili d'ambiente configurate in `nuxt.config.ts` sotto `runtimeConfig.public` e `runtimeConfig`:

- `NUXT_PUBLIC_SUPABASE_URL` — URL del progetto Supabase
- `NUXT_PUBLIC_SUPABASE_KEY` — Chiave pubblica Supabase
- `NUXT_SUPABASE_SECRET_KEY` — Chiave privata Supabase
- `TMDB_API_KEY` — Chiave per The Movie Database

Esempio `.env` (non committare mai le chiavi reali):

```env
NUXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=public-key
NUXT_SUPABASE_SECRET_KEY=secret-key
TMDB_API_KEY=your_tmdb_key
```

## Script utili

- `npm run dev` — avvia il server di sviluppo (porta predefinita: 3000)
- `npm run build` — costruisce l'app per produzione
- `npm run preview` — preview locale della build di produzione

## Struttura del progetto (solo elementi principali)

```
    /
    ├─ app/                 componenti Vue, pagine e asset del frontend
    │  ├─ assets/           immagini, stili e font
    │  ├─ components/       componenti Vue riutilizzabili
    │  ├─ pages/            pagine Vue (routing automatico)
    │  └─ utils/            funzioni JS frontend
    ├─ server/api/          endpoint API serverless
    ├─ shared/utils/        helper JS condivisi
    ├─ public/              asset statici (immagini, favicon, ecc.)
    ├─ package.json         configurazione npm
    └─ nuxt.config.ts       configurazione Nuxt
```

## Esempio di uso locale

1. Assicurati di aver impostato le variabili d'ambiente (vedi sopra).
2. Avvia il server di sviluppo:

```bash
npm run dev
```

Il sito sarà disponibile su `http://localhost:3000`.
