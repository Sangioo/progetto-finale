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
			.select("movie:movies(*)")
			.eq("user", user.sub)
			.eq("watched", false);

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error fetching watchlist from Supabase",
			};
		}

		const movies = data.map((item) => {
			item.genre_ids = JSON.parse(item.genre_ids);
			return item;
		});

		return { success: true, movies };
	} catch (error) {
		console.error(error);
		return { success: false, message: "Error fetching movies from TMDB" };
	}
});
