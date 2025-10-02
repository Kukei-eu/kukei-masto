import { getDefaultViewData } from '../../lib/view.js';
import {emitPageView} from '../../lib/plausible.js';
import { getTemplate, renderHtml} from '../../lib/sso-render.js';

const template = getTemplate(import.meta.dirname, './template.html');

export const creepsController = async (req, res) => {
	emitPageView(req);
	const ip = req.get('cf-connecting-ip');

	const viewDefaults = await getDefaultViewData(req, res);

	const view = {
		...viewDefaults,
		mainClass: 'about body',
		title: 'Access denied',
		extraCss: 'static-page.css',
		ip,
	};
	const html = await renderHtml(template, view);

	res.status(403).send(html);
};
