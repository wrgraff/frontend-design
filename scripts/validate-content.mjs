import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = process.cwd();

const errors = [];

function fail(file, field, message) {
	errors.push(`${file} :: ${field} :: ${message}`);
}

function isObject(v) {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function reqObject(file, field, value) {
	if (!isObject(value)) {
		fail(file, field, 'must be an object');
		return null;
	}
	return value;
}

function reqString(file, field, value) {
	if (typeof value !== 'string' || value.trim() === '') {
		fail(file, field, 'must be a non-empty string');
		return null;
	}
	return value;
}

function optString(file, field, value) {
	if (value === undefined || value === null) return null;
	if (typeof value !== 'string') {
		fail(file, field, 'must be a string');
		return null;
	}
	return value;
}

function reqArray(file, field, value) {
	if (!Array.isArray(value)) {
		fail(file, field, 'must be an array');
		return null;
	}
	return value;
}

function reqBoolean(file, field, value) {
	if (typeof value !== 'boolean') {
		fail(file, field, 'must be a boolean');
		return null;
	}
	return value;
}

function reqNumber(file, field, value) {
	if (typeof value !== 'number' || Number.isNaN(value)) {
		fail(file, field, 'must be a number');
		return null;
	}
	return value;
}

async function loadYaml(relPath) {
	const absPath = path.join(ROOT, relPath);
	const raw = await fs.readFile(absPath, 'utf8');
	return yaml.load(raw);
}

async function loadMarkdownFrontMatter(relPath) {
	const absPath = path.join(ROOT, relPath);
	const raw = await fs.readFile(absPath, 'utf8');
	const match = raw.match(/^---\n([\s\S]*?)\n---/);

	if (!match) {
		fail(relPath, 'frontmatter', 'is required');
		return null;
	}

	try {
		const data = yaml.load(match[1]);
		if (!isObject(data)) {
			fail(relPath, 'frontmatter', 'must be a YAML object');
			return null;
		}
		return data;
	} catch (error) {
		fail(relPath, 'frontmatter', `cannot be parsed: ${error.message}`);
		return null;
	}
}

async function listCollectionEntryFiles(collectionDir) {
	const absCollectionDir = path.join(ROOT, collectionDir);
	const entries = await fs.readdir(absCollectionDir, { withFileTypes: true });

	const files = await Promise.all(entries
		.filter((entry) => entry.isDirectory())
		.map(async (entry) => {
			const ymlFile = path.posix.join(collectionDir, entry.name, 'index.yml');
			const mdFile = path.posix.join(collectionDir, entry.name, 'index.md');

			try {
				await fs.access(path.join(ROOT, ymlFile));
				return ymlFile;
			} catch {}

			return mdFile;
		}));

	return files;
}

async function loadCollectionEntryData(relPath) {
	if (relPath.endsWith('.yml') || relPath.endsWith('.yaml')) {
		const data = await loadYaml(relPath);
		if (!isObject(data)) {
			fail(relPath, 'root', 'must be a YAML object');
			return null;
		}
		return data;
	}

	return loadMarkdownFrontMatter(relPath);
}

function validatePortfolioEntry(file, data) {
	const root = reqObject(file, 'root', data);
	if (!root) return;

	reqString(file, 'layout', root.layout);
	reqString(file, 'title', root.title);
	reqString(file, 'heading', root.heading);
	reqNumber(file, 'order', root.order);

	if (root.nda !== undefined) reqBoolean(file, 'nda', root.nda);

	const coverImgs = reqArray(file, 'cover_imgs', root.cover_imgs);
	if (coverImgs && coverImgs.length === 0) {
		fail(file, 'cover_imgs', 'must contain at least one item');
	}
	if (coverImgs) {
		coverImgs.forEach((item, index) => {
			reqString(file, `cover_imgs[${index}]`, item);
		});
	}

	const imgs = root.imgs === undefined ? null : reqArray(file, 'imgs', root.imgs);
	if (imgs) {
		imgs.forEach((item, index) => {
			const base = `imgs[${index}]`;
			if (typeof item === 'string') {
				reqString(file, base, item);
				return;
			}

			const obj = reqObject(file, base, item);
			if (!obj) return;
			reqString(file, `${base}.type`, obj.type);
			reqString(file, `${base}.name`, obj.name);
		});
	}

	if (root.tags !== undefined) {
		const tags = reqArray(file, 'tags', root.tags);
		if (tags) tags.forEach((tag, index) => reqString(file, `tags[${index}]`, tag));
	}
}

function validatePublicationsEntry(file, data) {
	const root = reqObject(file, 'root', data);
	if (!root) return;

	reqString(file, 'heading', root.heading);
	reqNumber(file, 'order', root.order);
	reqString(file, 'kind', root.kind);
	optString(file, 'description', root.description);

	if (root.kind !== 'article' && root.kind !== 'video') {
		fail(file, 'kind', 'must be "article" or "video"');
		return;
	}

	if (root.kind === 'article') {
		const external = reqBoolean(file, 'external', root.external);
		if (external === null) return;

		if (external) {
			if (root.title !== undefined) {
				fail(file, 'title', 'must be omitted for external article');
			}
			const externalUrl = reqString(file, 'external_url', root.external_url);
			if (externalUrl && !/^https?:\/\//.test(externalUrl)) {
				fail(file, 'external_url', 'must start with http:// or https://');
			}
			optString(file, 'source_label', root.source_label);
			if (root.permalink !== false) {
				fail(file, 'permalink', 'must be false for external article');
			}
		} else {
			reqString(file, 'title', root.title);
			reqString(file, 'layout', root.layout);
		}
	}

	if (root.kind === 'video') {
		reqString(file, 'title', root.title);
		reqString(file, 'layout', root.layout);
		const youtubeUrl = reqString(file, 'youtube_url', root.youtube_url);
		if (youtubeUrl && !/^https?:\/\//.test(youtubeUrl)) {
			fail(file, 'youtube_url', 'must start with http:// or https://');
		}
		const slidesUrl = optString(file, 'slides_url', root.slides_url);
		if (slidesUrl && !/^https?:\/\//.test(slidesUrl)) {
			fail(file, 'slides_url', 'must start with http:// or https://');
		}
		if (root.permalink === false) {
			fail(file, 'permalink', 'must not be false for video');
		}
	}
}

function validateCta(file, field, cta) {
	const arr = reqArray(file, field, cta);
	if (!arr) return;

	arr.forEach((item, index) => {
		const base = `${field}[${index}]`;
		const obj = reqObject(file, base, item);
		if (!obj) return;

		reqString(file, `${base}.text`, obj.text);
		optString(file, `${base}.kind`, obj.kind);
		optString(file, `${base}.href`, obj.href);
		optString(file, `${base}.type`, obj.type);
		optString(file, `${base}.mode`, obj.mode);
		optString(file, `${base}.size`, obj.size);
		optString(file, `${base}.icon`, obj.icon);
		optString(file, `${base}.icon_left`, obj.icon_left);
		optString(file, `${base}.icon_right`, obj.icon_right);
		optString(file, `${base}.subtext`, obj.subtext);
		if (obj.download !== undefined) reqBoolean(file, `${base}.download`, obj.download);
		if ((obj.kind === 'link' || obj.type === 'link') && !obj.href) {
			fail(file, `${base}.href`, 'is required for link CTA');
		}
	});
}

function validateHome(file, data) {
	const root = reqObject(file, 'root', data);
	if (!root) return;

	reqString(file, 'layout', root.layout);
	reqString(file, 'permalink', root.permalink);

	const hero = reqObject(file, 'hero', root.hero);
	if (hero) {
		reqString(file, 'hero.heading', hero.heading);
		reqString(file, 'hero.text', hero.text);
		reqString(file, 'hero.image', hero.image);
		optString(file, 'hero.image_alt', hero.image_alt);
		if (hero.portrait !== undefined) reqBoolean(file, 'hero.portrait', hero.portrait);
		if (hero.cta !== undefined) validateCta(file, 'hero.cta', hero.cta);
	}

	const journey = reqObject(file, 'my_design_journey', root.my_design_journey);
	if (journey) {
		reqString(file, 'my_design_journey.pretitle', journey.pretitle);
		reqString(file, 'my_design_journey.heading', journey.heading);
		reqString(file, 'my_design_journey.body', journey.body);
		validateCta(file, 'my_design_journey.cta', journey.cta);
	}

	const portfolio = reqObject(file, 'portfolio', root.portfolio);
	if (portfolio) {
		reqString(file, 'portfolio.pretitle', portfolio.pretitle);
		reqString(file, 'portfolio.heading', portfolio.heading);
		const items = reqArray(file, 'portfolio.items', portfolio.items);
		if (items) {
			items.forEach((item, index) => {
				const base = `portfolio.items[${index}]`;
				const obj = reqObject(file, base, item);
				if (!obj) return;
				reqString(file, `${base}.role`, obj.role);
				reqString(file, `${base}.heading`, obj.heading);
				reqString(file, `${base}.description`, obj.description);
				const tags = reqArray(file, `${base}.tags`, obj.tags);
				if (tags) tags.forEach((tag, i) => reqString(file, `${base}.tags[${i}]`, tag));
			});
		}
	}

	const approach = reqObject(file, 'approach_to_work', root.approach_to_work);
	if (approach) {
		reqString(file, 'approach_to_work.pretitle', approach.pretitle);
		reqString(file, 'approach_to_work.heading', approach.heading);
		reqString(file, 'approach_to_work.intro', approach.intro);
		const steps = reqArray(file, 'approach_to_work.steps', approach.steps);
		if (steps) {
			steps.forEach((step, index) => {
				const base = `approach_to_work.steps[${index}]`;
				const obj = reqObject(file, base, step);
				if (!obj) return;
				reqString(file, `${base}.label`, obj.label);
				reqString(file, `${base}.text`, obj.text);
			});
		}
	}

}

function validateMenu(file, data, locales = []) {
	const items = reqArray(file, 'root', data);
	if (!items) return;

	items.forEach((item, index) => {
		const base = `[${index}]`;
		const obj = reqObject(file, base, item);
		if (!obj) return;
		reqString(file, `${base}.heading`, obj.heading);
		const link = reqString(file, `${base}.link`, obj.link);
		if (link && !link.startsWith('/')) {
			fail(file, `${base}.link`, 'must start with "/"');
		}
		if (link) {
			const firstSegment = link.replace(/^\/+/, '').split('/')[0];
			if (locales.includes(firstSegment)) {
				fail(file, `${base}.link`, 'must be locale-agnostic (no locale prefix in data)');
			}
		}
	});
}

function validateGlobal(file, data) {
	const root = reqObject(file, 'root', data);
	if (!root) return;

	['site_heading', 'subtitle', 'domain', 'name', 'language'].forEach((field) => reqString(file, field, root[field]));

	const contacts = reqObject(file, 'contacts', root.contacts);
	if (!contacts) return;

	['heading', 'text'].forEach((field) => reqString(file, `contacts.${field}`, contacts[field]));
	optString(file, 'contacts.comment', contacts.comment);

	const items = reqObject(file, 'contacts.items', contacts.items);
	if (items) {
		Object.entries(items).forEach(([key, value]) => {
			const base = `contacts.items.${key}`;
			const obj = reqObject(file, base, value);
			if (!obj) return;
			reqString(file, `${base}.heading`, obj.heading);
			reqString(file, `${base}.url`, obj.url);
			optString(file, `${base}.icon`, obj.icon);
			if (obj.external !== undefined) reqBoolean(file, `${base}.external`, obj.external);
		});
	}
}

function validateI18n(file, data) {
	const root = reqObject(file, 'root', data);
	if (!root) return;

	const defaultLocale = reqString(file, 'defaultLocale', root.defaultLocale);
	const locales = reqArray(file, 'locales', root.locales);
	if (locales) {
		locales.forEach((locale, index) => reqString(file, `locales[${index}]`, locale));
		if (defaultLocale && !locales.includes(defaultLocale)) {
			fail(file, 'defaultLocale', 'must be listed in locales');
		}
	}

	const strategy = reqString(file, 'urlStrategy', root.urlStrategy);
	if (strategy && !['prefix', 'prefix_except_default'].includes(strategy)) {
		fail(file, 'urlStrategy', 'must be "prefix" or "prefix_except_default"');
	}

	const localeMeta = reqObject(file, 'localeMeta', root.localeMeta);
	if (!localeMeta) return;

	Object.entries(localeMeta).forEach(([localeKey, meta]) => {
		const base = `localeMeta.${localeKey}`;
		const obj = reqObject(file, base, meta);
		if (!obj) return;
		reqString(file, `${base}.htmlLang`, obj.htmlLang);
		reqString(file, `${base}.ogLocale`, obj.ogLocale);
	});
}

async function main() {
	const i18n = await loadYaml('src/_data/i18n.yml');
	const portfolioFiles = await listCollectionEntryFiles('src/portfolio');
	const publicationsFiles = await listCollectionEntryFiles('src/publications');

	validateHome('src/pages/home/index.yml', await loadYaml('src/pages/home/index.yml'));
	validateGlobal('src/_data/global.yml', await loadYaml('src/_data/global.yml'));
	validateMenu('src/_data/menu.yml', await loadYaml('src/_data/menu.yml'), Array.isArray(i18n?.locales) ? i18n.locales : []);
	validateI18n('src/_data/i18n.yml', i18n);

	for (const file of portfolioFiles) {
		const data = await loadCollectionEntryData(file);
		if (data) validatePortfolioEntry(file, data);
	}

	for (const file of publicationsFiles) {
		const data = await loadCollectionEntryData(file);
		if (data) validatePublicationsEntry(file, data);
	}

	if (!errors.length) {
		console.log('Content contracts: OK');
		return;
	}

	console.log('Content contracts: violations found');
	errors.forEach((error) => console.log(`- ${error}`));
	process.exitCode = 1;
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
