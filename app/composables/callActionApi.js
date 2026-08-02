export const callActionApi = async (endpoint, movieId) => {
	const config = useRuntimeConfig();

	try {
		const response = await fetch(
			`${config.public.apiUrl}/${endpoint}?movieId=${movieId}`,
			{
				method: "GET",
				credentials: "include",
			},
		);

		if (!response.ok) throw new Error(response.statusText);

		return response;
	} catch (error) {
		console.error("Errore API:", error);
		throw error;
	}
};
