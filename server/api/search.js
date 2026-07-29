import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
	const defaultParams = {
		include_adult: false,
		include_video: false,
		language: "it-IT",
	};

	const supabase = serverSupabaseServiceRole(event);
	const config = useRuntimeConfig();

	const query = { ...defaultParams, ...getQuery(event) };

	try {
		const response = await $fetch(
			"https://api.themoviedb.org/3/search/movie",
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${config.TMDB_API_KEY}`,
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

		const { data, error } = await supabase
			.from("movies")
			.upsert(movies)
			.select();

		if (error) throw error;

		return data;
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: err.message || "Error searching movies from TMDB",
		};
	}
});
