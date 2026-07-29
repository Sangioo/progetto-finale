import {
	serverSupabaseServiceRole,
	serverSupabaseUser,
} from "#supabase/server";
import { readMultipartFormData } from "h3";

const AVATAR_BUCKET = "profile_pictures";
const ALLOWED_MIME_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
]);

const getAvatarExtension = (mimeType) => {
	switch (mimeType) {
		case "image/png":
			return "png";
		case "image/webp":
			return "webp";
		case "image/gif":
			return "gif";
		case "image/jpeg":
		default:
			return "jpg";
	}
};

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const user = await serverSupabaseUser(event);
	const parts = await readMultipartFormData(event);
	const profilePicturePart = parts?.find(
		(part) => part.name === "profile_picture",
	);

	if (!user) {
		return {
			success: false,
			message: "User not authenticated",
		};
	}

	if (!profilePicturePart?.data) {
		return {
			success: false,
			message: "Profile picture not provided",
		};
	}

	const contentType = profilePicturePart.type || "unknown";
	if (!ALLOWED_MIME_TYPES.has(contentType)) {
		return {
			success: false,
			message: "Invalid profile picture format",
		};
	}

	try {
		const extension = getAvatarExtension(contentType);
		const filePath = `${user.sub}.${extension}`;

		const { error: uploadError } = await supabase.storage
			.from(AVATAR_BUCKET)
			.upload(filePath, profilePicturePart.data, {
				contentType,
				upsert: true,
			});

		if (uploadError) throw uploadError;

		const { data: publicUrlData } = supabase.storage
			.from(AVATAR_BUCKET)
			.getPublicUrl(filePath);
		const profilePicture = publicUrlData.publicUrl;

		const { error: userTableError } = await supabase.from("users").upsert(
			{
				id: user.sub,
				email: user.email,
				username: user?.user_metadata?.username || null,
				profile_pic_url: profilePicture,
			},
			{ onConflict: "id" },
		);

		if (userTableError) {
			await supabase.storage.from(AVATAR_BUCKET).remove([filePath]);
			throw userTableError;
		}

		const { error } = await supabase.auth.admin.updateUserById(user.sub, {
			user_metadata: { profile_picture: profilePicture },
		});

		if (error) {
			await supabase.storage.from(AVATAR_BUCKET).remove([filePath]);
			throw error;
		}

		return {
			success: true,
			message: "Profile picture updated successfully",
			path: publicUrlData.publicUrl,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message:
				err.message || "Error updating profile picture in Supabase",
		};
	}
});
