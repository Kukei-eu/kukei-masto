export class OpenAIProvider {
	#token;

	#model;

	#apiUrl;

	constructor() {
		this.#apiUrl = process.env.OPENAI_API;
		this.#token = process.env.OPENAI_TOKEN;
		this.#model = process.env.OPENAI_MODEL;
	}

	async prompt(prompt, userMessages) {
		const request = await fetch(
			`${this.#apiUrl}/chat/completions`,
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
					temperature: 0.1,
				}),
			}
		);

		const response = await request.json();
		const message = response.choices?.[0];

		return message;
	}
}
