import {getTemplate, renderHtml} from '../../lib/sso-render.js';
import {getDefaultViewData} from '../../lib/view.js';
import {getBrowse} from '../../lib/search.js';
import classNames from 'html-classnames';


const indexTemplate = getTemplate(import.meta.dirname, './template.html');

export const browseController = async (req, res) => {
	const hasAccess = !!res.locals.user.isPremium;
	const viewDefaults = await getDefaultViewData(req, res);

	const results = await getBrowse();
	const mainClass = classNames('body', {
		'--is-browse': true,
	});
	const view = {
		...viewDefaults,
		title: 'masto.kukei.eu',
		hasAccess,
		results,
		mainClass,
	};

	const html = await renderHtml(indexTemplate, view);

	res.status(200).type('text/html').send(html);
};
