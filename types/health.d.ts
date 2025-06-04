interface CacheInfo {
	timestamp: string | null;
	age: string;
}

interface HealthResponse {
	status: "ok" | "degraded";
	timestamp: string;
	uptime: number;
	services: {
		redis: "ok" | "error" | "unknown";
	};
	cache: {
		lastFetched: Record<string, CacheInfo> | { error: string };
		nextUpdate: string | null;
	};
}
