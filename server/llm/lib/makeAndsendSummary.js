import {getLatestPostsPerCategoryAndLangWrapped, saveSummary} from '../../lib/search.js';
import {makeSummaryPrompt} from './makeSummaryPrompt.js';
import {processSummary} from './processSummary.js';
import {sendMastodonStatus} from '../../lib/bot/sendMessage.js';
import { OpenAIProvider } from '../providers/OpenAIProvider.js';

export const makeAndSendSummary = async (
	category,
	shouldSendBot = false,
) => {
	const entries = await getLatestPostsPerCategoryAndLangWrapped(
		category,
		undefined,
		1000,
	);
	const prompt = makeSummaryPrompt();
	const llm = new OpenAIProvider(
		'openai/gpt-5-nano',
	);
	const response = await llm.prompt(prompt, [{
		role: 'user',
		content: entries,
	}]);

	console.log(response);

	const {
		completeMessage,
		parts,
	} = processSummary(response);

	await saveSummary(category, completeMessage);

	if (process.env.LLM_DRY_RUN) {
		console.log('Dry run, not sending to Mastodon:', parts);
		return true;
	}

	if (!shouldSendBot) {
		console.log('Not sending bot message as shouldSendBot is false');
		return true;
	}

	let first = `Blip blop, I'm a #mastobot. \n Here is a summary (in beta) of the latest posts in #${category} category: \n ${parts[0]}`;

	let lastId = await sendMastodonStatus(first, 'en');

	for (const message of parts.slice(1)) {
		lastId = await sendMastodonStatus(message, 'en', lastId);
	}

	return true;
};
