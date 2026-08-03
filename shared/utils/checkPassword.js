/**
 * Checks if a password meets the security requirements.
 * @param {*} password password to check
 * @returns {Object} Object containing the validation result and individual criteria
 */
export const checkPassword = (password) => {
	const isLong = password.length >= 8;
	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasNumber = /[0-9]/.test(password);
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

	return {
		isValid:
			isLong &&
			hasUpperCase &&
			hasLowerCase &&
			hasNumber &&
			hasSpecialChar,
		isLong,
		hasUpperCase,
		hasLowerCase,
		hasNumber,
		hasSpecialChar,
	};
};
