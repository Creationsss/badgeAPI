import { echo } from "@atums/echo";
import { verifyRequiredVariables } from "@config";
import { badgeCacheManager } from "@lib/badgeCache";
import { serverHandler } from "@server";

async function main(): Promise<void> {
	verifyRequiredVariables();

	await badgeCacheManager.initialize();

	process.on("SIGINT", async () => {
		echo.debug("Received SIGINT, shutting down gracefully...");
		await badgeCacheManager.shutdown();
		process.exit(0);
	});

	process.on("SIGTERM", async () => {
		echo.debug("Received SIGTERM, shutting down gracefully...");
		await badgeCacheManager.shutdown();
		process.exit(0);
	});

	serverHandler.initialize();
}

main().catch((error: Error) => {
	echo.error({
		message: "Error initializing the server",
		error: error.message,
	});
	process.exit(1);
});

if (process.env.IN_PTERODACTYL === "true") {
	// biome-ignore lint/suspicious/noConsole: Needed for Pterodactyl to actually know the server started
	console.log("Server Started");
}
