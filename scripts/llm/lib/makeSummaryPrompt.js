export const makeSummaryPrompt = () => `
	In the next message I will post aggregated entries from Mastodon posts.

	Each post is separated by “NEXTENTRY” keyword. You will analyse them to get a summary on what are up to 5 most popular topics.

	Respond with markdown formatted text. Each topic should get a short summary of what is it about.

	This is not a chat, we will use that result on our website. Don't ask any questions and don't start with some introduction.
`;
