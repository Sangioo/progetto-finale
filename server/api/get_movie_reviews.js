import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const movieId = event.context.params.movieId;

	console.log("Fetching reviews for movie ID:", movieId);
	if (!movieId) {
		console.error("Movie ID is missing in the request parameters.");
		return {
			success: false,
			message: "Movie ID is required",
		};
	}

	try {
		const { data, error } = await supabase
			.from("reviews")
			.select("*")
			.eq("movie_id", movieId);

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error fetching movie reviews from Supabase",
			};
		}
		return { success: true, data };
	} catch (error) {
		console.error("Error fetching movie reviews:", error);
		throw error;
	}
});
