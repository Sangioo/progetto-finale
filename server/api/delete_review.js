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
			statusMessage: "Movie ID is required",
		});
	}

	try {
		const { error } = await supabase
			.from("reviews")
			.delete()
			.eq("movie", movieId)
			.eq("user", user.sub);

		if (error) throw error;

		return;
	} catch (error) {
		console.error(error);
		if (error?.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage: error.message || "Error deleting review",
		});
	}
});
