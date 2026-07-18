import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	console.log("User ID:", user.sub);

	if (!user) {
		return { error: "User not authenticated" };
	}

	try {
		const { data, error } = await supabase
			.from("watch")
			.select("movie:movies(*)")
			.eq("user", user.sub)
			.eq("watched", true);

		if (error) {
			console.error(error);
			return { error: "Error fetching watchlist from Supabase" };
		}
		console.log("Data from Supabase:", data);
		console.log(data.length, "movies returned from Supabase");

		const movies = data.map((item) => {
			item.genre_ids = JSON.parse(item.genre_ids);
			return item;
		});

		return movies;
	} catch (error) {
		console.error(error);
		return { error: "Error fetching movies from TMDB" };
	}
});
