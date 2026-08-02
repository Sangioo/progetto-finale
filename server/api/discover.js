import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const defaultParams = {
		include_adult: false,
		include_video: false,
		language: "it-IT",
	};

	const supabase = serverSupabaseServiceRole(event);
	const config = useRuntimeConfig();
	const user = await serverSupabaseUser(event);

	const query = { ...defaultParams, ...getQuery(event) };

	try {
		const response = await $fetch(
			"https://api.themoviedb.org/3/discover/movie",
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${config.tmdbApiKey}`,
					"Content-Type": "application/json;charset=utf-8",
					accept: "application/json",
				},
				params: query,
			},
		);

		const movies = response.results.map((movie) => ({
			id: movie.id,
			title: movie.title,
			original_language: movie.original_language,
			original_title: movie.original_title,
			overview: movie.overview,
			poster_path: movie.poster_path,
			release_date: movie.release_date || "1900-01-01", // Default date if release_date is null
			vote_average: movie.vote_average,
			genre_ids: JSON.stringify(movie.genre_ids),
			backdrop_path: movie.backdrop_path,
		}));

		if (!user) {
			return movies.map((movie) => ({
				...movie,
				genre_ids: movie.genre_ids ? JSON.parse(movie.genre_ids) : [],
				watchStatus: 0, // Not watched
			}));
		}

		const { data, error } = await supabase
			.from("movies")
			.upsert(movies)
			.select("*, watch(*)")
			.eq("watch.user", user.sub);

		if (error) throw error;

		const toReturn = data.map((movie) => {
			const watched = movie?.watch[0]?.watched;
			let watchStatus;
			if (watched === undefined) {
				watchStatus = 0;
			} else if (watched) {
				watchStatus = 2;
			} else {
				watchStatus = 1;
			}
			return {
				...movie,
				genre_ids: JSON.parse(movie.genre_ids),
				watchStatus,
			};
		});

		return toReturn;
	} catch (err) {
		console.error(err);
		throw createError({
			statusCode: 500,
			statusMessage:
				err.message || "Errore durante il recupero dei film.",
		});
	}
});
