export const processSummary = (raw) => {
	const message = raw?.message?.content;

	if (!message) {
		console.error(raw);
		throw new Error('No message found');
	}

	if (message.length < 360) {
		return {
			completeMessage: message,
			parts: [message],
		};
	}

	const parts = [];
	const messageByWords = message.split(' ');
	let count = 0;
	let currentPart = '';
	// First split 360 chars, later 480 chars
	for (const word of messageByWords) {
		const length = parts.length === 0 ? 390 : 480;
		if (count + word.length + 1 > length) {
			parts.push(currentPart.trim());
			currentPart = '';
			count = 0;
		}
		currentPart += word + ' ';
		count += word.length + 1;
	}

	// Last one might be empty
	if (currentPart.trim().length) {
		parts.push(currentPart.trim());
	}

	let partsWithThreadNumber = [];
	if (parts.length > 1) {
		partsWithThreadNumber = parts.map((part, index) => `${part} [${index + 1}/${parts.length}]`);
	} else {
		partsWithThreadNumber = parts;
	}

	return {
		completeMessage: message,
		parts: partsWithThreadNumber,
	};
};
