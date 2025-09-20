import { auth } from 'express-openid-connect';

const config = {
	authRequired: false,
	auth0Logout: true,
	secret: process.env.OAUTH_SEED_SECRET,
	baseURL: process.env.OAUTH_BASE_URL,
	clientID: process.env.OAUTH_CLIENT_ID,
	issuerBaseURL: process.env.OAUTH_ISSUER_URL,
};

/*
{
  isLoggedIn: true,
  user: {
    sid: 'bqy2nNyCMa8IeYykekHYKPKx9DSyjVVI',
    nickname: 'sznowicki',
    name: 'Szymon Nowicki',
    picture: 'https://avatars.githubusercontent.com/u/3393569?v=4',
    updated_at: '2025-09-20T17:07:21.425Z',
    sub: 'github|3393569'
  }
}
{
  isLoggedIn: true,
  user: {
    sid: 'bkagCzeGOHlZemR7hbg8vv65uk4b5RRo',
    nickname: '',
    name: '',
    picture: 'https://cdn.auth0.com/avatars/default.png',
    updated_at: '2025-09-20T17:08:39.443Z',
    sub: 'apple|000335.2b35be54a7874ae9b8951ff98991939d.1708'
  }
}
 */
export const authMiddleware = (app) => {
	app.use(auth(config));
	app.use((req, res, next) => {
		res.locals.user = {
			isLoggedIn: req.oidc.isAuthenticated(),
			dataRaw: req.oidc.user,
			data: req.oidc.user ? {
				name: req.oidc.user?.name || req.oidc.user?.nickname || req.oidc.user.sid,
				picture: req.oidc.user?.picture,
			} : {}
		};
		if (process.env.LOG_DEBUG) {
			console.log(res.locals.user);
		}
		next();
	});
};
