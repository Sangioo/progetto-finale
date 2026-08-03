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
		const { error } = await supabase
			.from("watch")
			.delete()
			.eq("user", user.sub)
			.eq("movie", movieId)
			.eq("watched", false);

		if (error) throw error;

		return;
	} catch (error) {
		console.error(error);
		if (error?.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage:
				error.message || "Error deleting movie from watchlist",
		});
	}
});
