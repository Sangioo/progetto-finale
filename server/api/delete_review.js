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
		return {
			success: false,
			message: "Movie ID is required",
		};
	}

	try {
		const { error } = await supabase
			.from("reviews")
			.delete()
			.eq("movie", movieId)
			.eq("user", user.id);

		if (error) throw error;

		return { success: true, message: "Review deleted successfully" };
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: err.message || "Error deleting review",
		};
	}
});
