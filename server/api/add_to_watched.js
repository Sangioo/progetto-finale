import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const movieId = getQuery(event).movieId;

	if (!user) {
		return { success: false, message: "User not authenticated" };
	}
	if (!movieId) {
		return { success: false, message: "Movie ID not provided" };
	}

	try {
		const { data, error } = await supabase.from("watch").upsert({
			user: user.sub,
			movie: movieId,
			watched: true,
		});

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error fetching watched movies from Supabase",
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
			message: "Error fetching watched movies from Supabase",
		};
	}
});
