const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');
const minmax = require('postcss-media-minmax');
const pimport = require('postcss-import');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const MarkdownIt = require('markdown-it');
const highlightjs = require('highlight.js/lib/common');
const esbuild = require('esbuild');
const { minify: minifyHtml } = require('html-minifier-terser');
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

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function getCodeLanguage(infoString) {
	const language = String(infoString ?? '')
		.trim()
		.split(/\s+/u)
		[0]
		?.toLowerCase();

	if (!language) {
		return '';
	}

	return highlightjs.getLanguage(language) ? language : '';
}

function renderCodeSnippet(code, infoString) {
	const language = getCodeLanguage(infoString);
	const languageClass = language ? ` language-${language}` : '';
	const highlightedCode = language
		? highlightjs.highlight(code, { language, ignoreIllegals: true }).value
		: escapeHtml(code);

	return `<pre class="code-snippet"><code class="code-snippet__code hljs${languageClass}">${highlightedCode}</code></pre>`;
}

function protectCodeFragments(content) {
	const protectedFragments = [];
	const placeholderPrefix = '__CODE_FRAGMENT_';
	const protectedContent = String(content ?? '').replace(/<(pre|code)\b[\s\S]*?<\/\1>/gi, (fragment) => {
		const index = protectedFragments.push(fragment) - 1;
		return `${placeholderPrefix}${index}__`;
	});

	return {
		protectedContent,
		restore: (value) => protectedFragments.reduce((result, fragment, index) => {
			return result.replace(`${placeholderPrefix}${index}__`, fragment);
		}, String(value ?? ''))
	};
}

const markdown = new MarkdownIt({
	html: true,
	highlight: (code, infoString) => renderCodeSnippet(code, infoString),
});

const defaultImageRenderer = markdown.renderer.rules.image
	|| ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
	const imageToken = tokens[idx];
	const src = imageToken.attrGet('src');

	if (!src) {
		return defaultImageRenderer(tokens, idx, options, env, self);
	}

	const title = imageToken.attrGet('title');
	const alt = self.renderInlineAsText(imageToken.children || [], options, env);
	const escapedSrc = escapeHtml(src);
	const escapedAlt = escapeHtml(alt);
	const titleMarkup = title
		? `<span class="article-image__title">${escapeHtml(title)}</span>`
		: '';
	const imageMarkup = `<picture class="article-image__media"><img class="article-image__img" src="${escapedSrc}" alt="${escapedAlt}" loading="lazy" decoding="async"></picture>`;
	const isLinkedImage = tokens[idx - 1]?.type === 'link_open' && tokens[idx + 1]?.type === 'link_close';

	if (isLinkedImage) {
		return `<span class="article-image">${imageMarkup}${titleMarkup}</span>`;
	}

	return `<span class="article-image"><a href="${escapedSrc}" class="article-image__link">${imageMarkup}${titleMarkup}</a></span>`;
};

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

		const { protectedContent, restore } = protectCodeFragments(content);
		const typographedContent = typograf.execute(protectedContent)
			.replace(/([^\s>])(<strong\b[^>]*>)/g, '$1 $2');

		return restore(widontHtml(typographedContent));
	});

	// HTML

	config.addTransform('htmlmin', async (content, outputPath) => {
		if (!isProduction || !outputPath || !outputPath.endsWith('.html')) {
			return content;
		}

		return minifyHtml(content, {
			collapseWhitespace: true,
			collapseBooleanAttributes: true,
			removeComments: true,
		});
	});

	// Passthrough copy

	[
		'src/fonts',
		'src/img',
		'src/portfolio/*/img/**/*',
		'src/publications/*/img/**/*',
		'src/files'
	].forEach(
		path => config.addPassthroughCopy(path)
	);

	config.addWatchTarget('src/publications/**/*.md');
	config.addWatchTarget('src/**/*.yml');
	config.addWatchTarget('src/**/*.yaml');

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
