export const processSummary = (raw) => {
	const message = raw?.message?.content;

	if (!message) {
		console.error(raw);
		throw new Error('No message found');
	}

	if (message.length < 400) {
		return {
			completeMessage: message,
			parts: [message],
		};
	}

	const parts = [];
	const messageByWords = message.split(' ');
	let count = 0;
	let currentPart = '';
	for (const word of messageByWords) {
		if (count + word.length + 1 > 390) {
			parts.push(currentPart.trim());
			currentPart = '';
			count = 0;
		}
		currentPart += word + ' ';
		count += word.length + 1;
	}

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
