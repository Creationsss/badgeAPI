const discordBadges = {
	// User badges
	STAFF: 1 << 0,
	PARTNER: 1 << 1,
	HYPESQUAD: 1 << 2,
	BUG_HUNTER_LEVEL_1: 1 << 3,
	HYPESQUAD_ONLINE_HOUSE_1: 1 << 6,
	HYPESQUAD_ONLINE_HOUSE_2: 1 << 7,
	HYPESQUAD_ONLINE_HOUSE_3: 1 << 8,
	PREMIUM_EARLY_SUPPORTER: 1 << 9,
	TEAM_USER: 1 << 10,
	SYSTEM: 1 << 12,
	BUG_HUNTER_LEVEL_2: 1 << 14,
	VERIFIED_DEVELOPER: 1 << 17,
	CERTIFIED_MODERATOR: 1 << 18,
	SPAMMER: 1 << 20,
	ACTIVE_DEVELOPER: 1 << 22,

	// Bot badges
	VERIFIED_BOT: 1 << 16,
	BOT_HTTP_INTERACTIONS: 1 << 19,
	SUPPORTS_COMMANDS: 1 << 23,
	USES_AUTOMOD: 1 << 24,
};

const discordBadgeDetails = {
	HYPESQUAD: {
		tooltip: "HypeSquad Events",
		icon: "/public/badges/discord/HYPESQUAD.svg",
	},
	HYPESQUAD_ONLINE_HOUSE_1: {
		tooltip: "HypeSquad Bravery",
		icon: "/public/badges/discord/HYPESQUAD_ONLINE_HOUSE_1.svg",
	},
	HYPESQUAD_ONLINE_HOUSE_2: {
		tooltip: "HypeSquad Brilliance",
		icon: "/public/badges/discord/HYPESQUAD_ONLINE_HOUSE_2.svg",
	},
	HYPESQUAD_ONLINE_HOUSE_3: {
		tooltip: "HypeSquad Balance",
		icon: "/public/badges/discord/HYPESQUAD_ONLINE_HOUSE_3.svg",
	},

	STAFF: {
		tooltip: "Discord Staff",
		icon: "/public/badges/discord/STAFF.svg",
	},
	PARTNER: {
		tooltip: "Discord Partner",
		icon: "/public/badges/discord/PARTNER.svg",
	},
	CERTIFIED_MODERATOR: {
		tooltip: "Certified Moderator",
		icon: "/public/badges/discord/CERTIFIED_MODERATOR.svg",
	},

	VERIFIED_DEVELOPER: {
		tooltip: "Verified Bot Developer",
		icon: "/public/badges/discord/VERIFIED_DEVELOPER.svg",
	},
	ACTIVE_DEVELOPER: {
		tooltip: "Active Developer",
		icon: "/public/badges/discord/ACTIVE_DEVELOPER.svg",
	},

	PREMIUM_EARLY_SUPPORTER: {
		tooltip: "Premium Early Supporter",
		icon: "/public/badges/discord/PREMIUM_EARLY_SUPPORTER.svg",
	},

	BUG_HUNTER_LEVEL_1: {
		tooltip: "Bug Hunter (Level 1)",
		icon: "/public/badges/discord/BUG_HUNTER_LEVEL_1.svg",
	},
	BUG_HUNTER_LEVEL_2: {
		tooltip: "Bug Hunter (Level 2)",
		icon: "/public/badges/discord/BUG_HUNTER_LEVEL_2.svg",
	},

	SUPPORTS_COMMANDS: {
		tooltip: "Supports Commands",
		icon: "/public/badges/discord/SUPPORTS_COMMANDS.svg",
	},
	USES_AUTOMOD: {
		tooltip: "Uses AutoMod",
		icon: "/public/badges/discord/USES_AUTOMOD.svg",
	},
};

const badgeServices: BadgeService[] = [
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
	{
		service: "Discord",
		url: (userId: string) => `https://discord.com/api/v10/users/${userId}`,
	},
];

const vencordEquicordContributorUrl =
	"https://raw.githubusercontent.com/Equicord/Equibored/refs/heads/main/plugins.json";

function getServiceDescription(service: string): string {
	const descriptions: Record<string, string> = {
		Vencord: "Custom badges from Vencord Discord client",
		Equicord: "Custom badges from Equicord Discord client",
		Nekocord: "Custom badges from Nekocord Discord client",
		ReviewDb: "Badges from ReviewDB service",
		Enmity: "Custom badges from Enmity mobile Discord client",
		Discord: "Official Discord badges (staff, partner, hypesquad, etc.)",
	};

	return descriptions[service] || "Custom badge service";
}

const gitUrl = "https://git.creations.works/creations/badgeAPI";

export {
	badgeServices,
	discordBadges,
	discordBadgeDetails,
	vencordEquicordContributorUrl,
	getServiceDescription,
	gitUrl,
};
