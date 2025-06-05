import { echo } from "@atums/echo";
import {
	badgeFetchInterval,
	badgeServices,
	gitUrl,
	redisTtl,
	vencordEquicordContributorUrl,
} from "@config";
import { redis } from "bun";

class BadgeCacheManager {
	private updateInterval: Timer | null = null;
	private readonly CACHE_PREFIX = "badge_service_data:";
	private readonly CACHE_TIMESTAMP_PREFIX = "badge_cache_timestamp:";

	async initialize(): Promise<void> {
		echo.debug("Initializing badge cache manager...");

		const needsUpdate = await this.checkIfUpdateNeeded();
		if (needsUpdate) {
			await this.updateAllServiceData();
		} else {
			echo.debug("Badge cache is still valid, skipping initial update");
		}

		this.updateInterval = setInterval(
			() => this.updateAllServiceData(),
			badgeFetchInterval,
		);

		echo.debug("Badge cache manager initialized with 1-hour update interval");
	}

	async shutdown(): Promise<void> {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
			this.updateInterval = null;
		}
		echo.debug("Badge cache manager shut down");
	}

	private async checkIfUpdateNeeded(): Promise<boolean> {
		try {
			const staticServices = ["vencord", "equicord", "nekocord", "reviewdb"];
			const now = Date.now();

			for (const serviceName of staticServices) {
				const timestampKey = `${this.CACHE_TIMESTAMP_PREFIX}${serviceName}`;
				const cacheKey = `${this.CACHE_PREFIX}${serviceName}`;

				const [timestamp, data] = await Promise.all([
					redis.get(timestampKey),
					redis.get(cacheKey),
				]);

				if (!data || !timestamp) {
					echo.debug(`Cache missing for service: ${serviceName}`);
					return true;
				}

				const lastUpdate = Number.parseInt(timestamp, 10);
				if (now - lastUpdate > badgeFetchInterval) {
					echo.debug(`Cache expired for service: ${serviceName}`);
					return true;
				}
			}

			echo.debug("All service caches are valid");
			return false;
		} catch (error) {
			echo.warn({
				message: "Failed to check cache validity, forcing update",
				error: error instanceof Error ? error.message : String(error),
			});
			return true;
		}
	}

	private async updateAllServiceData(): Promise<void> {
		echo.debug("Updating badge service data...");

		const updatePromises = badgeServices.map(async (service: BadgeService) => {
			try {
				await this.updateServiceData(service);
			} catch (error) {
				echo.error({
					message: `Failed to update service data for ${service.service}`,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		});

		await Promise.allSettled(updatePromises);
		echo.debug("Badge service data update completed");
	}

	private async updateServiceData(service: BadgeService): Promise<void> {
		const serviceKey = service.service.toLowerCase();
		const cacheKey = `${this.CACHE_PREFIX}${serviceKey}`;
		const timestampKey = `${this.CACHE_TIMESTAMP_PREFIX}${serviceKey}`;

		try {
			let data: BadgeServiceData | null = null;

			switch (serviceKey) {
				case "vencord":
				case "equicord": {
					if (typeof service.url === "string") {
						const res = await fetch(service.url, {
							headers: {
								"User-Agent": `BadgeAPI/1.0 ${gitUrl}`,
							},
						});

						if (res.ok) {
							data = (await res.json()) as VencordEquicordData;
						}
					}

					if (typeof vencordEquicordContributorUrl === "string") {
						const contributorRes = await fetch(vencordEquicordContributorUrl, {
							headers: {
								"User-Agent": `BadgeAPI/1.0 ${gitUrl}`,
							},
						});

						if (contributorRes.ok) {
							const pluginData = await contributorRes.json();

							if (Array.isArray(pluginData)) {
								if (!data) {
									data = {} as VencordEquicordData;
								}

								const contributors = new Set<string>();

								for (const plugin of pluginData) {
									if (plugin.authors && Array.isArray(plugin.authors)) {
										const isEquicordPlugin =
											plugin.filePath &&
											typeof plugin.filePath === "string" &&
											plugin.filePath.includes("equicordplugins/");

										const shouldInclude =
											(serviceKey === "equicord" && isEquicordPlugin) ||
											(serviceKey === "vencord" && !isEquicordPlugin);

										if (shouldInclude) {
											for (const author of plugin.authors) {
												if (author.id) {
													contributors.add(author.id);
												}
											}
										}
									}
								}

								const badgeDetails =
									serviceKey === "vencord"
										? {
												tooltip: "Vencord Contributor",
												badge: "https://vencord.dev/assets/favicon.png",
											}
										: {
												tooltip: "Equicord Contributor",
												badge: "https://i.imgur.com/57ATLZu.png",
											};

								for (const authorId of contributors) {
									if (!data[authorId]) {
										data[authorId] = [];
									}

									const hasContributorBadge = data[authorId].some(
										(badge) => badge.tooltip === badgeDetails.tooltip,
									);

									if (!hasContributorBadge) {
										data[authorId].push(badgeDetails);
									}
								}
							}
						}
					}
					break;
				}

				case "nekocord": {
					if (typeof service.url === "string") {
						const res = await fetch(service.url, {
							headers: {
								"User-Agent": `BadgeAPI/1.0 ${gitUrl}`,
							},
						});

						if (res.ok) {
							data = (await res.json()) as NekocordData;
						}
					}
					break;
				}

				case "reviewdb": {
					if (typeof service.url === "string") {
						const res = await fetch(service.url, {
							headers: {
								"User-Agent": `BadgeAPI/1.0 ${gitUrl}`,
							},
						});

						if (res.ok) {
							data = (await res.json()) as ReviewDbData;
						}
					}
					break;
				}

				case "discord":
				case "enmity":
					return;

				default:
					echo.warn(`Unknown service type: ${serviceKey}`);
					return;
			}

			if (data) {
				const now = Date.now();
				await Promise.all([
					redis.set(cacheKey, JSON.stringify(data)),
					redis.set(timestampKey, now.toString()),
					redis.expire(cacheKey, redisTtl * 2),
					redis.expire(timestampKey, redisTtl * 2),
				]);

				echo.debug(`Updated cache for service: ${service.service}`);
			}
		} catch (error) {
			echo.warn({
				message: `Failed to fetch data for service: ${service.service}`,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	async getServiceData(serviceKey: string): Promise<BadgeServiceData | null> {
		const cacheKey = `${this.CACHE_PREFIX}${serviceKey}`;

		try {
			const cached = await redis.get(cacheKey);
			if (cached) {
				return JSON.parse(cached) as BadgeServiceData;
			}
		} catch (error) {
			echo.warn({
				message: `Failed to get cached data for service: ${serviceKey}`,
				error: error instanceof Error ? error.message : String(error),
			});
		}

		return null;
	}

	async getVencordEquicordData(
		serviceKey: string,
	): Promise<VencordEquicordData | null> {
		const data = await this.getServiceData(serviceKey);
		if (data && (serviceKey === "vencord" || serviceKey === "equicord")) {
			return data as VencordEquicordData;
		}
		return null;
	}

	async getNekocordData(): Promise<NekocordData | null> {
		const data = await this.getServiceData("nekocord");
		if (data) {
			return data as NekocordData;
		}
		return null;
	}

	async getReviewDbData(): Promise<ReviewDbData | null> {
		const data = await this.getServiceData("reviewdb");
		if (data) {
			return data as ReviewDbData;
		}
		return null;
	}

	async forceUpdateService(serviceName: string): Promise<void> {
		const service = badgeServices.find(
			(s: BadgeService) =>
				s.service.toLowerCase() === serviceName.toLowerCase(),
		);

		if (service) {
			await this.updateServiceData(service);
			echo.info(`Force updated service: ${serviceName}`);
		} else {
			throw new Error(`Service not found: ${serviceName}`);
		}
	}
}

export const badgeCacheManager = new BadgeCacheManager();
