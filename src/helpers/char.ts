export function timestampToReadable(timestamp?: number): string {
	const date: Date =
		timestamp && !Number.isNaN(timestamp) ? new Date(timestamp) : new Date();
	if (Number.isNaN(date.getTime())) return "Invalid Date";
	return date.toISOString().replace("T", " ").replace("Z", "");
}

export function validateID(id: string): boolean {
	if (!id) return false;

	return /^\d{17,20}$/.test(id.trim());
}

export function parseServices(input: string): string[] {
	return input
		.split(/[\s,]+/)
		.map((s) => s.trim())
		.filter(Boolean);
}
