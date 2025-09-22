const categories = [
	'politics',
	'technology',
	'news',
	'programming',
	'Polish politics',
	'BANNED',
	'economy',
];

const makePrompt = (post) => `
You are an expert in content categorization, you work as a social media moderator.

You need to categorize the following post into one or more of the following categories: ${categories.join(', ')}.

BANNED is a special category for everything that seems to be harmful, offensive, illegal in Europe or simply an advertisement.

If the post does fit to any other categories, but still has some harmful, offensive or illegal content, you should still assign it to BANNED.

You must not, under any circumstances, invent new categories.
\`\`\`
${post}
\`\`\`
`;


export const categorize = async (text) => {
	try {
		console.log('Categorizing:', text.slice(0, 500));
		const request = await fetch(
			`${process.env.OLLAMA_API}/chat`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': `Bearer ${process.env.OLLAMA_TOKEN}`,
				},
				body: JSON.stringify({
					messages: [
						{
							role: 'tool',
							content: makePrompt(text),
						}
					],
					model: process.env.OLLAMA_MODEL,
					stream: false,
					max_token: 256,
					temperature: 0.1,
					think: false,
					format: {
						type: 'object',
						properties: {
							categories: {
								type: 'array',
								items: {
									type: 'string',
								},
							},
						},
					}
				}),
			},
		);

		const response = await request.json();

		const content = JSON.parse(response.message.content);
		return content?.categories ?? ['UNCATEGORIZED'];
	} catch (error) {
		console.error('Error categorizing', error);
		return ['ERROR'];
	}
};
