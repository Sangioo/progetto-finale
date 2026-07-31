import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";
export default defineEventHandler(async (event) => {
	const user = await serverSupabaseUser(event);
	const supabase = serverSupabaseServiceRole(event);

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

		return { success: true, data: movies };
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: err.message || "Error fetching user reviews from Supabase",
		};
	}
});
