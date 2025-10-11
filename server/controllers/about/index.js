import classNames from 'html-classnames';
import { getDefaultViewData } from '../../lib/view.js';
import {emitPageView} from '../../lib/plausible.js';
import { getTemplate, renderHtml} from '../../lib/sso-render.js';
import {getSearchStats} from '../../lib/search.js';
import {instanceHosts} from '../../instances.js';
import {TOOTS_TTL_HUMAN} from '../../lib/constants.js';

const template = getTemplate(import.meta.dirname, './template.html');

export const aboutController = async (req, res) => {
	emitPageView(req);
	const viewDefaults = await getDefaultViewData(req, res);
	const stats = await getSearchStats();

	const view = {
		...viewDefaults,
		mainClass: classNames('body', {
			'--is-page-about': true,
		}),
		title: 'About masto.kukei.eu',
		extraCss: 'static-page.css',
		stats,
		hosts: instanceHosts.join(', '),
		TOOTS_TTL_HUMAN,
	};
	const html = await renderHtml(template, view);

	res.status(200).send(html);
};
