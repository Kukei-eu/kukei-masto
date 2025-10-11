import {
	getUncategorized,
	getUncategorizedCount,
	assignCategories,
} from '../server/lib/search.js';
import {getMongo} from '../server/lib/db/mongo.js';
import {categorize} from '../server/llm/categorize.js';
import {getProvider} from '../server/llm/providers/getProvider.js';


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeCategories = (categories) => categories.map((cat) => cat.toLowerCase().trim());

const processBatch = async (db, llmProvider, posts) => {
	await categorize(llmProvider, posts);
	for (const post of posts) {
		try {
			const log = [];
			log.push(['Text:', post.plainText]);
			const {result} = post;
			const [categories, reason, language] = result;
			const normalized = normalizeCategories(categories);
			log.push(['Categories:', normalized.join(', ')]);
			log.push(['Reason:', reason]);
			log.push(['Language:', language]);

			await assignCategories(db, post._id, normalized, reason, language);
			log.forEach((line) => console.log(...line));
			console.log('---');
		} catch (error) {
			console.error(error);
		}
	}
};

const doRun = async (llmProvider) => {
	const [client, db] = await getMongo();
	// testing
	// await db.collection('posts').updateMany({}, {$unset: {categories: ''}});
	let run = true;

	let totalTime = 0;
	let totalCount = 0;
	do {
		const count = await getUncategorizedCount(db);
		console.log(count);

		const now = Date.now();
		const n = 10;
		const uncategorized = await getUncategorized(db, n);

		if (!uncategorized.length) 	{
			run = false;
			continue;
		}

		console.log('Youngest is', uncategorized[0]?.createdAtDate);

		await processBatch(db, llmProvider, uncategorized);
		const elapsed = Date.now() - now;
		totalTime += elapsed;
		totalCount += uncategorized.length;

		console.log('');
		// Post success stats
		console.log(`Processed ${totalCount} posts in ${totalTime / 1000} s`);
		// Post average
		console.log(`Turn time: ${elapsed / 1000} s, avg: ${(totalTime / totalCount / 1000).toFixed(2)} s/post`);
		console.log('Next turn');
		console.log('');

		await sleep(process.env.LLM_SLEEP || 100);
	} while (run);
	await client.close();
};

const main = async () => {
	const llmProvider = getProvider();

	if (!llmProvider) {
		return;
	}
	await doRun(llmProvider);
	await sleep(10000);
	main();
};

main();
