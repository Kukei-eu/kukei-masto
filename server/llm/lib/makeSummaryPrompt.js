export const makeSummaryPrompt = () => `
	In the next message I will post aggregated entries from Mastodon posts.

	Each post is separated by “NEXTENTRY” keyword.

	Please make a summary of "what people are talking about" based on what you read in the posts.

	Make sure you name actual things, do not be too generic.

	Try to keep the summary under 600 characters.

	Remember this is made for a website "summary" section. Avoid being chatty, do not make any introduction, do not make any ending question. You must respond in English.
`;
