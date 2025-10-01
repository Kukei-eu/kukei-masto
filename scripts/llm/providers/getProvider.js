import {OllamaProvider} from './OllamaProvider.js';
import {OpenAIProvider} from './OpenAIProvider.js';

export const getProvider = () => {
	switch (process.env.LLM_PROVIDER) {
	case 'ollama':
		return new OllamaProvider();
	case 'openai':
		return new OpenAIProvider();
	default:
		console.warn('NO LLM PROVIDER SET. LLM OFF');
	}
};
