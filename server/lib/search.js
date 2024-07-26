import {MongoClient} from 'mongodb';
import stopwords from 'stopwords-iso/stopwords-iso.json' with {type: 'json'};
import {TOOTS_TTL_MS} from "./constants.js";

const envs = process.env;

const allStopWords = Object.keys(stopwords).reduce((acc, lang) => {
	const words = stopwords[lang];
	words.forEach((word) => {
		acc.push(word);
	});
	return acc;
}, [])

const allBannedWords = [
	...allStopWords,
	'#nowplaying',
	'playing'
]

const bannedNames = [
	'Feinstaub.koeln',
	'Veena Reddy',
	'Brittany And Tyson',
];

export const MINIMAL_POPULAR_WORD_LENGTH = 5;
export const getMongo = async () => {
	const client = new MongoClient(process.env.MONGO_URI);
	await client.connect();
	const db = await client.db(process.env.MONGO_DATABASE);
	await db.collection('posts').createIndex(
		{plainText: "text"},
	{ default_language: "none" }
	);

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
	await db.collection('posts').deleteMany({createdAtDate: {$lt: new Date(Date.now() - TOOTS_TTL_MS)}});
}

export const search = async (query) => {
	const db = await getDb();
	if (query === '*') {
		const result = await db.collection('posts')
			.find()
			.sort({createdAtDate: -1})
			.limit(100)
			.toArray();
		return result;
	}
	const result = await db.collection('posts')
		.find({$text: {$search: query}})
		.sort({createdAtDate: -1})
		.limit(200)
		.toArray();
	return result;
}

export const getSearchStats = async () => {
	// get number of documents
	const db = await getDb();
	const count = await db.collection('posts').count();

	return {
		count,
	}
}

const cache = {
	result: null,
	time: 0,
}
const getCached = () => {
	if (cache.time + 60000 > Date.now()) {
		return cache.result;
	}
	return null;
}
const fetchMostCommonWords = async () => {
	const db = await getDb();
	const words = await db.collection('posts').aggregate(
		[
			{
				$match: {
					$and: [
						{
							accountDisplayName: {
								$nin: bannedNames,
							}
						},
						{
							bot: false
						}
					],
				}
			},
			{
				$project: {
					words: {
						$split: ["$plainText", " "]
					}
				}
			},
			{
				$unwind: {
					path: "$words"
				}
			},
			{
				$project:
					{
						length: {
							$strLenCP: "$words"
						},
						words: 1
					}
			},
			{
				$match:
				/**
				 * query: The query in MQL.
				 */
					{
						$and: [
							{
								length: {
									$gte: MINIMAL_POPULAR_WORD_LENGTH,
								},
							},
							{
								words: {
									$nin: allBannedWords
								}
							},
							{
								words: {
									$not: /^\[.*/
								}
							}
						]
					},
			},
			{
				$group: {
					_id: "$words",
					count: {
						$sum: 1
					}
				}
			},
			{
				$sort: {
					count: -1
				}
			},
			{
				$limit: 10
			},
		],
		{maxTimeMS: 60000, allowDiskUse: true}
	).toArray();

	const result = words
		.map((word) => ({
			word: word._id,
			wordEncoded: encodeURIComponent(word._id),
			count: word.count,
			last: false,
		}));
	result[result.length - 1].last = true;

	return result;
}


export const getMostCommonWords = async (noCache = false) => {
	const useCache = !noCache;
	const cached = useCache ? getCached() : false;
	if (cached) {
		return cached;
	}
	const words = await fetchMostCommonWords();
	cache.result = words;
	cache.time = Date.now();

	return cache.result;
}
