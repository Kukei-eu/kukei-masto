import {getDb} from './db/mongo.js';

export const logQuery = async (q) => {
	const db = await getDb();

	await db.collection('queries').updateOne(
		{ q },
		{
			$inc: {
				used: 1,
			},
			$set: {
				q,
				lastUse: Date.now()
			}
		},
		{
			upsert: true,
		}
	);
};
