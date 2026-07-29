import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);

	if (!user) {
		return { success: false, message: "User not authenticated" };
	}

	try {
		const { data, error } = await supabase
			.from("watch")
			.select("movies:movies(*)")
			.eq("user", user.sub)
			.eq("watched", true);

		if (error) throw error;

		const movies = data.map((item) => {
			item.movies.genre_ids = JSON.parse(item.movies.genre_ids);
			item = item.movies; // Extract the movie object from the wrapper
			item.watchStatus = 2; // Set watchStatus to 2 for watched movies
			return item;
		});

		return { success: true, movies };
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message:
				err.message || "Error fetching watched movies from Supabase",
		};
	}
});
