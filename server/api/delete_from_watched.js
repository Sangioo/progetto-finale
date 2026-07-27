import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole();
	const user = await serverSupabaseUser(event);
	const movieId = getQuery(event).movieId;

	if (!user) {
		return { success: false, message: "User not authenticated" };
	}
	if (!movieId) {
		return { success: false, message: "Movie ID not provided" };
	}

	try {
		const { data, error } = await supabase
			.from("watch")
			.delete()
			.eq("user", user.sub)
			.eq("movie", movieId)
			.eq("watched", true);

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error deleting movie from watched movies",
			};
		}
		console.log("Data from Supabase:", data);
		console.log(data.length, "movies returned from Supabase");

		return { success: true, message: "Movie deleted from watched movies" };
	} catch (error) {
		console.error(error);
		return {
			success: false,
			message: "Error deleting movie from watched movies",
		};
	}
});
