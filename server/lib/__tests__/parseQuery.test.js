import { describe, it} from 'node:test';
import assert from 'node:assert';
import { parseQuery } from '../parseQuery.js';

describe('parseQuery', () => {
	it('should return q same as raw', () => {
		const { q } = parseQuery('foo');
		assert.strictEqual(q, 'foo');
	});
	it('should return q undefined when raw is just whitespaces', () => {
		const { q  } = parseQuery('   ');
		assert.strictEqual(q, undefined);
	});

	it('should return undefined q when no query at all', () => {
		const { q } = parseQuery();
		assert.strictEqual(q, undefined);
	});
});
