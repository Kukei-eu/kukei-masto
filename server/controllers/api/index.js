import {makeAndSendSummary} from '../../llm/lib/makeAndsendSummary.js';

export const triggerSummaries = async (req, res) => {
	const s = req.query.s;
	if (!process.env.MASTO_BOT_INCOMING_SECRET) {
		throw new Error('No secret set');
	}
	if (s !== process.env.MASTO_BOT_INCOMING_SECRET) {
		return res.status(401).send('Nope');
	}
	const d = new Date();
	const h = d.getHours();
	// UTC+0!
	const shouldRun = [4, 9, 13, 18, 24].includes(h);
	const shouldSendBot = [9, 18, 24].includes(h);

	if (!shouldRun) {
		return res.status(200).send('Skipped');
	}

	await makeAndSendSummary('news', shouldSendBot);
	await makeAndSendSummary('technology', shouldSendBot);
	await makeAndSendSummary('programming', shouldSendBot);

	res.status(201).send();
};
