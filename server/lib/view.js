import hash from '../version.js';

export const getDefaultViewData = async (req, res) => {
	return {
		hash,
		user: res.locals.user,
		instanceUrl: res.locals.instanceUrl,
	};
};
