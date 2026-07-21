import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);

	if (!user.sub) {
		return { success: false, message: "User ID not provided" };
	}

	try {
		const filePath = user?.user_metadata?.profile_picture?.split("/").pop();

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
