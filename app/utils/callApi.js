export const callApi = async ({
	endpoint,
	method = "GET",
	query = {},
	body,
	headers = {},
	parseJson = true,
}) => {
	const config = useRuntimeConfig();

	try {
		const response = await $fetch(`${config.public.apiUrl}/${endpoint}`, {
			method,
			query,
			body,
			credentials: "include",
			headers: {
				...headers,
			},
			responseType: parseJson ? "json" : "text",
		});

		return response;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
