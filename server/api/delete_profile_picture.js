import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);

	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: "User not authenticated",
		});
	}

	try {
		const { data: userProfile, error: userProfileError } = await supabase
			.from("users")
			.select("profile_pic_url")
			.eq("id", user.sub)
			.maybeSingle();

		if (userProfileError) throw userProfileError;

		const filePath = userProfile?.profile_pic_url?.split("/").pop();

		if (filePath) {
			const { error } = await supabase.storage
				.from("profile_pictures")
				.remove([filePath]);

			if (error) throw error;
		}

		const { error: userTableError } = await supabase
			.from("users")
			.update({ profile_pic_url: null })
			.eq("id", user.sub);

		if (userTableError) throw userTableError;

		const { error: authError } = await supabase.auth.admin.updateUserById(
			user.sub,
			{
				user_metadata: { profile_pic_url: null },
			},
		);

		if (authError) throw authError;

		return;
	} catch (error) {
		console.error(error);
		if (error?.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage:
				error.message || "Error deleting profile picture from Supabase",
		});
	}
});
