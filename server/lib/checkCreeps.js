// Can't belive I need to code this...
const bannedQueries = [
	'pedo',
	'#cp',
	'#loli',
	'Ped0_',
	'loli_',
	'children',
	'ped0_',
	'boy',
];

const doCreeps = (res) => {
	res.redirect('/error/creeps');
};

export const checkCreeps = (query, res) => {
	if (!query) {
		return false;
	}

	if (
		query.toLowerCase().startsWith('pedo')
		|| bannedQueries.includes(query)
	) {
		doCreeps(res);
		return true;
	}

	return false;
};
