import {getTemplate} from '../lib/sso-render.js';
import classNames from 'html-classnames';
import {getDefaultViewData} from '../lib/view.js';
import {emitPageView} from '../lib/plausible.js';
import {parseQuery} from '../lib/parseQuery.js';
import {renderHtml} from '../lib/sso-render.js';
import {getAllDetectedLanguages, search} from '../lib/search.js';
import {logQuery} from '../lib/log.js';
import {checkCreeps} from '../lib/checkCreeps.js';
import {processCategories} from './browse/index.js';

const indexTemplate = getTemplate(import.meta.dirname, './template.html');

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response

 */
/**
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
export const indexController = async (req, res) => {
	const startTime = Date.now();
	const { searchParams } = new URL(req.originalUrl, 'http://localhost');
	const { q } = Object.fromEntries(searchParams.entries());
	const { q: searchQuery } = parseQuery(q);
	const [categories] = await processCategories(req, res);
	const languages = await getAllDetectedLanguages();
	console.log(`Called ${req.originalUrl}, query: ${searchQuery}`);

	const bail = checkCreeps(searchQuery, res);

	if (bail) {
		return;
	}

	if (searchQuery) {
		// fire and forget
		logQuery(searchQuery)
			.catch(error => {
				console.error('Error logging query', error);
			});
	}

	const searchTimeStamp = Date.now();
	// TODO: search here
	const results = searchQuery ? await search(searchQuery) : null;
	const doneIn = Date.now() - searchTimeStamp;
	console.log(`Result milestone took ${Date.now() - startTime}ms`);
	const viewDefaults = await getDefaultViewData(req, res);
	console.log(`Default view milestone took ${Date.now() - startTime}ms`);

	// Later, UI needed
	const hasQuery = !!q;
	const mainClass = classNames('body', {
		'--is-page-home': !hasQuery,
		'--is-page-results': hasQuery,
	});

	console.log(`Processing results milestone took ${Date.now() - startTime}ms`);

	const hasResults = hasQuery ? results.length > 0 : undefined;
	// without await it might get killed before sending by cloudflare
	emitPageView(req, {
		hasResults,
	}, hasQuery ? '/result' : '/');

	console.log(`Facets milestone took ${Date.now() - startTime}ms`);

	if (req.get('Accept') === 'application/json') {
		if (hasQuery) {
			return res.status(200).json({
				results,
				doneIn,
			});
		} else {
			return res.status(200).json({
				msg: 'No query provided.'
			});
		}
 	}

	const view = {
		...viewDefaults,
		q,
		title: 'masto.kukei.eu',
		results,
		hasQuery,
		noQuery: !hasQuery,
		mainClass,
		extraCss: 'page-home.css',
		allCategories: categories.map((cat) => ({
			name: cat,
			encodedName: encodeURIComponent(cat),
		})),
		languages,
		noResults: !hasResults,
		hasResults,
		doneIn,
	};

	const html = await renderHtml(indexTemplate, view);
	console.log(`Last milestone took ${Date.now() - startTime}ms`);

	res.status(200).type('text/html').send(html);
};
