import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole();
	const user = await serverSupabaseUser(event);
	const movieId = event.context.params.movieId;
	console.log("User ID:", user.sub, ", Movie ID:", movieId);

	if (!user) {
		return { success: false, message: "User not authenticated" };
	}
	if (!movieId) {
		return { success: false, message: "Movie ID not provided" };
	}

	try {
		const { data, error } = await supabase.from("watch").insert({
			user: user.sub,
			movie: movieId,
			watched: false,
		});

		if (error.code === "23505") {
			console.log("Movie already in watchlist");
			return {
				success: false,
				message: "Movie already in watchlist",
			};
		}

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error fetching watchlist from Supabase",
			};
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
		return {
			success: false,
			message: "Error fetching watchlist from Supabase",
		};
	}
});
