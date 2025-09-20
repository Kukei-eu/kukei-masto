import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { withAsyncErrorHandler } from './lib/withAsyncErrorHandler.js';
import { indexController } from './controllers/index.js';
import { aboutController } from './controllers/about/index.js';
import {startListening} from './lib/masto-listeners.js';
import { instanceHosts } from './instances.js';
import {triggerBotTrends} from './controllers/api/index.js';
import {creepsController} from "./controllers/creeps/index.js";

const cspHosts = instanceHosts.map((host) => `https://${host}`);

const main = async () => {
	if (!process.env.NO_LISTEN) {
		startListening();
	}
	const app = express();
	app.use(helmet({
		contentSecurityPolicy: {
			directives: {
				imgSrc: [
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
					'https://fsn1.your-objectstorage.com'
				],
			}
		}
	}));
	app.disable('x-powered-by');
	app.use((req, res, next) => {
		console.log(`Request: ${req.get('cf-connecting-ip')}, ${req.originalUrl}`);
		next();
	});
	app.use('/', bodyParser.urlencoded({ extended: false }));
	app.use((req, res, next) => {
		req.env = process.env;
		next();
	});
	app.use(
		express.static('dist', {
			maxAge: '1y',
		}),
	);

	app.get('/', withAsyncErrorHandler(indexController));
	app.get('/about', withAsyncErrorHandler(aboutController));
	app.post('/api/trends', withAsyncErrorHandler(triggerBotTrends));
	app.get('/error/creeps', withAsyncErrorHandler(creepsController));

	const port = process.env.PORT || 3010;
	app.listen(port, () => {
		console.log(`Server up, port ${port}`);
	});
};

main();
