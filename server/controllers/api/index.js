import crypto from 'crypto';
import {getMostCommonWords} from '../../lib/search.js';
import {sendMastodonStatus} from "../../lib/bot/sendMessage.js";

export const triggerBotTrends = async (req, res) => {
	// Only run at 8, 16, 19 hour every day
	const d = new Date();
	const h = d.getHours();

	if (s !== env.MASTO_BOT_INCOMING_SECRET) {
		return res.status(401).send('Nope');
	}

	if (![8, 16, 19].includes(h)) {
		return res.status(200).send('Skipped');
	}

	const { env } = req;
	const { searchParams } = new URL(req.originalUrl, 'http://localhost');
	const { s } = Object.fromEntries(searchParams.entries());

	const words = await getMostCommonWords();
	const wordsText = words
		.map(
			(word) => `${word.word} (${word.count})`
		)
		.join(', ');
	const status = `Trending words on https://masto.kukei.eu at the moment are: ${wordsText} \n #trendingOnMasto #mastoKukeiEu`;
	try {
		await sendMastodonStatus(status, 'en');
	} catch (e) {
		console.error(e.toString());
		return res.status(500).send('Error');
	}

	res.status(201).send();
};
