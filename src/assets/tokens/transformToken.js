import StyleDictionary from 'style-dictionary';

const styleDictionary = StyleDictionary.extend({
  source: ['./src/assets/tokens/global.json'],
  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [
        {
          destination: '_variables.scss',
          format: 'scss/variables',
        },
      ],
    },
  },
});

styleDictionary.buildAllPlatforms();