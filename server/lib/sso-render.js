import Mustache from 'mustache';
import {readFileSync} from 'fs';
import {resolve} from 'path';

export const getTemplate = (...pathnameParts) => {
	return readFileSync(resolve(...pathnameParts), 'utf-8');
};
const beforeTemplate = getTemplate(import.meta.dirname, './partials/before.html');
const afterTemplate = getTemplate(import.meta.dirname, './partials/after.html');
const postTemplate = getTemplate(import.meta.dirname, './partials/post.html');

export const renderHtml = async (template, data) => {
	const finalData = {
		...data,
	};
	const before = Mustache.render(beforeTemplate, finalData);
	const after = Mustache.render(afterTemplate, finalData);

	const html = Mustache.render(template, {
		...finalData,
		before,
		after,
	}, {
		postTemplate,
	});

	return html;
};
