import { createRestAPIClient } from "masto";
import {getMostCommonWords} from "../../lib/search.js";

export const triggerBotTrends = async (req, res) => {
	const { env } = req;
	const { searchParams } = new URL(req.originalUrl, 'http://localhost');
	const { s } = Object.fromEntries(searchParams.entries());

	if (s !== process.env.MASTO_BOT_INCOMING_SECRET) {
		return res.status(401).send('Nope');
	}

	const masto = createRestAPIClient({
		url: process.env.MASTO_BOT_URL,
		accessToken: process.env.MASTO_BOT_TOKEN,
	});

	const words = await getMostCommonWords();

	const wordsText = words
		.map(
			(word) => `${word.word} (${word.count})`
		)
		.join(', ');
	const status = `Trending words on https://masto.kukei.eu at the moment are: ${wordsText} \n #trendingOnMasto #mastoKukeiEu`;

	console.log(status.length);
	try {
		await masto.v1.statuses.create({
			status,
		});
	} catch (e) {
		console.error(e.toString());
		return res.status(500).send('Error');
	}

	res.status(201).send();
}