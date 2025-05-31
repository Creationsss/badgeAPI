import { echo } from "@atums/echo";

import { serverHandler } from "@/server";

async function main(): Promise<void> {
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
	console.log("Server Started");
}
