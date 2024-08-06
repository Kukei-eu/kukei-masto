import crypto from 'crypto';
import {getMostCommonWords} from "../../lib/search.js";

export const triggerBotTrends = async (req, res) => {
	// Only run at 8, 16, 19 hour every day
	const d = new Date();
	const h = d.getHours();
	if (![8, 16, 19].includes(h)) {
		return res.status(200).send('Skipped')
	}

	const { env } = req;
	const { searchParams } = new URL(req.originalUrl, 'http://localhost');
	const { s } = Object.fromEntries(searchParams.entries());

	if (s !== env.MASTO_BOT_INCOMING_SECRET) {
		return res.status(401).send('Nope');
	}

	const words = await getMostCommonWords();
	const wordsText = words
		.map(
			(word) => `${word.word} (${word.count})`
		)
		.join(', ');
	const status = `Trending words on https://masto.kukei.eu at the moment are: ${wordsText} \n #trendingOnMasto #mastoKukeiEu`;
	// Status fingerprint, md5, via crypto
	const statusFingerprint = crypto.createHash('md5').update(status).digest('hex');

	try {
		const statusForm = new FormData();
		statusForm.set('status', status);
		statusForm.set('language', 'en');

		const options = {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.MASTO_BOT_ACCESS_TOKEN}`,
				'Idempotency-Key': statusFingerprint,
			},
			body: statusForm,
		};

		const postRequest = await fetch(`${env.MASTO_BOT_URL}/api/v1/statuses`, options);
		if (postRequest.status !== 200) {
			const text = await postRequest.text();
			console.error(text);
		}
	} catch (e) {
		console.error(e.toString());
		return res.status(500).send('Error');
	}

	res.status(201).send();
}
