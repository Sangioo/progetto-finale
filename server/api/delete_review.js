import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const movieId = event.context.params.movieId;

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
		const { data, error } = await supabase
			.from("reviews")
			.delete()
			.eq("movie", movieId)
			.eq("user", user.id);

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error fetching movie reviews from Supabase",
			};
		}

		return { success: true, message: "Review deleted successfully" };
	} catch (error) {
		console.error("Error fetching movie reviews:", error);
		throw error;
	}
});
