import { discordBadgeDetails, discordBadges } from "@config/discordBadges";
import { badgeServices, botToken, redisTtl } from "@config/environment";
import { fetch, redis } from "bun";

export async function fetchBadges(
	userId: string,
	services: string[],
	options?: FetchBadgesOptions,
	request?: Request,
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

			const result: Badge[] = [];

			try {
				let url: string | { user: string; badge: (id: string) => string };
				if (typeof entry.url === "function") {
					url = entry.url(userId);
				} else {
					url = entry.url;
				}

				switch (serviceKey) {
					case "vencord":
					case "equicord": {
						const res = await fetch(url as string);
						if (!res.ok) break;

						const data = await res.json();
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
						const res = await fetch(url as string);
						if (!res.ok) break;

						const data = await res.json();
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
						const res = await fetch(url as string);
						if (!res.ok) break;

						const data = await res.json();
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

					case "enmity": {
						if (
							typeof url !== "object" ||
							typeof url.user !== "string" ||
							typeof url.badge !== "function"
						)
							break;

						const userRes = await fetch(url.user);
						if (!userRes.ok) break;

						const badgeIds: string[] = await userRes.json();
						if (!Array.isArray(badgeIds)) break;

						await Promise.all(
							badgeIds.map(async (id) => {
								const badgeRes = await fetch(url.badge(id));
								if (!badgeRes.ok) return;

								const badge = await badgeRes.json();
								if (!badge?.name || !badge?.url?.dark) return;

								result.push({
									tooltip: badge.name,
									badge: badge.url.dark,
								});
							}),
						);
						break;
					}

					case "discord": {
						if (!botToken) break;

						const res = await fetch(url as string, {
							headers: {
								Authorization: `Bot ${botToken}`,
							},
						});
						if (!res.ok) break;

						const data = await res.json();

						if (data.avatar.startsWith("a_")) {
							result.push({
								tooltip: "Discord Nitro",
								badge: `${request ? new URL(request.url).origin : ""}/public/badges/discord/NITRO.svg`,
							});
						}

						for (const [flag, bitwise] of Object.entries(discordBadges)) {
							if (data.flags & bitwise) {
								const badge =
									discordBadgeDetails[flag as keyof typeof discordBadgeDetails];
								result.push({
									tooltip: badge.tooltip,
									badge: `${request ? new URL(request.url).origin : ""}${badge.icon}`,
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
