import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { indexController } from './controllers/index.js';
import { aboutController } from './controllers/about/index.js';
import {startListening} from './lib/masto-listeners.js';
import { instanceHosts } from './instances.js';
import {triggerSummaries} from './controllers/api/index.js';
import {creepsController} from './controllers/creeps/index.js';
import {authMiddleware} from './middleware/auth.js';
import {browseController} from './controllers/browse/index.js';

const cspHosts = instanceHosts.map((host) => `https://${host}`);

const main = async () => {
	if (!process.env.NO_LISTEN) {
		startListening();
	}

	const app = express();

	app.use(cookieParser());
	app.use((req, res, next) => {
		res.locals.cspNonce = crypto.randomBytes(32).toString('hex');
		next();
	});

	app.use(helmet({
		contentSecurityPolicy: {
			directives: {
				imgSrc: [
					// eslint-disable-next-line quotes
					"'self'",
					'data:',
					...cspHosts,
					'https://media.ruhr.social',
					'https://files.mastodon.social',
					'https://files.mastodon.online',
					'https://media.mas.to',
					'https://media.mstdn.social',
					'https://media.troet.cafe',
					'https://storage.googleapis.com/mastodon-prod-bucket/',
					'https://storage.waw.cloud.ovh.net',
					'https://assets.chaos.social',
					'https://media.norden.social',
					'https://cdn.fosstodon.org',
					'https://social-cdn.vivaldi.net',
					'https://pcdn.mastodon.com.pl',
					'https://fsn1.your-objectstorage.com',
					'https://media.hachyderm.io',
					'https://cdn.masto.host',
					'https://media.muenchen.social',
					'https://files.ioc.exchange'
				],
				// eslint-disable-next-line quotes
				scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
			}
		}
	}));
	app.disable('x-powered-by');
	app.use((req, res, next) => {
		console.log(`Request: ${req.get('cf-connecting-ip')}, ${req.originalUrl}`);
		next();
	});
	authMiddleware(app);
	app.use('/', bodyParser.urlencoded({ extended: false }));
	app.use((req, res, next) => {
		req.env = process.env;
		next();
	});
	app.use((req, res, next) => {
		// Set instanceUrl from cookie to res.locals for templates
		res.locals.instanceUrl = req.cookies?.instanceUrl;
		next();
	});

	app.post('/user/setInstance', (req, res) => {
		// Get referer
		const referer = req.get('Referer') || '/';

		// instance-url from form
		let instanceUrl = req.body['instance-url'];
		if (!instanceUrl.startsWith('https://')) {
			instanceUrl = `https://${instanceUrl}`;
		}

		// Set cookie for 360 days
		res.cookie('instanceUrl', instanceUrl, { maxAge: 360 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
		res.redirect(referer);
	});


	app.use(
		express.static('dist', {
			maxAge: '1y',
		}),
	);

	app.get('/', indexController);
	app.get('/browse', browseController);
	app.get('/browse/:category', browseController);
	app.get('/about', aboutController);
	app.post('/api/summaries', triggerSummaries);
	app.get('/error/creeps', creepsController);

	const port = process.env.PORT || 3010;
	app.listen(port, () => {
		console.log(`Server up, port ${port}`);
	});
};

main();
