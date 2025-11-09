import client from 'prom-client';
import promBundle from 'express-prom-bundle';


export const promClient = client;

const metricsMiddleware = promBundle({
	includeMethod: true,
	includePath: true,
	promClient: {
		collectDefaultMetrics: {
			prefix: 'kukei_masto_',
		}
	}
});

export const makePromMiddleware = (app) => {
	app.use(metricsMiddleware);
};
