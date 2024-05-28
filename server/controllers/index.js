import {getTemplate} from '../lib/sso-render.js';
import classNames from 'html-classnames';
import {getDefaultViewData} from '../lib/view.js';
import {emitPageView} from '../lib/plausible.js';
import {parseQuery} from '../lib/parseQuery.js';
import {renderHtml} from '../lib/sso-render.js';

const indexTemplate = getTemplate(import.meta.dirname, './template.html');

export const indexController = async (req, res) => {
	const startTime = Date.now();
	const { env } = req;
	const { searchParams } = new URL(req.originalUrl, 'http://localhost');
	const { q } = Object.fromEntries(searchParams.entries());
	const { q: searchQuery, lang } = parseQuery(q);

	const searchTimeStamp = Date.now();
	// TODO: search here
	const result = q ? null : null;
	const doneIn = Date.now() - searchTimeStamp;
	console.log(`Result milestone took ${Date.now() - startTime}ms`);


	const viewDefaults = await getDefaultViewData(env);
	console.log(`Default view milestone took ${Date.now() - startTime}ms`);

	const hasBlogs = result?.hits.blogs.length > 0;
	const hasDocs = result?.hits.docs.length > 0;
	const hasMagazines = result?.hits.magazines.length > 0;
	const results = [];

	if (hasDocs) {
		results.push({
			name: 'Docs',
			anchor: 'docs',
			hits: result.hits.docs,
		});
	}
	if (hasBlogs) {
		results.push({
			name: 'Blogs',
			anchor: 'blogs',
			hits: result.hits.blogs,
		});
	}
	if (hasMagazines) {
		results.push({
			name: 'Magazines',
			anchor: 'magazines',
			hits: result.hits.magazines,
		});
	}

	const hasQuery = !!q;
	const mainClass = classNames('body', {
		'--has-query': hasQuery,
	});

	console.log(`Processing results milestone took ${Date.now() - startTime}ms`);

	const hasResults = hasQuery ? results.length > 0 : undefined;
	// Save used queries for analytics
	if (q) {
		trackQuery({ q, hasResults })
			.catch(error => {
				console.error('Could not send mongo analytics', error);
			});
	}

	// without await it might get killed before sending by cloudflare
	emitPageView(req, {
		hasResults,
	}, hasQuery ? '/result' : '/');

	console.log(`Facets milestone took ${Date.now() - startTime}ms`);

	const view = {
		...viewDefaults,
		q,
		title: 'kukei.eu',
		results,
		hasQuery,
		noQuery: !hasQuery,
		mainClass,
		noResults: !hasResults,
		hasResults,
		doneIn,
	};

	const html = await renderHtml(indexTemplate, view);
	console.log(`Last milestone took ${Date.now() - startTime}ms`);

	res.status(200).type('text/html').send(html);
};
