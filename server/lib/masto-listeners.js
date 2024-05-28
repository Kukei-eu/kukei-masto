import { MastoApi } from "./masto-api.js";
import {addToIndex, cleanUp} from "./search.js";

const listeners = [];

/**
 *
 * @param {MastoApi} api
 * @returns {(function(): Promise<void>)|*}
 */
const makeListener = (api) => async () => {
	const timeline = await api.getLocalTimeline();
	for (const item of timeline) {
		await addToIndex(item)
	}
	await cleanUp();
	console.log(timeline);
}


const run = async () => {
	for (const listener of listeners) {
		await listener();
	}
	setTimeout(run, 60000);
}
export const startListening = () => {
	const api = new MastoApi('pol.social');
	const listener = makeListener(api);
	listeners.push(listener);
	run();
}
