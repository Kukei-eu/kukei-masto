import { MastoApi } from './masto-api.js';
import {addToIndex, cleanUp, getMostCommonWords} from './search.js';
import {instanceHosts} from '../instances.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const listeners = [];

/**
 *
 * @param {MastoApi} api
 * @returns {(function(): Promise<void>)|*}
 */
const makeListener = (api) => async () => {
	try {
		const timeline = await api.getLocalTimeline();
		for (const item of timeline) {
			await addToIndex(item);
			await sleep(100);
		}
	} catch (error) {
		console.log('Failed to fetch', error);
	}
};

// 3 minutes in ms
const POLL_INTERVAL = 3 * 1000 * 60;

const run = async () => {
	for (const listener of listeners) {
		await listener();
		await sleep(1000);
	}
	await cleanUp();
	await getMostCommonWords(true);
	setTimeout(run, POLL_INTERVAL);
};

export const startListening = () => {
	instanceHosts.forEach((host) => {
		listeners.push(makeListener(new MastoApi(host)));
	});

	run();
};
