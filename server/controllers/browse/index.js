import {getTemplate, renderHtml} from '../../lib/sso-render.js';
import {getDefaultViewData} from '../../lib/view.js';
import {getAllPossibleCategories, getBrowse, getRandom} from '../../lib/search.js';
import classNames from 'html-classnames';

const getResults = async (req) => {
	if (req.path === '/random') {
		return getRandom();
	}

	const { category } = req.params;

	return getBrowse(category);
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

	const results = await getResults(req);
	const categories = await getAllPossibleCategories();

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
	};

	const html = await renderHtml(indexTemplate, view);

	res.status(200).type('text/html').send(html);
};
