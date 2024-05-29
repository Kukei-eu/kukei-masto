import {MongoClient} from 'mongodb';

const envs = process.env;

export const getMongo = async () => {
	const client = new MongoClient(process.env.MONGO_URI);
	await client.connect();
	const db = await client.db(process.env.MONGO_DATABASE);
	await db.collection('posts').createIndex({ content: "text" });

	return [client, db];
};

let db;
let client;
const getDb = async () => {
	if (!db) {
		[client, db] = await getMongo();
	}
	return db;
};

export const addToIndex = async (item) => {
	const db = await getDb();
	const hasItem = await db.collection('posts').findOne({id: item.id});
	if (hasItem) {
		return;
	}
	const result = await db.collection('posts').insertOne(item);
	return result;
}

export const cleanUp = async () => {
	const db = await getDb();
	// 1 hour
	const timeout = 1000 * 60 * 60;
	await db.collection('posts').deleteMany({createdAtDate: {$lt: new Date(Date.now() - timeout)}});
}

export const search = async (query) => {
	const db = await getDb();
	if (query === '*') {
		const result = await db.collection('posts')
			.find()
			.sort({createdAt: -1})
			.limit(20)
			.toArray();
		return result;
	}
	const result = await db.collection('posts').find({$text: {$search: query}}).toArray();
	return result;
}
