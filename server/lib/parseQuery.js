export const parseQuery = (rawQuery) => {
	if (!rawQuery) {
		return { q: undefined };
	}

	const trimmed = rawQuery.trim();
	let q = trimmed.length > 0 ? trimmed : undefined;

	if (!q) {
		return { q };
	}

	return { q};
};
