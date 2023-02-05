const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');
const minmax = require('postcss-media-minmax');
const pimport = require('postcss-import');
const fs = require('fs');
const yaml = require('js-yaml');
const markdown = require('markdown-it')({ html: true });
const esbuild = require('esbuild');

module.exports = function (config) {

	// Styles

	config.addTemplateFormats('css');
	config.addExtension('css', {
		outputFileExtension: 'css',
		compile: async (inputContent, inputPath) => {
			if (inputPath !== './src/css/index.css') {
				return;
			}

			return async () => {
				let output = await postcss([
					pimport,
					minmax,
					autoprefixer,
					csso
				]).process(inputContent, { from: inputPath });

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
                return esbuild.buildSync({
                    entryPoints: [path],
                    minify: true,
                    bundle: true,
                    write: false,
                }).outputFiles[0].text;
            }
        }
    });

	// YAML

	config.addDataExtension('yml', (contents) => {
		return yaml.load(contents);
	});

    // Markdown

    config.addFilter('markdown', (value) => {
        return markdown.render(value);
    });

    config.setLibrary('md', markdown);

	// Passthrough copy

	[
		'src/fonts',
		'src/img',
	].forEach(
		path => config.addPassthroughCopy(path)
	);

	// Config

	return {
		dir: {
			input: 'src',
			output: 'dist',
			includes: '_includes',
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
