import stopwords from 'stopwords-iso/stopwords-iso.json' with {type: 'json'};

export const MINIMAL_POPULAR_WORD_LENGTH = 5;

const allStopWords = Object.keys(stopwords).reduce((acc, lang) => {
	const words = stopwords[lang];
	words.forEach((word) => {
		acc.push(word);
	});
	return acc;
}, [])

// Common words that make no sense
const allBannedWords = [
	...allStopWords,
	'#nowplaying',
	'playing'
]

// Bot accounts that don't declare themselves bots
const bannedNames = [
	'Feinstaub.koeln',
	'International Friends Network',
	'Veena Reddy',
	'Brittany And Tyson',
];

export const commonWordsPipeline = [
	{
		// First, filter out banned accounts and bots
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
	// Split all words from all content
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
	// Assign strlen
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
			{
				$and: [
					// Must be minimum N char long
					{
						length: {
							$gte: MINIMAL_POPULAR_WORD_LENGTH,
						},
					},
					// Not banned
					{
						words: {
							$nin: allBannedWords
						}
					},
					// Not start with [ (saw this already from links, some use markdown)
					{
						words: {
							$not: /^\[.*/
						}
					},
					// No links
					{
						words: {
							$not: /http/
						}
					}
				]
			},
	},
	// Group by occurances
	{
		$group: {
			_id: "$words",
			count: {
				$sum: 1
			}
		}
	},
	// Sort desc
	{
		$sort: {
			count: -1
		}
	},
	// Limit
	{
		$limit: 10
	},
]
