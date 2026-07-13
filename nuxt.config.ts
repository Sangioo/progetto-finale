import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	css: ["./app/assets/css/main.css"],

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
		TMDB_API_KEY:
			"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2N2Y0ZTcwNjE0NmYxYzllYmVlZTU4ZThmM2NhYWYzZiIsIm5iZiI6MTc3NzY0MTMzMC40NzYsInN1YiI6IjY5ZjRhNzcyMjNlNTkzMjA3MzU3ZTUxYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.4zLIA2of702QQVdyrHN0u_XHLoyo7m8dD6rxdBYWM5s",
	},
});
