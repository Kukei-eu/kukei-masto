import {MongoClient} from 'mongodb';

export const getMongo = async () => {
	const client = new MongoClient(process.env.MONGO_URI);
	await client.connect();
	const db = await client.db(process.env.MONGO_DATABASE);
	await db.collection('posts').createIndex(
		{
			plainText: 'text'
		},
		{
			default_language: 'english',
			language_override: 'none',
		}
	);

	return [client, db];
};

let db;
let client;

export const getDb = async () => {
	if (!db) {
		[client, db] = await getMongo();
	}
	return db;
};
