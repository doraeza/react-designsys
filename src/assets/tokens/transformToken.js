const fs = require('fs');
const path = require('path');

// 빌드 경로가 없으면 생성
const buildPath = path.join(__dirname, 'build/scss');
if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath, { recursive: true });
}

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