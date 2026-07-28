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

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error fetching watched movies from Supabase",
			};
		}

		const movies = data.map((item) => {
			item.movies.genre_ids = JSON.parse(item.movies.genre_ids);
			item = item.movies; // Extract the movie object from the wrapper
			return item;
		});

		return { success: true, movies };
	} catch (error) {
		console.error(error);
		return {
			success: false,
			message: "Error fetching movies from Supabase",
		};
	}
});
