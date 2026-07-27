import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const movieId = getQuery(event).movieId;

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
			.select("*, reviewer:users(username, profile_pic_url)")
			.eq("movie", movieId);

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error fetching movie reviews from Supabase",
			};
		}
		const enrichedData = data.map(({ reviewer, ...review }) => ({
			...review,
			username: reviewer?.username || null,
			profile_pic_url: reviewer?.profile_pic_url || null,
		}));

		return { success: true, data: enrichedData };
	} catch (error) {
		console.error("Error fetching movie reviews:", error);
		throw error;
	}
});
