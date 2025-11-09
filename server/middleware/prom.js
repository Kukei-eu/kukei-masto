import promBundle from 'express-prom-bundle';
const metricsMiddleware = promBundle({includeMethod: true});

export const makePromMiddleware = (app) => {
	app.use(metricsMiddleware);
};
