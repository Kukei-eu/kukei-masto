import {getTemplate} from '../lib/sso-render.js';
import classNames from 'html-classnames';
import {getDefaultViewData} from '../lib/view.js';
import {emitPageView} from '../lib/plausible.js';
import {parseQuery} from '../lib/parseQuery.js';
import {renderHtml} from '../lib/sso-render.js';
import {getMostCommonWords, search} from '../lib/search.js';
import { MINIMAL_POPULAR_WORD_LENGTH } from '../lib/search-utils.js';
import {logQuery} from '../lib/log.js';
import {checkCreeps} from '../lib/checkCreeps.js';

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
	const { env } = req;
	const { searchParams } = new URL(req.originalUrl, 'http://localhost');
	const { q , trendingLang} = Object.fromEntries(searchParams.entries());
	const { q: searchQuery, lang } = parseQuery(q);

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
	const language = trendingLang;
	const words = await getMostCommonWords(false, { language });
	console.log(`Words milestone took ${Date.now() - startTime}ms`);

	const viewDefaults = await getDefaultViewData(req, res);
	console.log(`Default view milestone took ${Date.now() - startTime}ms`);

	// Later, UI needed
	// const possibleTrendingLanguages = await getAllPossibleLanguages()
	// console.log(`Possible languages ${Date.now() - startTime}ms`);

	const hasQuery = !!q;
	const mainClass = classNames('body', {
		'--has-query': hasQuery,
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
		noResults: !hasResults,
		hasResults,
		doneIn,
		words,
		minimalPopularWordLength: MINIMAL_POPULAR_WORD_LENGTH,
	};

	const html = await renderHtml(indexTemplate, view);
	console.log(`Last milestone took ${Date.now() - startTime}ms`);

	res.status(200).type('text/html').send(html);
};
