import {
	getUncategorized,
	getUncategorizedCount,
	assignCategories,
} from '../server/lib/search.js';
import {getMongo} from '../server/lib/db/mongo.js';
import {categorize} from './ollama/categorize.js';


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeCategories = (categories) => categories.map((cat) => cat.toLowerCase().trim());


const main = async () => {
	const [client, db] = await getMongo();
	// testing
	// await db.collection('posts').updateMany({}, {$unset: {categories: ''}});
	let run = true;

	let totalTime = 0;
	let totalCount = 0;
	do {
		const count = await getUncategorizedCount(db);
		console.log(count);

		const n = 3;
		const now = Date.now();
		const uncategorized = await getUncategorized(db, n);

		if (!uncategorized) 	{
			run = false;
			continue;
		}

		await categorize(uncategorized);

		for (const post of uncategorized) {
			const log = [];
			log.push(['Text:', post.plainText]);
			const {result} = post;
			const [categories, reason, language] = result;
			const normalized = normalizeCategories(categories);
			log.push(['Categories:', normalized.join(', ')]);
			log.push(['Reason:', reason]);
			log.push(['Language:', language]);

			await assignCategories(db, uncategorized._id, normalized, reason, language);
			log.forEach((line) => console.log(...line));
			console.log('---');
		}

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

main();
