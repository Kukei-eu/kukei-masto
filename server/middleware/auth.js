import { auth } from 'express-openid-connect';

const config = {
	authRequired: false,
	auth0Logout: true,
	secret: process.env.OAUTH_SEED_SECRET,
	baseURL: process.env.OAUTH_BASE_URL,
	clientID: process.env.OAUTH_CLIENT_ID,
	clientSecret: process.env.OAUTH_CLIENT_SECRET,
	issuerBaseURL: process.env.OAUTH_ISSUER_URL,
	authorizationParams: {
		response_type: 'code',
		scope: 'openid profile email',
	},
};

export const authMiddleware = (app) => {
	app.use(auth(config));
	app.use(async (req, res, next) => {
		res.locals.user = {
			isLoggedIn: req.oidc.isAuthenticated(),
			dataRaw: req.oidc.user,
			data: req.oidc.user ? {
				name: req.oidc.user?.name || req.oidc.user?.nickname || req.oidc.user.sid,
				picture: req.oidc.user?.picture,
				roles: new Set(req.oidc.user?.['kukei.eu/roles'] ?? []),
			} : {}
		};

		if (res.locals.user.data?.roles) {
			res.locals.user.isPremium = res.locals.user.data.roles.has('premium');
		}
		if (process.env.LOG_DEBUG) {
			// console.log(res.locals.user);
		}
		next();
	});
};
