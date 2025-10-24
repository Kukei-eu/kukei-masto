import { makeSummaryPrompt } from '../../server/llm/lib/makeSummaryPrompt.js';
import {getLatestNPostsPerCategoryAndLang} from '../../server/lib/search.js';
import {getMongo} from '../../server/lib/db/mongo.js';
// import {OllamaPlain} from '../server/llm/providers/OllamaPlain.js';
import {OpenAIProvider} from '../../server/llm/providers/OpenAIProvider.js';
// import {OllamaPlain} from "../../server/llm/providers/OllamaPlain.js";

const main = async () => {
	const [client, db] = await getMongo();
	const prompt = makeSummaryPrompt();
	const entries = await getLatestNPostsPerCategoryAndLang(
		db,
		'news',
		undefined,
		1000
	);
	const openAI = new OpenAIProvider(
		'openai/gpt-5-nano',
	);
	// const ollama = new OllamaPlain('kimi-k2:1t-cloud');
	const openAIResponse = await openAI.prompt(prompt, [{
		role: 'user',
		content: entries,
	}]);
	// const ollamaResponse = await ollama.prompt(prompt, [{
	// 	role: 'user',
	// 	content: entries,
	// }]);

	console.log('OpenAI Response:');
	console.log(openAIResponse);
	console.log('Ollama Response:');
	// console.log(ollamaResponse);

	await client.close();
};

main();
