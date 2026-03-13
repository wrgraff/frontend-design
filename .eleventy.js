const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');
const minmax = require('postcss-media-minmax');
const pimport = require('postcss-import');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const markdown = require('markdown-it')({ html: true });
const esbuild = require('esbuild');
const Typograf = require('typograf');
const typograf = new Typograf({
	locale: ['en-GB']
});
typograf.setSetting('common/nbsp/beforeShortLastWord', 'lengthLastWord', 999);

const DEFAULT_I18N_CONFIG = {
	defaultLocale: 'en',
	locales: ['en'],
	urlStrategy: 'prefix_except_default',
	localeMeta: {
		en: {
			htmlLang: 'en',
			ogLocale: 'en_GB'
		}
	}
};

function loadI18nConfig() {
	try {
		const filePath = path.join(__dirname, 'src/_data/i18n.yml');
		const rawConfig = yaml.load(fs.readFileSync(filePath, 'utf8')) ?? {};
		const defaultLocale = typeof rawConfig.defaultLocale === 'string' && rawConfig.defaultLocale
			? rawConfig.defaultLocale
			: DEFAULT_I18N_CONFIG.defaultLocale;
		const locales = Array.isArray(rawConfig.locales) && rawConfig.locales.length
			? rawConfig.locales.filter((locale) => typeof locale === 'string' && locale)
			: [defaultLocale];
		const urlStrategy = typeof rawConfig.urlStrategy === 'string'
			? rawConfig.urlStrategy
			: DEFAULT_I18N_CONFIG.urlStrategy;
		const localeMeta = rawConfig.localeMeta && typeof rawConfig.localeMeta === 'object'
			? rawConfig.localeMeta
			: {};

		return {
			defaultLocale,
			locales,
			urlStrategy,
			localeMeta
		};
	} catch (error) {
		return DEFAULT_I18N_CONFIG;
	}
}

const i18nConfig = loadI18nConfig();

