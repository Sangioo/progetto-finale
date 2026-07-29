import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);

	if (!user) {
		return { success: false, message: "User not authenticated" };
	}

	const { data: userProfile } = await supabase
		.from("users")
		.select("profile_pic_url")
		.eq("id", user.sub)
		.maybeSingle();

	try {
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

		return {
			success: true,
			message: "Profile picture deleted successfully",
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message:
				err.message || "Error deleting profile picture from Supabase",
		};
	}
});
