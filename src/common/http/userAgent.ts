import { UAParser } from 'ua-parser-js';
import { isAIAssistant, isAICrawler, isBot } from 'ua-parser-js/bot-detection';

export interface UserAgentResult {
	isBot: boolean;
	browser: {
		name?: string;
		version?: string;
		major?: string;
	};
	device: {
		model?: string;
		type?: string;
		vendor?: string;
	};
	os: {
		name?: string;
		version?: string;
	};
}

export class UserAgent {
	public static parse(userAgent: string): UserAgentResult {
		const parser = new UAParser(userAgent);
		const parseResult = parser.getResult();
		return {
			isBot: this.isBot(userAgent),
			browser: {
				name: parseResult.browser.name,
				version: parseResult.browser.version,
				major: parseResult.browser.major,
			},
			device: {
				model: parseResult.device.model,
				type: parseResult.device.type,
				vendor: parseResult.device.vendor,
			},
			os: {
				name: parseResult.os.name,
				version: parseResult.os.version,
			},
		};
	}

	private static isBot(userAgent: string) {
		return isBot(userAgent) || isAICrawler(userAgent) || isAIAssistant(userAgent);
	}
}
