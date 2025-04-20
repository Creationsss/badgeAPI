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
