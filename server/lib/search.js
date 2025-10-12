import {TOOTS_TTL_MS} from './constants.js';
import {getDb} from './db/mongo.js';

import {categories} from './llm/categories.js';

const getAuthorizeUrl = (itemUrl) => {
	try {
		const url = new URL(itemUrl);
		const path = url.pathname;
		const parts = path.split('/');
		const [,user, id] = parts;
		if (!user || !id) {
			return null;
		}
		return `/authorize_interaction?uri=${encodeURIComponent(`https://${url.hostname}/users/${user.replace('@', '')}/statuses/${id}`)}`;
	} catch (error) {
		return null;
	}
};

export const addToIndex = async (item) => {
	const db = await getDb();
	const hasItem = await db.collection('posts').findOne({id: item.id});
	if (hasItem) {
		return;
	}
	return await db.collection('posts').insertOne(item);
};

export const cleanUp = async () => {
	const db = await getDb();
	await db.collection('posts').deleteMany({createdAtDate: {$lt: new Date(Date.now() - TOOTS_TTL_MS)}});
};

const normalizePosts = (posts) => posts.map((post) => ({
	...post,
	categories: post.categories?.filter((cat) => categories.includes(cat)) ?? [],
	authorizePath: getAuthorizeUrl(post.url),
}));

export const search = async (query) => {
	const db = await getDb();
	const find = {
		categories: {$ne: 'banned'}
	};
	let limit = 200;
	if (query === '*') {
		limit = 100;
	} else {
		find.$text = {$search: query};
	}

	const result = await db.collection('posts')
		.find(find)
		.sort({createdAtDate: -1})
		.limit(limit)
		.toArray();

	return normalizePosts(result);
};

export const getBrowse = async (category, lang, {limit, offset}) => {
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
		.limit(limit)
		.skip(offset)
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

export const getAllPostsCountWithCategorizedCount = async () => {
	const db = await getDb();
	const total = await db.collection('posts').countDocuments();
	const categorized = await db.collection('posts').countDocuments({categories: {$exists: true}});
	return {
		total,
		categorized,
		uncategorized: total - categorized,
	};
};

export const getLatestNPostsPerCategoryAndLang = async (
	db,
	category,
	detectedLang,
	limit = 1000,
) => {
	const match = {
		'categories': category,
	};
	if (detectedLang) {
		match.detectedLanguage = detectedLang;
	}
	const result = await db.collection('posts').aggregate(
		[
			{
				'$match': match,
			}, {
				'$sort': {
					'createdAtDate': -1
				}
			}, {
				'$limit': limit
			}, {
				'$group': {
					'_id': null,
					'concatenatedText': {
						'$push': '$plainText'
					}
				}
			}, {
				'$project': {
					'_id': 0,
					'allTexts': {
						'$reduce': {
							'input': '$concatenatedText',
							'initialValue': '',
							'in': {
								'$cond': [
									{
										'$eq': [
											'$$value', ''
										]
									}, '$$this', {
										'$concat': [
											'$$value', 'NEXTENTRY', '$$this'
										]
									}
								]
							}
						}
					}
				}
			}
		]
	).toArray();

	return result[0].allTexts;
};

export const getLatestPostsPerCategoryAndLangWrapped = async (
	category,
	detectedLang,
	limit = 1000,
) => {
	const db = await getDb();
	const result = await getLatestNPostsPerCategoryAndLang(
		db,
		category,
		detectedLang,
		limit
	);

	return result;
};

export const saveSummary = async (category, summary) => {
	const db =await  getDb();
	await db.collection('summaries').insertOne({
		category,
		summary,
		createdAt: new Date(),
	});
};

export const getSummary = async (category) => {
	const db =await  getDb();
	const result = await db.collection('summaries').findOne(
		{category},
		{
			sort: {createdAt: -1},
		}
	);
	return result?.summary ? result : null;
};
