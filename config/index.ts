import { echo } from "@atums/echo";

const environment: Environment = {
	port: Number.parseInt(process.env.PORT || "8080", 10),
	host: process.env.HOST || "0.0.0.0",
	development:
		process.env.NODE_ENV === "development" || process.argv.includes("--dev"),
};

const redisTtl: number = process.env.REDIS_TTL
	? Number.parseInt(process.env.REDIS_TTL, 10)
	: 60 * 60 * 1; // 1 hour

const badgeFetchInterval: number = process.env.BADGE_FETCH_INTERVAL
	? Number.parseInt(process.env.BADGE_FETCH_INTERVAL, 10)
	: 60 * 60 * 1000; // 1 hour

const botToken: string | undefined = process.env.DISCORD_TOKEN;

function verifyRequiredVariables(): void {
	const requiredVariables = ["HOST", "PORT", "DISCORD_TOKEN"];

	let hasError = false;

	for (const key of requiredVariables) {
		const value = process.env[key];
		if (value === undefined || value.trim() === "") {
			echo.error(`Missing or empty environment variable: ${key}`);
			hasError = true;
		}
	}

	if (hasError) {
		process.exit(1);
	}
}

export * from "@config/constants";
export {
	environment,
	redisTtl,
	badgeFetchInterval,
	botToken,
	verifyRequiredVariables,
};
