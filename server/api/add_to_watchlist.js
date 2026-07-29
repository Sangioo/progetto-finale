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
		const { error } = await supabase.from("watch").insert({
			user: user.sub,
			movie: movieId,
			watched: false,
		});

		if (error.code === "23505") {
			return {
				success: false,
				message: "Movie already in watchlist",
			};
		}

		if (error) throw error;

		return { success: true, message: "Movie added to watchlist" };
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: err.message || "Error adding movie to watchlist",
		};
	}
});
