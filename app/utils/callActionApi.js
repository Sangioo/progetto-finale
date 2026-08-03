export const callActionApi = async (endpoint, movieId) => {
	return await callApi({
		endpoint,
		method: "GET",
		query: { movieId },
		parseJson: false,
	});
};
