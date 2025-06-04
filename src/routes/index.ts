import { badgeServices, getServiceDescription, gitUrl } from "@config";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "application/json",
};

async function handler(request: ExtendedRequest): Promise<Response> {
	const endPerf: number = Date.now();
	const perf: number = endPerf - request.startPerf;

	const response = {
		name: "Badge Aggregator API",
		description:
			"A fast Discord badge aggregation API built with Bun and Redis caching",
		version: "1.0.0",
		author: "creations.works",
		repository: gitUrl,
		performance: {
			responseTime: `${perf}ms`,
			uptime: `${process.uptime()}s`,
		},
		routes: {
			"GET /": "API information and available routes",
			"GET /:userId": "Get badges for a Discord user",
			"GET /health": "Health check endpoint",
		},
		endpoints: {
			badges: {
				path: "/:userId",
				method: "GET",
				description: "Fetch badges for a Discord user",
				parameters: {
					path: {
						userId: "Discord User ID (17-20 digits)",
					},
					query: {
						services: "Comma/space separated list of services (optional)",
						cache: "Enable/disable caching (true/false, default: true)",
						seperated:
							"Return results grouped by service (true/false, default: false)",
					},
				},
				example: "/:userId?services=discord,vencord&seperated=true&cache=true",
			},
		},
		supportedServices: badgeServices.map((service) => ({
			name: service.service,
			description: getServiceDescription(service.service),
		})),
		ratelimit: {
			window: "60 seconds",
			requests: 60,
		},
	};

	return Response.json(response, {
		headers: {
			"Cache-Control": "public, max-age=300",
		},
	});
}

export { handler, routeDef };
