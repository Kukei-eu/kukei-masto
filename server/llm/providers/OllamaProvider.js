export class OllamaProvider {
	#token;

	#model;

	#apiUrl;

	constructor(model = process.env.OLLAMA_MODEL) {
		this.#apiUrl = process.env.OLLAMA_API;
		this.#token = process.env.OLLAMA_TOKEN;
		this.#model = model;
	}

	async prompt(prompt, userMessages) {
		const request = await fetch(
			`${this.#apiUrl}/chat`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': `Bearer ${this.#token}`,
				},
				body: JSON.stringify({
					messages: [
						{
							role: 'system',
							content: prompt,
						},
						...userMessages
					],
					model: this.#model,
					stream: false,
					max_token: 256,
					temperature: 0.1,
					think: false,
					format: {
						type: 'object',
						properties: {
							categories: {
								type: 'array',
								items: {
									type: 'string',
								},
							},
							reason: {
								type: 'string'
							},
							language: {
								type: 'string',
							}
						},
					}
				}),
			}
		);

		return request.json();
	}
}
