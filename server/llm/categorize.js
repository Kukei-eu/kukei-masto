import { makeCategoriesPrompt } from './lib/makeCategoriesPrompt.js';

const doPrompt = async (llmProvider, userMessages) => {
	const prompt = makeCategoriesPrompt();

	const response = await llmProvider.prompt(prompt, userMessages);

	return response;
};

export const categorize = async (llmProvider, posts) => {
	try {
		const userMessages = [];
		for (const post of posts) {
			const text = post.plainText.trim().slice(0, 500);
			if (text.length < 10) {
				post.result = [['UNCATEGORIZED'], 'TOO_SHORT', 'N/A'];
				continue;
			}
			userMessages.push({
				role: 'user',
				content: text,
			});

			const result = await doPrompt(llmProvider, userMessages);
			const content = JSON.parse(result.message.content);
			userMessages.push({
				role: 'assistant',
				content: result.message.content,
			});
			post.result = [
				content?.categories?.length ? content.categories : ['UNCATEGORIZED'],
				content.reason || 'NO_REASON_GIVEN',
				content.language || 'N/A',
			];
		}
	} catch (error) {
		console.error('Error categorizing', error);
		return [['ERROR'], 'ERRORED', 'N/A'];
	}
};
