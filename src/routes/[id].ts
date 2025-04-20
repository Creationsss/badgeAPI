import { badgeServices } from "@config/environment";
import { fetchBadges } from "@helpers/badges";
import { parseServices, validateID } from "@helpers/char";

function isValidServices(services: string[]): boolean {
	if (!Array.isArray(services)) return false;
	if (services.length === 0) return false;

	const validServices = badgeServices.map((s) => s.service.toLowerCase());
	return services.every((s) => validServices.includes(s.toLowerCase()));
}

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "application/json",
};

async function handler(request: ExtendedRequest): Promise<Response> {
	const { id: userId } = request.params;
	const { services, cache, seperated } = request.query;

	let validServices: string[];

	if (!validateID(userId)) {
		return Response.json(
			{
				status: 400,
				error: "Invalid Discord User ID",
			},
			{
				status: 400,
			},
		);
	}

	if (services) {
		const parsed = parseServices(services);

		if (parsed.length > 0) {
			if (!isValidServices(parsed)) {
				return Response.json(
					{
						status: 400,
						error: "Invalid Services",
					},
					{
						status: 400,
					},
				);
			}

			validServices = parsed;
		} else {
			validServices = badgeServices.map((b) => b.service);
		}
	} else {
		validServices = badgeServices.map((b) => b.service);
	}

	const badges: BadgeResult = await fetchBadges(
		userId,
		validServices,
		{
			nocache: cache !== "true",
			separated: seperated === "true",
		},
		request,
	);

	if (badges instanceof Error) {
		return Response.json(
			{
				status: 500,
				error: badges.message,
			},
			{
				status: 500,
			},
		);
	}

	if (badges.length === 0) {
		return Response.json(
			{
				status: 404,
				error: "No Badges Found",
			},
			{
				status: 404,
			},
		);
	}

	return Response.json(
		{
			status: 200,
			badges,
		},
		{
			status: 200,
			headers: {
				"Cache-Control": "public, max-age=60",
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
				"Access-Control-Max-Age": "86400",
				"Access-Control-Allow-Credentials": "true",
				"Access-Control-Expose-Headers": "Content-Type",
			},
		},
	);
}

export { handler, routeDef };
