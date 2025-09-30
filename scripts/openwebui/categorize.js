import { categories } from '../../server/lib/llm/categories.js';

const makePrompt = () => `
You are an expert in content categorization of social media posts.

Your job is to categorize posts info one or more of the following categories:

${categories.map(c => ' - '+c).join('\n')}.

BANNED is a special category for posts that contain potentially illegal content, such as porn, fraud or phishing attempt.

Only posts that ARE porn, fraud or phishing attempt should be categorized as BANNED. Not posts that just discuss these topics.

Never ban a post simply because it contains upsetting message.

When choosing "donations" it should not have any other category.

You must not, under any circumstances, invent new categories.

If you are unsure, return empty list.

For every response please also post a reason for picked categories (few words).

For every response please also provide a language (two letter ISO code, e.g. 'en') of the original post.

Your output MUST be in minified JSON format, without any other text, not even markdown, with following fields:

{ categories: Array<string>, reason: string, language: string }
`;


const doPrompt = async (userMessages) => {
	const prompt = makePrompt();
	const request = await fetch(
		`${process.env.OPENWEBUI_API}/chat/completions`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${process.env.OPENWEBUI_TOKEN}`,
			},
			body: JSON.stringify({
				messages: [
					{
						role: 'system',
						content: prompt,
					},
					...userMessages
				],
				model: process.env.OPENWEBUI_MODEL,
				stream: false,
				temperature: 0.1,
			}),
		},
	);

	const response = await request.json();

	console.log(response);
	const content = response.choices?.[0]?.message?.content || '';
	if (!content) throw new Error('No content in response');

	return content;
};

export const categorize = async (posts) => {
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

			const result = await doPrompt(userMessages);
			console.log('Categorize result', result);
			const content = JSON.parse(result);
			userMessages.push({
				role: 'assistant',
				content: result,
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
