import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const movieId = getQuery(event).movieId;

	if (!movieId) {
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

		if (error) throw error;

		const enrichedData = data.map(({ reviewer, ...review }) => ({
			...review,
			username: reviewer?.username || null,
			profile_pic_url: reviewer?.profile_pic_url || null,
		}));

		return { success: true, data: enrichedData };
	} catch (err) {
		console.error("Error fetching movie reviews:", err);
		return {
			success: false,
			message:
				err.message || "Error fetching movie reviews from Supabase",
		};
	}
});
