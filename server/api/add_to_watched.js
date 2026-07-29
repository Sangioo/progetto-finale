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
		const { error } = await supabase.from("watch").upsert({
			user: user.sub,
			movie: movieId,
			watched: true,
		});

		if (error) throw error;

		return { success: true, message: "Movie added to watched movies" };
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: err.message || "Error adding movie to watched list",
		};
	}
});
