import {getTemplate} from '../lib/sso-render.js';
import classNames from 'html-classnames';
import {getDefaultViewData} from '../lib/view.js';
import {emitPageView} from '../lib/plausible.js';
import {parseQuery} from '../lib/parseQuery.js';
import {renderHtml} from '../lib/sso-render.js';
import {getMostCommonWords, MINIMAL_POPULAR_WORD_LENGTH, search} from "../lib/search.js";

const indexTemplate = getTemplate(import.meta.dirname, './template.html');

export const indexController = async (req, res) => {
	const startTime = Date.now();
	const { env } = req;
	const { searchParams } = new URL(req.originalUrl, 'http://localhost');
	const { q } = Object.fromEntries(searchParams.entries());
	const { q: searchQuery, lang } = parseQuery(q);

	const searchTimeStamp = Date.now();
	// TODO: search here
	const results = q ? await search(q) : null;
	const doneIn = Date.now() - searchTimeStamp;
	console.log(`Result milestone took ${Date.now() - startTime}ms`);
	const words = await getMostCommonWords();
	console.log(`Words milestone took ${Date.now() - startTime}ms`);


	const viewDefaults = await getDefaultViewData(env);
	console.log(`Default view milestone took ${Date.now() - startTime}ms`);

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
