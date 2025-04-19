const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "application/json",
};

async function handler(request: ExtendedRequest): Promise<Response> {
	const endPerf: number = Date.now();
	const perf: number = endPerf - request.startPerf;

	const { query, params } = request;

	const response: Record<string, unknown> = {
		perf,
		query,
		params,
	};

	return Response.json(response);
}

export { handler, routeDef };
