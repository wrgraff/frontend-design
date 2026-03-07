const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');
const minmax = require('postcss-media-minmax');
const pimport = require('postcss-import');
const yaml = require('js-yaml');
const markdown = require('markdown-it')({ html: true });
const esbuild = require('esbuild');
const Typograf = require('typograf');
const typograf = new Typograf({
	locale: ['en-GB']
});

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

    // Collections

    const collections = {
        'portfolio': 'src/portfolio/*/index.md',
		'videos': 'src/videos/*/index.md'
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

	config.addCollection('videos', (collectionApi) => {
		return collectionApi
			.getFilteredByGlob(collections.videos)
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

		return typograf.execute(content);
	});

	// Passthrough copy

	[
		'src/fonts',
		'src/img',
        'src/portfolio/**/*.!(md)',
        'src/videos/**/*.!(md)',
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
