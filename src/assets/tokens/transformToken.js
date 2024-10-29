const StyleDictionary = require('style-dictionary').extend({
    source: ['./src/assets/tokens/tokens.json'],
    platforms: {
        scss: {
            transformGroup: 'scss',
            buildPath: 'build/scss',
            files: [
                {
                    destination: '_variables.scss',
                    format: 'scss/variables',
                },
            ],
        },
    }
});

StyleDictionary.buildAllPlatforms();