const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');
const pimport = require('postcss-import');
const fs = require('fs');

module.exports = function (config) {
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
              autoprefixer,
              csso
            ]).process(inputContent, { from: inputPath });
      
            return output.css;
          }
        }
      });

  config.addShortcode('year', () => `${new Date().getFullYear()}`);

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
      'md', 'njk'
    ],
  };
};
