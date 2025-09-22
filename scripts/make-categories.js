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
	do {
		const count = await getUncategorizedCount(db);
		console.log(count);
		const uncategorized = await getUncategorized(db);
		console.log(uncategorized?._id);
		if (!uncategorized) 	{
			run = false;
			continue;
		}

		const text = uncategorized.plainText.slice(0, 1000);
		const categories = await categorize(text);
		const normalized = normalizeCategories(categories);
		console.log(normalized);
		await assignCategories(db, uncategorized._id, normalized);
		await sleep(10);
	} while (run);
	await client.close();
};

main();
