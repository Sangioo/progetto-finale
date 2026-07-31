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
			supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
			supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,

			baseUrl: "http://localhost:3000",
			apiUrl: "http://localhost:3000/api",
			imageUrl: "https://image.tmdb.org/t/p/w342",

			discover: "discover",
			search: "search",
			getWatchlist: "get_watchlist",
			addToWatchlist: "add_to_watchlist",
			deleteFromWatchlist: "delete_from_watchlist",
			getWatched: "get_watched",
			addToWatched: "add_to_watched",
			deleteFromWatched: "delete_from_watched",
			getReviews: "get_movie_reviews",
			getMyReviews: "get_my_reviews",
			addReview: "add_review",
			deleteReview: "delete_review",
			addProfilePicture: "add_profile_picture",
			deleteProfilePicture: "delete_profile_picture",
			updatePassword: "update_password",
		},
		supabaseSecretKey: process.env.NUXT_SUPABASE_SECRET_KEY,
		tmdbApiKey: process.env.TMDB_API_KEY,
	},
});
