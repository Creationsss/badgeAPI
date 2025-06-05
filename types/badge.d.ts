type Badge = {
	tooltip: string;
	badge: string;
};

type BadgeResult = Badge[] | Record<string, Badge[]>;

interface FetchBadgesOptions {
	nocache?: boolean;
	separated?: boolean;
}

type BadgeService = {
	service: string;
	url:
		| string
		| ((userId: string) => string)
		| ((userId: string) => {
				user: string;
				badge: (id: string) => string;
		  });
};

interface VencordEquicordData {
	[userId: string]: Array<{
		tooltip: string;
		badge: string;
	}>;
}

interface NekocordData {
	users: {
		[userId: string]: {
			badges: string[];
		};
	};
	badges: {
		[badgeId: string]: {
			name: string;
			image: string;
		};
	};
}

interface ReviewDbData
	extends Array<{
		discordID: string;
		name: string;
		icon: string;
	}> {}

type BadgeServiceData = VencordEquicordData | NekocordData | ReviewDbData;

interface VencordBadgeItem {
	tooltip: string;
	badge: string;
}

interface NekocordBadgeInfo {
	name: string;
	image: string;
}

interface ReviewDbBadgeItem {
	discordID: string;
	name: string;
	icon: string;
}

interface EnmityBadgeItem {
	name: string;
	url: {
		dark: string;
	};
}

interface DiscordUserData {
	avatar: string;
	flags: number;
}

interface PluginData {
	hasPatches: boolean;
	hasCommands: boolean;
	enabledByDefault: boolean;
	required: boolean;
	tags: string[];
	name: string;
	description: string;
	authors: Array<{
		name: string;
		id: string;
	}>;
	filePath: string;
	commands?: Array<{
		name: string;
		description: string;
	}>;
	dependencies?: string[];
	target?: string;
}
