import {getTemplate, renderHtml} from '../../lib/sso-render.js';
import {getDefaultViewData} from '../../lib/view.js';
import {
	getAllDetectedLanguages,
	getAllPossibleCategories, getAllPostsCountWithCategorizedCount,
	getBrowse,
} from '../../lib/search.js';
import classNames from 'html-classnames';
import {emitPageView} from '../../lib/plausible.js';

const getResults = async (req) => {
	const {category} = req.params;
	const {lang, page = 0} = req.query;

	const limit = 10;
	const offset = page * limit;
	console.log(limit, offset);
	return getBrowse(category, lang, {limit, offset});
};

const normalizeResults = (results) => results.map(
	(item) => {
		return {
			...item,
			categoriesParsed: item?.categories?.map((cat) => ({
				name: cat,
				encodedName: encodeURIComponent(cat),
			})) ?? []
		};
	}
);

const indexTemplate = getTemplate(import.meta.dirname, './template.html');

export const processCategories = async (req, res) => {
	const categories = await getAllPossibleCategories();
	const category = req.params.category;
	const userIsPremium = !!res.locals.user?.isPremium;

	const normalizedCategories = userIsPremium ? categories : (
		categories.filter((cat) => cat !== 'banned')
	);

	const normalizedCategory = userIsPremium ? category : (
		category === 'banned' ? null : category
	);

	return [normalizedCategories, normalizedCategory];
};

export const browseController = async (req, res) => {
	const viewDefaults = await getDefaultViewData(req, res);
	const results = await getResults(req);
	const { lang, page = 0 } = req.query;
	const [categories, category] = await processCategories(req, res);
	const languages = await getAllDetectedLanguages();
	const {
		total: totalPostsCount,
		categorized: categorizedPostsCount
	} = await getAllPostsCountWithCategorizedCount();

	const mainClass = classNames('body', {
		'--is-browse': true,
	});

	emitPageView(req);

	const prevParams = new URLSearchParams();
	const nextParams = new URLSearchParams();
	if (lang) {
		prevParams.set('lang', lang);
		nextParams.set('lang', lang);
	}
	if (page > 0) {
		prevParams.set('page', parseInt(page, 10) - 1);
	}
	nextParams.set('page', parseInt(page, 10) + 1);

	const normalizedResults =  normalizeResults(results);
	const view = {
		...viewDefaults,
		title: 'masto.kukei.eu',
		results: normalizedResults,
		hasResults: normalizedResults.length > 0,
		mainClass,
		allCategories: categories.map((cat) => ({
			name: cat,
			encodedName: encodeURIComponent(cat),
		})),
		totalPostsCount,
		categorizedPostsCount,
		languages,
		category,
		nextPageUrl: nextParams.toString(),
		prevPageUrl: page > 0 ? prevParams.toString() : null,
		encodedCategory: category ? encodeURIComponent(category) : null,
	};

	const html = await renderHtml(indexTemplate, view);

	res.status(200).type('text/html').send(html);
};
