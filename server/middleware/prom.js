import client from 'prom-client';
import promBundle from 'express-prom-bundle';


export const promClient = client;

client.collectDefaultMetrics({
	prefix: 'kukei_masto2_',
});

const metricsMiddleware = promBundle({
	includeMethod: true,
	includePath: true,
	metricsPath: process.env.APP_PROM_METRICS_PATH || undefined,
	promClient: {
		collectDefaultMetrics: {
			prefix: 'kukei_masto_',
		}
	}
});

export const makePromMiddleware = (app) => {
	app.use(metricsMiddleware);
};
