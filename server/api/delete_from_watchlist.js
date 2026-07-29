import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const movieId = getQuery(event).movieId;

	if (!user) {
		return { success: false, message: "User not authenticated" };
	}
	if (!movieId) {
		return { success: false, message: "Movie ID not provided" };
	}

	try {
		const { error } = await supabase
			.from("watch")
			.delete()
			.eq("user", user.sub)
			.eq("movie", movieId)
			.eq("watched", false);

		if (error) throw error;

		return { success: true, message: "Movie deleted from watchlist" };
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: err.message || "Error deleting movie from watchlist",
		};
	}
});
