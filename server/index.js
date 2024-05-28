import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { withAsyncErrorHandler } from './lib/withAsyncErrorHandler.js';
import { indexController } from './controllers/index.js';
import { aboutController } from './controllers/about/index.js';

const main = async () => {
	const app = express();
	app.use(helmet());
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

	app.listen(3010, () => {
		console.log('Server up');
	});
};

main();