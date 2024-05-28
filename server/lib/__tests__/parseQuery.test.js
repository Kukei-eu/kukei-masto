import { describe, it} from 'node:test';
import assert from 'node:assert';
import { parseQuery } from '../parseQuery.js';

describe('parseQuery', () => {
	it('should return q same as raw', () => {
		const { q, lang } = parseQuery('foo');
		assert.strictEqual(q, 'foo');
		assert.strictEqual(lang, undefined);
	});
	it('should return q undefined when raw is just whitespaces', () => {
		const { q, lang  } = parseQuery('   ');
		assert.strictEqual(q, undefined);
		assert.strictEqual(lang, undefined);
	});
	it('should return q and lang when raw has lang', () => {
		const {q, lang} = parseQuery('foo lang:en');
		assert.strictEqual(q, 'foo');
		assert.strictEqual(lang, 'en');
	});
	it('should return q and lang when raw has lang', () => {
		const {q, lang} = parseQuery('lang:en lang ');
		assert.strictEqual(q, 'lang');
		assert.strictEqual(lang, 'en');
	});
	it('should return q and lang when raw has lang', () => {
		const {q, lang} = parseQuery('lang:en');
		assert.strictEqual(q, '');
		assert.strictEqual(lang, 'en');
	});

	it('should return undefined q when no query at all', () => {
		const { q, lang } = parseQuery();
		assert.strictEqual(q, undefined);
		assert.strictEqual(lang, undefined);
	});

	it('should return empty q and lang', () => {
		const { q, lang} = parseQuery('lang:pl');;
		assert.strictEqual(q, '');
		assert.strictEqual(lang, 'pl');
	});
});
