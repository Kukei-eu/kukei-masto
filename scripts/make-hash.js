import { createHash } from 'crypto';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';

const versionHash = createHash('sha256');
versionHash.update(Date.now().toString());
const versionId = versionHash.digest('hex').substring(0, 8);

const main = async () => {
	const dirname = import.meta.dirname;
	const content = `export default '${versionId}';`;
	const path = resolve(dirname, '../server/version.js');
	await writeFile(path, content, 'utf-8');
};

main();
