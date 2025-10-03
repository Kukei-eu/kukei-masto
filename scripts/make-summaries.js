import { makeSummaryPrompt } from './llm/lib/makeSummaryPrompt.js';
import {getLatestNPostsPerCategoryAndLang} from '../server/lib/search.js';
import {getMongo} from '../server/lib/db/mongo.js';
import {OllamaPlain} from './llm/providers/OllamaPlain.js';

const main = async () => {
	const [client, db] = await getMongo();
	const prompt = makeSummaryPrompt();
	const entries = await getLatestNPostsPerCategoryAndLang(
		db,
		'news',
		'pl',
		5000
	);
	const llm = new OllamaPlain(
		'cogito:8b',
	);
	const response = await llm.prompt(prompt, [{
		role: 'user',
		content: entries,
	}]);
	console.log(response);

	await client.close();
};

main();
