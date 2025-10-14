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

	if (![6, 12, 18, 24].includes(h)) {
		return res.status(200).send('Skipped');
	}

	await makeAndSendSummary('news');
	await makeAndSendSummary('technology');
	await makeAndSendSummary('programming');

	res.status(201).send();
};
