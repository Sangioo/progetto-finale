import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const movieId = getQuery(event).movieId;
	const content = getQuery(event).content;
	const score = getQuery(event).score;

	if (!user)
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

	if (!movieId)
		throw createError({
			statusCode: 400,
			statusMessage: "Missing movieId",
		});

	const { data: userData, error: userError } = await supabase
		.from("reviews")
		.select("*")
		.eq("user", user.sub)
		.eq("movie", movieId);

	if (userError) throw userError;

	if (userData.length > 0)
		throw createError({
			statusCode: 400,
			statusMessage: "User has already reviewed this movie",
		});

	const { data: movieData, error: movieError } = await supabase
		.from("watch")
		.select("*")
		.eq("movie", movieId)
		.eq("user", user.sub);

	if (movieError) throw movieError;

	if (movieData.length === 0 || !movieData[0].watched)
		throw createError({
			statusCode: 400,
			statusMessage: "User has not watched this movie",
		});

	const { error: reviewError } = await supabase.from("reviews").insert({
		user: user.sub,
		movie: movieId,
		content: content,
		score: score,
	});

	if (reviewError) throw reviewError;

	return { message: "Review added successfully" };
});
