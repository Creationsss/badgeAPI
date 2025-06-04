type Badge = {
	tooltip: string;
	badge: string;
};

type BadgeResult = Badge[] | Record<string, Badge[]>;

interface FetchBadgesOptions {
	nocache?: boolean;
	separated?: boolean;
}

type badgeURLMap = {
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

interface BadgeService {
	service: string;
	url:
		| string
		| ((
				userId: string,
		  ) => string | { user: string; badge: (id: string) => string });
}

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
