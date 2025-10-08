export const makeSummaryPrompt = () => `
	In the next message I will post aggregated entries from Mastodon posts.

	Each post is separated by “NEXTENTRY” keyword.

	Please make a summary of "what people are talking about" based on what you read in the posts.

	Make sure you name actual things, do not be too generic.

	Try to keep the summary under 500 characters. Avoid introductory phrases like "Here's a summary of..."
`;
