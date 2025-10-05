import crypto from 'crypto';

export const sendMastodonStatus = async (
	text,
	language,
	replyTo = null,
) => {
	try {
		const statusForm = new FormData();
		statusForm.set('status', text);
		statusForm.set('language', language);
		if (replyTo) {
			statusForm.set('in_reply_to_id', replyTo);
		}

		const statusFingerprint = crypto
			.createHash('md5')
			.update(text)
			.digest('hex');

		const options = {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${process.env.MASTO_BOT_ACCESS_TOKEN}`,
				'Idempotency-Key': statusFingerprint,
			},
			body: statusForm,
		};

		const postRequest = await fetch(
			`${process.env.MASTO_BOT_URL}/api/v1/statuses`,
			options
		);

		if (postRequest.status !== 200) {
			const text = await postRequest.text();
			console.error(text);
			throw new Error('Failed to post status');
		}
		const response = await postRequest.json();

		return response.id;
	} catch (error) {
		console.error('Error posting status:', error);
		throw error;
	}
};