function isSkippableLink(href) {
	if (typeof href !== 'string' || href.trim() === '') {
		return true;
	}

	return /^(?:[a-z]+:|\/\/|#)/i.test(href);
}

function normalizePath(pathname) {
	if (!pathname || pathname === '/') {
		return '/';
	}

	const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
	const normalized = withLeadingSlash.replace(/\/{2,}/g, '/');

	if (normalized === '/') {
		return normalized;
	}

	return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function splitPathAndSuffix(href) {
	const [withoutHash, hash = ''] = href.split('#');
	const [pathname, search = ''] = withoutHash.split('?');
	const suffix = `${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;

	return { pathname, suffix };
}

function stripLocalePrefix(pathname, locales) {
	const normalized = normalizePath(pathname);
	const segments = normalized.split('/').filter(Boolean);

	if (!segments.length) {
		return normalized;
	}

	if (!locales.includes(segments[0])) {
		return normalized;
	}

	const nextPath = `/${segments.slice(1).join('/')}`;
	return normalizePath(nextPath);
}

function detectLocaleFromUrl(url) {
	const normalized = normalizePath(url);
	const firstSegment = normalized.split('/').filter(Boolean)[0];
	return i18nConfig.locales.includes(firstSegment)
		? firstSegment
		: i18nConfig.defaultLocale;
}

function localizePath(href, localeOrUrl) {
	if (isSkippableLink(href)) {
		return href;
	}

	const locale = i18nConfig.locales.includes(localeOrUrl)
		? localeOrUrl
		: detectLocaleFromUrl(localeOrUrl);
	const { pathname, suffix } = splitPathAndSuffix(href);
	const cleanPath = stripLocalePrefix(pathname, i18nConfig.locales);
	const shouldPrefixLocale = i18nConfig.urlStrategy === 'prefix'
		|| (i18nConfig.urlStrategy === 'prefix_except_default' && locale !== i18nConfig.defaultLocale);
	const localizedPath = shouldPrefixLocale
		? normalizePath(`/${locale}${cleanPath}`)
		: cleanPath;

	return `${localizedPath}${suffix}`;
}

function widont(value) {
	const text = String(value ?? '');
	const trailingWhitespaceMatch = text.match(/\s+$/u);
	const trailingWhitespace = trailingWhitespaceMatch ? trailingWhitespaceMatch[0] : '';
	const textWithoutTrailingWhitespace = trailingWhitespace
		? text.slice(0, -trailingWhitespace.length)
		: text;

	return textWithoutTrailingWhitespace.replace(/(\S)\s+(\S+)$/u, '$1\u00A0$2') + trailingWhitespace;
}

function widontHtml(content) {
	return String(content ?? '').replace(/>([^<]+)</g, (match, textNode) => {
		if (!/\S/u.test(textNode)) {
			return match;
		}

		return `>${widont(textNode)}<`;
	});
}

function normalizeIconSvgAttributes(svgMarkup, className, size) {
	const markup = String(svgMarkup ?? '');
	const iconClass = String(className ?? '').replace(/"/g, '&quot;');
	const iconSize = String(size ?? 32).replace(/"/g, '&quot;');

	return markup.replace(/<svg\b([^>]*)>/i, (full, attrs) => {
		const cleanedAttrs = String(attrs ?? '').replace(
			/\s(?:class|aria-hidden|width|height)="[^"]*"/gi,
			''
		);

		return `<svg${cleanedAttrs} class="${iconClass}" aria-hidden="true" width="${iconSize}" height="${iconSize}">`;
	});
}

module.exports = function (config) {
	const isProduction = process.env.ELEVENTY_ENV === 'production';
	const byOrder = (a, b) => (a.data.order ?? 0) - (b.data.order ?? 0);

	// Styles

	const styles = [
		'./src/css/index.css',
		'./src/css/cv.css',
	];

	config.addTemplateFormats('css');
	config.addExtension('css', {
		outputFileExtension: 'css',
		compile: async (inputContent, inputPath) => {
			if (!styles.includes(inputPath)) {
				return;
			}

			return async () => {
				const plugins = [
					pimport,
					minmax,
					autoprefixer
				];

				if (isProduction) {
					plugins.push(csso);
				}

				let output = await postcss(plugins).process(inputContent, {
					from: inputPath,
					map: isProduction
						? false
						: { inline: true }
				});

				return output.css;
			}
		}
	});

	// JavaScript

	config.addTemplateFormats('js');

	config.addExtension('js', {
		outputFileExtension: 'js',
		compile: async (content, path) => {
			if (path !== './src/js/index.js') {
				return;
			}

			return async () => {
				const output = await esbuild.build({
					entryPoints: [path],
					bundle: true,
					minify: isProduction,
					sourcemap: !isProduction ? 'inline' : false,
					write: false,
				});

				return output.outputFiles[0].text;
			}
		}
	});

	// YAML

	config.addDataExtension('yml', (contents) => {
		return yaml.load(contents);
	});

	// Internationalization

	config.addFilter('localeFromUrl', (url) => detectLocaleFromUrl(url));

	config.addFilter('localePath', (href, localeOrUrl) => {
		return localizePath(href, localeOrUrl);
	});

	config.addFilter('widont', (value) => {
		return widont(value);
	});

	config.addFilter('iconSvg', (svgMarkup, className, size = 32) => {
		return normalizeIconSvgAttributes(svgMarkup, className, size);
	});

    // Collections

    const collections = {
        'portfolio': 'src/portfolio/*/index.njk',
		'publications': 'src/publications/*/index.md'
    };

	config.addCollection('portfolio', (collectionApi) => {
		return collectionApi
			.getFilteredByGlob(collections.portfolio)
			.sort(byOrder);
	});

	config.addCollection('portfolioTop', (collectionApi) => {
		const collection = collectionApi.getFilteredByGlob(
			collections.portfolio
		);

		return collection
			.sort(byOrder)
			.slice(0, 6);
	});

	config.addFilter("filterBySlugList", function(collection, slugList) {
		return collection.filter(item => slugList.includes(item.fileSlug));
	});

	config.addCollection('publications', (collectionApi) => {
		return collectionApi
			.getFilteredByGlob(collections.publications)
			.sort(byOrder);
	});

    // Markdown

	config.addFilter('markdown', (value) => {
		return markdown.render(value ?? '');
	});

	config.setLibrary('md', markdown);

	// Typography

	config.addTransform('typography', (content, outputPath) => {
		if (!outputPath || !outputPath.endsWith('.html')) {
			return content;
		}

		const typographedContent = typograf.execute(content)
			.replace(/([^\s>])(<strong\b[^>]*>)/g, '$1 $2');

		return widontHtml(typographedContent);
	});

	// Passthrough copy

	[
		'src/fonts',
		'src/img',
        'src/portfolio/**/*.!(md)',
        'src/publications/**/*.!(md)',
		'src/files'
	].forEach(
		path => config.addPassthroughCopy(path)
	);

	// Config

	return {
		dir: {
			input: 'src',
			output: 'dist',
			includes: '_includes',
			layouts: '_layouts',
			data: '_data'
		},
		dataTemplateEngine: 'njk',
		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		templateFormats: [
			'md',
			'njk'
		],
	};
};
