export const callApi = async ({
	endpoint,
	method = "GET",
	query = {},
	body,
	headers = {},
	parseJson = true,
}) => {
	const config = useRuntimeConfig();

	const url = new URL(`${config.public.apiUrl}/${endpoint}`);

	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== null) {
			url.searchParams.set(key, String(value));
		}
	}

	const response = await fetch(url.toString(), {
		method,
		credentials: "include",
		headers: {
			...headers,
		},
		body,
	});

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	if (!parseJson) {
		return response;
	}

	return await response.json();
};
