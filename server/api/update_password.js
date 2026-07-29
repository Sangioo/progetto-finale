import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
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
		const { error } = await supabase.auth.admin.updateUserById(user.sub, {
			password: newPassword,
		});

		if (error) throw error;

		return { success: true, message: "Password updated successfully" };
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: err.message || "Error updating password in Supabase",
		};
	}
});
