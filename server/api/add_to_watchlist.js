import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const movieId = getQuery(event).movieId;

	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: "User not authenticated",
		});
	}
	if (!movieId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Movie ID not provided",
		});
	}

	try {
		const { error } = await supabase.from("watch").insert({
			user: user.sub,
			movie: movieId,
			watched: false,
		});

		if (error && error.code === "23505") {
			throw createError({
				statusCode: 409,
				statusMessage: "Movie already in watchlist",
			});
		}

		if (error) throw error;

		return;
	} catch (error) {
		console.error(error);
		if (error?.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage: error.message || "Error adding movie to watchlist",
		});
	}
});
