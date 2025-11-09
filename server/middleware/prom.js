import client from 'prom-client';
import promBundle from 'express-prom-bundle';

const collectDefaultMetrics = client.collectDefaultMetrics;
const prefix = 'kukei_masto_';
collectDefaultMetrics({ prefix });


export const promClient = client;

const metricsMiddleware = promBundle({
	includeMethod: true,
	includePath: true,
});

export const makePromMiddleware = (app) => {
	app.use(metricsMiddleware);
};
