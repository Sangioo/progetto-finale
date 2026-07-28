import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	css: ["~/assets/css/main.css"],

	vite: {
		plugins: [tailwindcss()],
	},

	app: {
		head: {
			title: "FrameLog",
			htmlAttrs: {
				lang: "en",
			},
			link: [{ rel: "icon", type: "image/x-icon", href: "/logo.svg" }],
			charset: "utf-16",
			viewport: "width=device-width, initial-scale=1.0, maximum-scale=1",
		},
	},

	modules: ["@nuxtjs/supabase"],
	supabase: {
		redirect: true,
		redirectOptions: {
			login: "/login",
			callback: "/login",
			exclude: ["/login", "/register", "/"],
		},
		types: "~/types/database.types.ts",
	},

	runtimeConfig: {
		public: {
			supabaseUrl: process.env.SUPABASE_URL,
			supabaseKey: process.env.SUPABASE_KEY,
			baseUrl: process.env.VITE_BASE_URL,
			apiUrl: process.env.VITE_API_URL,
			imageUrl: process.env.VITE_IMAGE_URL,
			discover: process.env.VITE_DISCOVER_ENDPOINT,
			search: process.env.VITE_SEARCH_ENDPOINT,
			chat: process.env.VITE_CHAT_ENDPOINT,
			live: process.env.VITE_LIVE_ENDPOINT,
			startWatching: process.env.VITE_START_WATCHING_ENDPOINT,
			stopWatching: process.env.VITE_STOP_WATCHING_ENDPOINT,
			message: process.env.VITE_MESSAGE_ENDPOINT,
			getWatchlist: process.env.VITE_GET_WATCHLIST_ENDPOINT,
			addToWatchlist: process.env.VITE_ADD_TO_WATCHLIST_ENDPOINT,
			deleteFromWatchlist:
				process.env.VITE_DELETE_FROM_WATCHLIST_ENDPOINT,
			getWatched: process.env.VITE_GET_WATCHED_ENDPOINT,
			addToWatched: process.env.VITE_ADD_TO_WATCHED_ENDPOINT,
			deleteFromWatched: process.env.VITE_DELETE_FROM_WATCHED_ENDPOINT,
			getReviews: process.env.VITE_GET_REVIEWS_ENDPOINT,
			addReview: process.env.VITE_ADD_REVIEW_ENDPOINT,
			deleteReview: process.env.VITE_DEL_REVIEW_ENDPOINT,
			getMyReviews: process.env.VITE_GET_MYREVIEWS_ENDPOINT,
			uploadProfilePicture:
				process.env.VITE_UPLOAD_PROFILE_PICTURE_ENDPOINT,
			deleteProfilePicture:
				process.env.VITE_DELETE_PROFILE_PICTURE_ENDPOINT,
			updatePassword: process.env.VITE_UPDATE_PASSWORD_ENDPOINT,
		},
		TMDB_API_KEY:
			"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2N2Y0ZTcwNjE0NmYxYzllYmVlZTU4ZThmM2NhYWYzZiIsIm5iZiI6MTc3NzY0MTMzMC40NzYsInN1YiI6IjY5ZjRhNzcyMjNlNTkzMjA3MzU3ZTUxYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.4zLIA2of702QQVdyrHN0u_XHLoyo7m8dD6rxdBYWM5s",
	},
});
