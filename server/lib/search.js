import {TOOTS_TTL_MS} from './constants.js';
import {
	getCommonWordsPipeline,
} from './search-utils.js';
import {getDb} from './db/mongo.js';

import { categories } from './llm/categories.js';

export const addToIndex = async (item) => {
	const db = await getDb();
	const hasItem = await db.collection('posts').findOne({id: item.id});
	if (hasItem) {
		return;
	}
	const result = await db.collection('posts').insertOne(item);
	return result;
};

export const cleanUp = async () => {
	const db = await getDb();
	await db.collection('posts').deleteMany({createdAtDate: {$lt: new Date(Date.now() - TOOTS_TTL_MS)}});
};

const normalizePosts = (posts) => posts.map((post) => ({
	...post,
	categories: post.categories?.filter((cat) => categories.includes(cat)) ?? [],
}));

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
	return normalizePosts(result);
};

export const getBrowse = async (category, lang) => {
	const db = await getDb();
	const find = category ? {
		categories: {
			$in: [category]
		},
	} : {};

	if (lang) {
		find.detectedLanguage = lang;
	}

	const result = await db.collection('posts')
		.find(find)
		.sort({createdAtDate: -1})
		.limit(100)
		.toArray();
	return normalizePosts(result);
};

export const getSearchStats = async () => {
	// get number of documents
	const db = await getDb();
	const count = await db.collection('posts').count();

	return {
		count,
	};
};

/**
 * Gets number of youngest posts without categories
 */
export const getUncategorized = async (db, size = 1) => {
	const result = await db.collection('posts')
		.find({categories: {$exists: false}})
		.sort({createdAtDate: -1})
		.limit(size)
		.toArray();
	return result;
};

/** Gets count of uncategorized posts */
export const getUncategorizedCount = async (db) => {
	const count = await db.collection('posts').countDocuments({categories: {$exists: false}});
	return count;
};

export const assignCategories = async (db, id, categories, categoriesReason, detectedLanguage) => {
	await db.collection('posts').updateOne(
		{
			_id: id,
		},
		{
			$set: {
				categories,
				categoriesReason,
				detectedLanguage,
			}
		}
	);
};

/**
 * Gets all possible categories
 */
export const getAllPossibleCategories = async () => {
	const db = await getDb();
	const categoriesDb = await db.collection('posts').distinct('categories');
	return categoriesDb
		.filter(Boolean)
		.filter((cat) => categories.includes(cat))
		.sort();
};

export const getAllDetectedLanguages = async () => {
	const db = await getDb();
	const languages = await db.collection('posts').distinct('detectedLanguage');
	return languages.filter(Boolean).sort();
};

const cacheMap = new Map();

const getCachedFromMap = (language) => {
	let cache = cacheMap.get(language);
	if (!cache) {
		cache = {
			time: 0,
			result: null,
		};
	}
	cacheMap.set(language, cache);

	return cache;
};

const getCached = (noCache, options) => {
	const cache = getCachedFromMap(options.language);
	const useCache = canUseCache(noCache);
	if (!useCache) {
		cache.valid = false;
	} else {
		cache.valid = cache.time + 60000 > Date.now();
	}

	return cache;
};
const fetchMostCommonWords = async ({ language } = {}) => {
	const db = await getDb();
	const words = await db.collection('posts').aggregate(
		getCommonWordsPipeline({ language }),
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
};

const canUseCache = (noCache) => {
	if (noCache) {
		return false;
	}

	if (process.env.SEARCH_NO_CACHE) {
		return false;
	}

	return true;
};

export const getMostCommonWords = async (noCache = false, options = {}) => {
	const cached =  getCached(noCache, options);

	if (cached.valid) {
		return cached.result;
	}

	const words = await fetchMostCommonWords(options);
	cached.result = words;
	cached.time = Date.now();

	return cached.result;
};

export const getAllPossibleLanguages = async () => {
	const db = await getDb();
	const languages = await db.collection('posts').distinct('language');
	console.log(languages);
};
