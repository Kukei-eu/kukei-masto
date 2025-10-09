import { makeSummaryPrompt } from '../server/llm/lib/makeSummaryPrompt.js';
import {getLatestNPostsPerCategoryAndLang} from '../server/lib/search.js';
import {getMongo} from '../server/lib/db/mongo.js';
import {OllamaPlain} from '../server/llm/providers/OllamaPlain.js';
// import {OpenAIProvider} from './llm/providers/OpenAIProvider.js';

const main = async () => {
	const [client, db] = await getMongo();
	const prompt = makeSummaryPrompt();
	const entries = await getLatestNPostsPerCategoryAndLang(
		db,
		'news',
		undefined,
		2000
	);
	const llm = new OllamaPlain(
		'qwen3:8b',
	);
	const response = await llm.prompt(prompt, [{
		role: 'user',
		content: entries,
	}]);
	console.log(response);

	await client.close();
};

main();
