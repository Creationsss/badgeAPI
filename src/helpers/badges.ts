import { badgeServices, redisTtl } from "@config/environment";
import { fetch, redis } from "bun";

export async function fetchBadges(
	userId: string,
	services: string[],
	options?: FetchBadgesOptions,
): Promise<BadgeResult> {
	const { nocache = false, separated = false } = options ?? {};
	const results: Record<string, Badge[]> = {};

	await Promise.all(
		services.map(async (service) => {
			const entry = badgeServices.find(
				(s) => s.service.toLowerCase() === service.toLowerCase(),
			);
			if (!entry) return;

			const serviceKey = service.toLowerCase();
			const cacheKey = `badges:${serviceKey}:${userId}`;

			if (!nocache) {
				const cached = await redis.get(cacheKey);
				if (cached) {
					try {
						const parsed: Badge[] = JSON.parse(cached);
						results[serviceKey] = parsed;
						return;
					} catch {
						// corrupted cache, proceed with fetch :p
					}
				}
			}

			let url: string;
			if (typeof entry.url === "function") {
				url = entry.url(userId);
			} else {
				url = entry.url;
			}

			try {
				const res = await fetch(url);
				if (!res.ok) return;
				const data = await res.json();

				const result: Badge[] = [];

				switch (serviceKey) {
					case "vencord":
					case "equicord": {
						const userBadges = data[userId];
						if (Array.isArray(userBadges)) {
							for (const b of userBadges) {
								result.push({
									tooltip: b.tooltip,
									badge: b.badge,
								});
							}
						}
						break;
					}

					case "nekocord": {
						const userBadgeIds = data.users?.[userId]?.badges;
						if (Array.isArray(userBadgeIds)) {
							for (const id of userBadgeIds) {
								const badgeInfo = data.badges?.[id];
								if (badgeInfo) {
									result.push({
										tooltip: badgeInfo.name,
										badge: badgeInfo.image,
									});
								}
							}
						}
						break;
					}

					case "reviewdb": {
						for (const b of data) {
							if (b.discordID === userId) {
								result.push({
									tooltip: b.name,
									badge: b.icon,
								});
							}
						}
						break;
					}
				}

				if (result.length > 0) {
					results[serviceKey] = result;
					if (!nocache) {
						await redis.set(cacheKey, JSON.stringify(result));
						await redis.expire(cacheKey, redisTtl);
					}
				}
			} catch (_) {}
		}),
	);

	if (separated) return results;

	const combined: Badge[] = [];
	for (const group of Object.values(results)) {
		combined.push(...group);
	}
	return combined;
}
