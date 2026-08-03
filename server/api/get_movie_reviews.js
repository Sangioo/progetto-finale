import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const movieId = getQuery(event).movieId;

	if (!movieId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Movie ID is required",
		});
	}

	try {
		const { data, error } = await supabase
			.from("reviews")
			.select(
				"*, reviewer:users(username, profile_pic_url), movie:movies(*)",
			)
			.eq("movie", movieId);

		if (error) throw error;

		const movies = data.map(({ reviewer, movie, ...review }) => ({
			username: reviewer?.username || null,
			profile_pic_url: reviewer?.profile_pic_url || null,
			...movie,
			...review,
		}));

		return movies;
	} catch (error) {
		console.error("Error fetching movie reviews:", error);
		if (error?.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage:
				error.message || "Error fetching movie reviews from Supabase",
		});
	}
});
