import { fakerPT_BR as faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient, clicks, short_urls } from 'generated/prisma/client';
import { UAParser } from 'ua-parser-js';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
	if (process.env.NODE_ENV != 'development') {
		console.log("NODE_ENV env not on 'development' - stopping seed");
		return;
	}
	console.log('Start seeding...');
	const shortUrls = await seedFakeShortUrls();
	await seedFakeClicks(shortUrls);
	console.log('Finished seeding!');
}

async function seedFakeShortUrls() {
	const shortUrls: short_urls[] = [];
	for (let i = 0; i < 10; i++) {
		const short_url = {
			short_code: faker.string.alphanumeric({ length: 5 }),
			url: 'https://github.com/',
		} as short_urls;
		const upserted = await prisma.short_urls.upsert({
			where: {
				short_url_id: i + 1,
			},
			create: short_url,
			update: short_url,
		});
		shortUrls.push(upserted);
	}
	console.log('Fake short_urls seeded...');
	return shortUrls;
}

async function seedFakeClicks(shortUrls: short_urls[]) {
	for (let i = 0; i < shortUrls.length; i++) {
		const { short_url_id } = shortUrls[i];
		for (let j = 0; j < 100; j++) {
			const userAgent = faker.internet.userAgent();
			const parser = new UAParser(userAgent);
			const parseResult = parser.getResult();
			const clicks = {
				browser_name: parseResult.browser.name,
				browser_version: parseResult.browser.version,
				browser_version_major: parseResult.browser.major,
				city: faker.location.city(),
				country: faker.location.country(),
				device_model: parseResult.device.model,
				device_type: parseResult.device.type,
				device_vendor: parseResult.device.vendor,
				ip_address: faker.internet.ipv4(),
				os: parseResult.os.name,
				os_version: parseResult.os.version,
				region: faker.location.countryCode(),
				timezone: faker.location.timeZone(),
				short_url_id,
			} as clicks;
			await prisma.clicks.upsert({
				where: {
					click_id: j + 1,
					click_id_short_url_id: {
						click_id: j + 1,
						short_url_id,
					},
				},
				create: clicks,
				update: clicks,
			});
		}
	}
	console.log('Fake clicks seeded...');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
