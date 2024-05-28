import { MastoApi } from "./masto-api.js";
import {addToIndex, cleanUp} from "./search.js";

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
		console.log(timeline);
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
	const polSocial = makeListener(new MastoApi('pol.social'));
	const dziesiony = makeListener(new MastoApi('101010.pl'));
	const mastodonSocial = makeListener(new MastoApi('mastodon.social'));
	listeners.push(polSocial);
	listeners.push(dziesiony);
	listeners.push(mastodonSocial);
	run();
}
