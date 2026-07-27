import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);

	if (!user?.sub) {
		return { success: false, message: "User ID not provided" };
	}

	const { data: userProfile } = await supabase
		.from("users")
		.select("profile_pic_url")
		.eq("id", user.sub)
		.maybeSingle();

	try {
		const filePath = userProfile?.profile_pic_url?.split("/").pop();

		if (filePath) {
			const { data, error } = await supabase.storage
				.from("profile_pictures")
				.remove([filePath]);

			if (error) {
				console.error(error);
				return {
					success: false,
					message: "Error deleting profile picture from Supabase",
				};
			}

			console.log("Data from Supabase:", data);
		}

		const { error: userTableError } = await supabase
			.from("users")
			.update({ profile_pic_url: null })
			.eq("id", user.sub);

		if (userTableError) {
			console.error(userTableError);
			return {
				success: false,
				message: "Error updating user profile in Supabase",
			};
		}
		return {
			success: true,
			message: "Profile picture deleted successfully",
		};
	} catch (error) {
		console.error(error);
		return {
			success: false,
			message: "Error deleting profile picture from Supabase",
		};
	}
});
