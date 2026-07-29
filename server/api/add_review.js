import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const movieId = getQuery(event).movieId;
	const content = getQuery(event).content;
	const score = getQuery(event).score;

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
		const { data: userData, error: userError } = await supabase
			.from("reviews")
			.select("*")
			.eq("user", user.sub)
			.eq("movie", movieId);

		if (userError) throw userError;

		if (userData.length > 0)
			throw new Error("User has already reviewed this movie");

		const { error } = await supabase.from("reviews").insert({
			user: user.sub,
			movie: movieId,
			content: content,
			score: score,
		});

		if (error) throw error;

		return { success: true, message: "Review added successfully" };
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: err.message || "Error adding review",
		};
	}
});
