export const makeSummaryPrompt = () => `
	In the next message I will post aggregated entries from Mastodon posts. Each post is separated by “NEXTENTRY” keyword.

	Please make a summary of "what people are talking about" based on what you read in the posts. Respond with a list of actual topics topics, max 6 topics.

	Make sure you name actual things, do not mention generic things, only actual topics, actual facts. Try to keep the summary short and prompt. Max 800 characters for everything.

	Remember this is made for a website "summary" section. Avoid being chatty, do not make any introduction, do not make any ending question. You must respond in English.
`;
