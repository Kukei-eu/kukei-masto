import {getTemplate, renderHtml} from '../../lib/sso-render.js';
import {getDefaultViewData} from '../../lib/view.js';
import {
	getAllDetectedLanguages,
	getAllPossibleCategories,
	getBrowse,
	getRandom
} from '../../lib/search.js';
import classNames from 'html-classnames';

const getResults = async (req) => {
	if (req.path === '/random') {
		return getRandom();
	}

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

export const browseController = async (req, res) => {
	const hasAccess = !!res.locals.user.isPremium;
	const viewDefaults = await getDefaultViewData(req, res);
	const { category } = req.params;
	const results = await getResults(req);
	const categories = await getAllPossibleCategories();
	const languages = await getAllDetectedLanguages();

	console.log(results);
	const mainClass = classNames('body', {
		'--is-browse': true,
	});
	const view = {
		...viewDefaults,
		title: 'masto.kukei.eu',
		hasAccess,
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
