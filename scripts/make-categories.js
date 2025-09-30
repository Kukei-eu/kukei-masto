import {
	getUncategorized,
	getUncategorizedCount,
	assignCategories,
} from '../server/lib/search.js';
import {getMongo} from '../server/lib/db/mongo.js';
import {categorize} from './ollama/categorize.js';
// import {categorize} from './openwebui/categorize.js';


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeCategories = (categories) => categories.map((cat) => cat.toLowerCase().trim());


const processBatch = async (db, posts) => {
	await categorize(posts);
	await sleep(1000);
	for (const post of posts) {
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
	}
};

const doRun = async () => {
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
		const n = 1;

		const uncategorized = await getUncategorized(db, n);

		if (!uncategorized.length) 	{
			run = false;
			continue;
		}

		console.log('Youngest is', uncategorized[0]?.createdAtDate);

		await processBatch(db, uncategorized);
		// await processBatch(db, uncategorized);
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

		// await sleep(100);
	} while (run);
	await client.close();
};

const main = async () => {
	await doRun();
	await sleep(10000);
	main();
};

main();
