export const environment: Environment = {
	port: Number.parseInt(process.env.PORT || "8080", 10),
	host: process.env.HOST || "0.0.0.0",
	development:
		process.env.NODE_ENV === "development" || process.argv.includes("--dev"),
};

export const redisTtl: number = process.env.REDIS_TTL
	? Number.parseInt(process.env.REDIS_TTL, 10)
	: 60 * 60 * 1; // 1 hour

export const badgeServices: badgeURLMap[] = [
	{
		service: "Vencord",
		url: "https://badges.vencord.dev/badges.json",
	},
	{
		service: "Equicord", // Ekwekord ! WOOP
		url: "https://raw.githubusercontent.com/Equicord/Equibored/refs/heads/main/badges.json",
	},
	{
		service: "Nekocord",
		url: "https://nekocord.dev/assets/badges.json",
	},
	{
		service: "ReviewDb",
		url: "https://manti.vendicated.dev/api/reviewdb/badges",
	},
	{
		service: "Enmity",
		url: (userId: string) => ({
			user: `https://raw.githubusercontent.com/enmity-mod/badges/main/${userId}.json`,
			badge: (id: string) =>
				`https://raw.githubusercontent.com/enmity-mod/badges/main/data/${id}.json`,
		}),
	},
];
