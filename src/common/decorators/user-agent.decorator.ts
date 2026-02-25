import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
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

export const UserAgent = createParamDecorator<void, UserAgentResult>((data: void, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<Request>();
	const userAgentString = request.headers['user-agent'];
	const parser = new UAParser(userAgentString);
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
});
