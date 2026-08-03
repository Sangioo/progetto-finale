import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const body = await readBody(event);
	const payload = typeof body === "string" ? JSON.parse(body) : body;
	const newPassword = payload?.newPassword;

	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: "User not authenticated",
		});
	}
	if (!newPassword) {
		throw createError({
			statusCode: 400,
			statusMessage: "New password not provided",
		});
	}

	try {
		const { error } = await supabase.auth.admin.updateUserById(user.sub, {
			password: newPassword,
		});

		if (error) throw error;

		return;
	} catch (error) {
		console.error(error);
		if (error?.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage:
				error.message || "Error updating password in Supabase",
		});
	}
});
