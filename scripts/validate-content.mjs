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

async function loadYaml(relPath) {
	const absPath = path.join(ROOT, relPath);
	const raw = await fs.readFile(absPath, 'utf8');
	return yaml.load(raw);
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
				reqString(file, `${base}.title`, obj.title);
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

	const contacts = reqObject(file, 'contacts', root.contacts);
	if (contacts) {
		reqString(file, 'contacts.pretitle', contacts.pretitle);
		reqString(file, 'contacts.heading', contacts.heading);
		reqString(file, 'contacts.body', contacts.body);
		['locations', 'direct_contacts', 'social_links'].forEach((key) => {
			const list = reqArray(file, `contacts.${key}`, contacts[key]);
			if (list) list.forEach((item, i) => reqString(file, `contacts.${key}[${i}]`, item));
		});
	}
}

function validateMenu(file, data) {
	const items = reqArray(file, 'root', data);
	if (!items) return;

	items.forEach((item, index) => {
		const base = `[${index}]`;
		const obj = reqObject(file, base, item);
		if (!obj) return;
		reqString(file, `${base}.title`, obj.title);
		const link = reqString(file, `${base}.link`, obj.link);
		if (link && !link.startsWith('/')) {
			fail(file, `${base}.link`, 'must start with "/"');
		}
	});
}

function validateGlobal(file, data) {
	const root = reqObject(file, 'root', data);
	if (!root) return;

	['title', 'subtitle', 'domain', 'name', 'language'].forEach((field) => reqString(file, field, root[field]));

	const contacts = reqObject(file, 'contacts', root.contacts);
	if (!contacts) return;

	['heading', 'text'].forEach((field) => reqString(file, `contacts.${field}`, contacts[field]));
	optString(file, 'contacts.comment', contacts.comment);

	['messaging', 'socials'].forEach((field) => {
		const list = reqArray(file, `contacts.${field}`, contacts[field]);
		if (!list) return;

		list.forEach((item, index) => {
			const base = `contacts.${field}[${index}]`;
			const obj = reqObject(file, base, item);
			if (!obj) return;
			reqString(file, `${base}.title`, obj.title);
			reqString(file, `${base}.url`, obj.url);
			optString(file, `${base}.icon`, obj.icon);
		});
	});
}

async function main() {
	validateHome('src/pages/home/index.yml', await loadYaml('src/pages/home/index.yml'));
	validateGlobal('src/_data/global.yml', await loadYaml('src/_data/global.yml'));
	validateMenu('src/_data/menu.yml', await loadYaml('src/_data/menu.yml'));

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
