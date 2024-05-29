import { MastoApi } from "./masto-api.js";
import {addToIndex, cleanUp} from "./search.js";
import {instanceHosts} from "../instances.js";

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
			await addToIndex(item)
		}
	} catch (error) {
		console.log('Failed to fetch', error);
	}
}


const run = async () => {
	for (const listener of listeners) {
		await listener();
	}
	await cleanUp();
	setTimeout(run, 60000);
}
export const startListening = () => {
	instanceHosts.forEach((host) => {
		listeners.push(makeListener(new MastoApi(host)));
	});

	run();
}
