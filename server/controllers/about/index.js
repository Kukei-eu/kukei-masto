import { getDefaultViewData } from '../../lib/view.js';
import {emitPageView} from '../../lib/plausible.js';
import { getTemplate, renderHtml} from '../../lib/sso-render.js';

const template = getTemplate(import.meta.dirname, './template.html');

export const aboutController = async (req, res) => {
	emitPageView(req);
	const { env } = req;

	const viewDefaults = await getDefaultViewData(env);
	const view = {
		...viewDefaults,
		mainClass: 'about body',
		title: 'About masto.kukei.eu',
	};
	const html = await renderHtml(template, view);

	res.status(200).send(html);
};
