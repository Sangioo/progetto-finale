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
			.select("movies:movies(*), content, score, time")
			.eq("user", user.sub)
			.order("time", { ascending: false });

		if (error) throw error;

		return { success: true, data };
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: err.message || "Error fetching user reviews from Supabase",
		};
	}
});
