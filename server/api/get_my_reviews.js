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
			.select("movies:movies(*)")
			.eq("user", user.sub)
			.order("time", { ascending: false });

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error fetching reviews from Supabase",
			};
		}
		return { success: true, data };
	} catch (error) {
		console.error("Error fetching reviews:", error);
		throw error;
	}
});
