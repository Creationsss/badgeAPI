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
