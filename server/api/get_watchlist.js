import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);

	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: "User not authenticated",
		});
	}

	try {
		const { data, error } = await supabase
			.from("watch")
			.select("movies:movies(*)")
			.eq("user", user.sub)
			.eq("watched", false);

		if (error) throw error;

		const movies = data.map((item) => {
			item.movies.genre_ids = JSON.parse(item.movies.genre_ids);
			item = item.movies; // Extract the movies object from the wrapper
			item.watchStatus = 1; // Set watchStatus to 1 for watchlist
			return item;
		});

		return movies;
	} catch (error) {
		console.error(error);
		if (error?.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage:
				error.message || "Error fetching watchlist from Supabase",
		});
	}
});
