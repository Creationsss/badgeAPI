type Badge = {
	tooltip: string;
	badge: string;
};

type BadgeResult = Badge[] | Record<string, Badge[]>;

interface FetchBadgesOptions {
	nocache?: boolean;
	separated?: boolean;
}
