class FormatNumber extends HTMLElement {
	connectedCallback() {
		this.innerHTML = this.formatNumber(this.innerHTML);
	}

	formatNumber(number) {
		const parsed = parseFloat(number);;
		if (isNaN(parsed)) {
			return number;
		}
		return parsed.toLocaleString();
	}
}

class FormatDate extends HTMLElement {
	connectedCallback() {
		this.innerHTML = this.formatDate(this.innerHTML);
	}

	formatDate(number) {
		try {
			const parsed = new Date(number);
			if (!isFinite(parsed)) {
				throw new Error('Invalid date');
			}

			return `${parsed.toLocaleTimeString()} ${parsed.toLocaleDateString()}`;
		} catch (error) {
			console.log(error);
			return number;
		}
	}
}

const main = () => {
	customElements.define('format-number', FormatNumber);
	customElements.define('format-date', FormatDate);
};

main();
