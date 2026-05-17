import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';

const ROOT = process.cwd();
const BLOCKS_DIR = path.join(ROOT, 'src/css/blocks');
const SRC_DIR = path.join(ROOT, 'src');
const isStrict = process.argv.includes('--strict');

const toPosix = (p) => p.split(path.sep).join('/');

async function walk(dir, predicate) {
	const out = [];
	const entries = await fs.readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...await walk(full, predicate));
		else if (!predicate || predicate(full)) out.push(full);
	}
	return out;
}

function getLine(decl) {
	return decl.source?.start?.line ?? 1;
}

function splitSelectors(rule) {
	return (rule.selector || '').split(',').map((s) => s.trim()).filter(Boolean);
}

function unwrapLeadingWhere(selector) {
	let current = selector.trim();

	while (current.startsWith(':where(')) {
		let depth = 0;
		let end = -1;

		for (let i = 0; i < current.length; i++) {
			const char = current[i];
			if (char === '(') depth += 1;
			if (char === ')') {
				depth -= 1;
				if (depth === 0) {
					end = i;
					break;
				}
			}
		}

		if (end === -1) return current;

		const inside = current.slice(':where('.length, end).trim();
		const suffix = current.slice(end + 1);
		current = `${inside}${suffix}`.trim();
	}

	return current;
}

function blockFromSelector(selector) {
	const m = unwrapLeadingWhere(selector).match(/^\.([a-z0-9]+(?:-[a-z0-9]+)*)$/);
	return m ? m[1] : null;
}

function elementFromSelector(selector) {
	const m = unwrapLeadingWhere(selector).match(/^\.([a-z0-9]+(?:-[a-z0-9]+)*)__([a-z0-9]+(?:-[a-z0-9]+)*)$/);
	return m ? `${m[1]}__${m[2]}` : null;
}

function scopeBlockFromSelector(selector) {
	const m = unwrapLeadingWhere(selector).match(/^\.([a-z0-9]+(?:-[a-z0-9]+)*)(?:__|$)/);
	return m?.[1] ?? null;
}

function resolveVarValue(block, value, blockVars) {
	const m = value.match(/^var\((--[a-z0-9-]+)\)$/);
	if (!m) return value;
	return (blockVars.get(block)?.get(m[1]) ?? value).trim();
}

async function collectDualRoleElements() {
	const files = await walk(SRC_DIR, (f) => /\.(njk|html|md)$/i.test(f));
	const dual = new Set();

	for (const file of files) {
		const text = await fs.readFile(file, 'utf8');
		const classAttrRe = /class\s*=\s*"([^"]+)"/g;
		let m;
		while ((m = classAttrRe.exec(text))) {
			const classes = m[1].split(/\s+/).filter(Boolean);
			for (const cls of classes) {
				if (!cls.includes('__')) continue;
				if (classes.includes(cls.split('__').at(-1))) dual.add(cls);
			}
		}
	}

	return dual;
}

const violations = [];
function addViolation(file, line, rule, message) {
	violations.push({ file: toPosix(path.relative(ROOT, file)), line, rule, message });
}

async function run() {
	const dualRoleElements = await collectDualRoleElements();
	const cssFiles = await walk(BLOCKS_DIR, (f) => f.endsWith('.css'));

	for (const file of cssFiles) {
		const css = await fs.readFile(file, 'utf8');
		const root = postcss.parse(css, { from: file });
		const blockVars = new Map(); // block -> Map(--var, value)

		root.walkRules((rule) => {
			for (const selector of splitSelectors(rule)) {
				const block = blockFromSelector(selector);
				if (!block) continue;
				for (const decl of rule.nodes || []) {
					if (decl.type !== 'decl' || !decl.prop.startsWith('--')) continue;
					const vars = blockVars.get(block) || new Map();
					vars.set(decl.prop, String(decl.value || '').trim());
					blockVars.set(block, vars);
				}
			}
		});

		const scopedZIndex = new Map();
		const scopedNonZeroZ = new Map();

		root.walkRules((rule) => {
			const selectors = splitSelectors(rule);

			for (const decl of rule.nodes || []) {
				if (decl.type !== 'decl') continue;
				const prop = decl.prop.toLowerCase();
				const rawValue = String(decl.value || '').trim();

				for (const selector of selectors) {
					const block = blockFromSelector(selector);
					const element = elementFromSelector(selector);
					const scopeBlock = scopeBlockFromSelector(selector);
					const resolvedValue = scopeBlock ? resolveVarValue(scopeBlock, rawValue, blockVars) : rawValue;

					if (block) {
						if (prop === 'margin' || prop.startsWith('margin-')) {
							addViolation(file, getLine(decl), 'block-no-margin', `.${block} must not set ${prop}`);
						}
						if (prop === 'z-index' && resolvedValue !== '0') {
							addViolation(file, getLine(decl), 'block-z-index-only-zero', `.${block} must not set z-index: ${rawValue}`);
						}
						if (prop === 'position' && resolvedValue === 'absolute') {
							addViolation(file, getLine(decl), 'block-no-absolute', `.${block} must not set position: absolute`);
						}
						const isParentPlacement = [
							'grid-column',
							'grid-row',
							'grid-area',
							'align-self',
							'justify-self',
							'place-self',
							'order'
						].includes(prop);
						if (isParentPlacement) {
							addViolation(file, getLine(decl), 'block-no-parent-placement', `.${block} must not define ${prop}`);
						}
					}

					if (element && dualRoleElements.has(element) && (prop === 'padding' || prop.startsWith('padding-'))) {
						addViolation(file, getLine(decl), 'dual-role-element-no-padding', `.${element} is dual-role (element+block) and must not set ${prop}`);
					}

					if (scopeBlock && prop === 'z-index') {
						if (resolvedValue === '0') scopedZIndex.set(scopeBlock, true);
						else {
							const arr = scopedNonZeroZ.get(scopeBlock) || [];
							arr.push({ line: getLine(decl), value: rawValue, selector });
							scopedNonZeroZ.set(scopeBlock, arr);
						}
					}
				}
			}
		});

		for (const [block, uses] of scopedNonZeroZ.entries()) {
			if (scopedZIndex.get(block)) continue;
			for (const item of uses) {
				addViolation(file, item.line, 'missing-z-index-scope', `z-index: ${item.value} in selector "${item.selector}" requires z-index: 0 in .${block} scope`);
			}
		}
	}

	if (!violations.length) {
		console.log('CSS contracts: OK');
		return;
	}

	console.log('CSS contracts: violations found');
	for (const v of violations) console.log(`- ${v.file}:${v.line} [${v.rule}] ${v.message}`);
	if (isStrict) process.exitCode = 1;
}

run().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
