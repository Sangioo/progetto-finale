import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole();
	const user = await serverSupabaseUser(event);
	const body = await readBody(event);
	const { newPassword } = body;

	if (!user) {
		return { success: false, message: "User not authenticated" };
	}
	if (!newPassword) {
		return { success: false, message: "New password not provided" };
	}

	try {
		const { data, error } = await supabase.auth.admin.updateUserById(
			user.sub,
			{
				password: newPassword,
			},
		);

		if (error) {
			console.error(error);
			return {
				success: false,
				message: "Error updating password in Supabase",
			};
		}

		console.log("Data from Supabase:", data);

		return { success: true, message: "Password updated successfully" };
	} catch (error) {
		console.error(error);
		return {
			success: false,
			message: "Error updating password in Supabase",
		};
	}
});
