import sanitizeHTML from 'sanitize-html';
import { convert } from 'html-to-text';
import {TOOTS_TTL_MS} from "./constants.js";
import {bannedAccounts} from "../instances.js";

export class MastoApi {
	static interestingKeys = {
		id: 'id',
		url: 'url',
		createdAt: 'created_at',
		content: 'content',
		accountDisplayName: 'account.display_name',
		accountAvatar: 'account.avatar',
		noIndex: 'account.noindex',
		bot: 'account.bot',
		language: 'language',
		accountUrl: 'account.url',
	}

	static getNotOlderThanMs = TOOTS_TTL_MS;

	constructor(baseUrl) {
		this.hostname = baseUrl
	}

	async callApi(pathname, query) {
		const url = new URL(`/api/v1/${pathname}`, `https://${this.hostname}`);

		for (const [key, value] of Object.entries(query)) {
			url.searchParams.append(key, value);
		}
		console.log(`Calling ${url}`)
		const response = await fetch(url.toString(), {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; Masto.Kukei.eu-Bot/0.2; +https://masto.kukei.eu)',
			}
		});
		if (response.status !== 200) {
			throw new Error(`Failed to fetch, ${response.status}, ${url}`);
		}

		const body = await response.json();

		return body;
	}
	async getLocalTimeline() {
		const now = new Date();

		const body = await this.callApi('timelines/public', {
			local: true,
			limit: 500,
		});

		if (Array.isArray(body) === false) {
			throw new Error(`Unexpected return type: ${typeof body}, ${url}`);
		}
		const result = body.map((item) => {
			const final = {};
			for (const [key, value] of Object.entries(MastoApi.interestingKeys)) {
				const parts = value.split('.');
				let current = item;
				for (const part of parts) {
					if (current[part] === undefined) {
						current = undefined;
						break;
					}
					current = current[part];
				}
				if (current !== undefined) {
					final[key] = current;
				}
			}
			final.originalId = final.id;
			final.id = `${this.hostname}-${final.originalId}`;
			final.createdAtDate = new Date(final.createdAt);

			const orgContent = final.content;
			final.content = sanitizeHTML(orgContent);
			final.plainText = convert(orgContent, {
				wordwrap: null,
			});

			return final;
		});

		let ignored = 0;
		const filtered = result.filter((item) => {
			if (item.noIndex) {
				ignored++;
				return false;
			}

			if (bannedAccounts.includes(item.accountUrl)) {
				console.log(`Ignoring banned account: ${item.accountUrl}`);
				return false;
			}

			if (now.getTime() - item.createdAtDate.getTime() < MastoApi.getNotOlderThanMs) {
				return true;
			}
			return false;
		});
		console.log(`Filtered ${ignored} items, ${result.length} -> ${filtered.length}`);

		return filtered;
	}
}
