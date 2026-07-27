import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const movieId = event.context.params.movieId;
	const content = event.context.params.content;
	const score = event.context.params.score;

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
			.eq("movie", movieId)
			.single();

		if (userError) {
			console.error(userError);
			return {
				success: false,
				message: "Error checking existing review",
			};
		}

		if (userData) {
			return {
				success: false,
				message: "User has already reviewed this movie",
			};
		}

		const { data, error } = await supabase.from("reviews").insert({
			user: user.sub,
			movie: movieId,
			content: content,
			score: score,
		});

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error fetching movie reviews from Supabase",
			};
		}

		return data;
	} catch (error) {
		console.error("Error fetching movie reviews:", error);
		throw error;
	}
});
