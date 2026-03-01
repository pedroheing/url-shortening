import { UAParser } from 'ua-parser-js';

export interface UserAgentResult {
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
}
