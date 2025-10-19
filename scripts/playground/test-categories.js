import { testInputs } from './test-categories-inputs.js';
import {categorize} from '../../server/llm/categorize.js';
import {OllamaProvider} from '../../server/llm/providers/OllamaProvider.js';

const ollamaLocalA = new OllamaProvider('cogito:8b');
const ollamaLocalB = new OllamaProvider('llama3.2:latest');
const ollamaCloud = new OllamaProvider('gpt-oss:20b-cloud');

const doTest = async (llmProvider, text) => {
	const post = {
		plainText: text,
	};
	await categorize(llmProvider, [post]);
	return post.result;
};

const testModels = async (text) => {
	const resultOllamaLocalA = await doTest(ollamaLocalA, text);
	const resultOllamaLocalB = await doTest(ollamaLocalB, text);
	const resultOllamaCloud = await doTest(ollamaCloud, text);

	console.log('Ollama Local Result A:', resultOllamaLocalA);
	console.log('Ollama Local Result B:', resultOllamaLocalB);
	console.log('Ollama Cloud Result:', resultOllamaCloud);
};

const main = async () => {
	await testModels(testInputs.a);
	await testModels(testInputs.b);
	await testModels(testInputs.c);
};

main();
