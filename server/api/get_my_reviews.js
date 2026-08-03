import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";
export default defineEventHandler(async (event) => {
	const user = await serverSupabaseUser(event);
	const supabase = serverSupabaseServiceRole(event);

	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: "User not authenticated",
		});
	}

	try {
		const { data, error } = await supabase
			.from("reviews")
			.select("movie:movies(*), content, score, time")
			.eq("user", user.sub)
			.order("time", { ascending: false });

		if (error) throw error;

		const movies = data.map(({ movie, ...rest }) => ({
			...movie,
			genre_ids: JSON.parse(movie.genre_ids),
			...rest,
		}));

		return movies;
	} catch (error) {
		console.error(error);
		if (error?.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage:
				error.message || "Error fetching user reviews from Supabase",
		});
	}
});
