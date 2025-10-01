import {getTemplate, renderHtml} from '../../lib/sso-render.js';
import {getDefaultViewData} from '../../lib/view.js';
import {
	getAllDetectedLanguages,
	getAllPossibleCategories,
	getBrowse,
} from '../../lib/search.js';
import classNames from 'html-classnames';
import {emitPageView} from '../../lib/plausible.js';

const getResults = async (req) => {
	const { category } = req.params;
	const { lang } = req.query;

	return getBrowse(category, lang);
};

const normalizeResults = (results) => results.map((item) => ({
	...item,
	categoriesParsed: item?.categories?.map((cat) => ({
		name: cat,
		encodedName: encodeURIComponent(cat),
	})) ?? []
}));

const indexTemplate = getTemplate(import.meta.dirname, './template.html');

const processCategories = async (req, res) => {
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
	const [categories, category] = await processCategories(req, res);
	const languages = await getAllDetectedLanguages();

	const mainClass = classNames('body', {
		'--is-browse': true,
	});

	emitPageView(req);

	const view = {
		...viewDefaults,
		title: 'masto.kukei.eu',
		results: normalizeResults(results),
		mainClass,
		allCategories: categories.map((cat) => ({
			name: cat,
			encodedName: encodeURIComponent(cat),
		})),
		languages,
		category,
		encodedCategory: category ? encodeURIComponent(category) : null,
	};

	const html = await renderHtml(indexTemplate, view);

	res.status(200).type('text/html').send(html);
};
