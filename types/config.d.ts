type Environment = {
	port: number;
	host: string;
	development: boolean;
};

type badgeURLMap = {
	service: string;
	url: string | ((userId: string) => string);
};
