const fs = require('fs');
const path = require('path');
const { transformTokens } = require('token-transformer');

// 추출 대상 파일 경로
const cssOutputDir = '../../style'; // CSS 파일을 저장할 경로
const cssDir = path.join(__dirname, cssOutputDir);

// 만약 디렉토리가 없다면 생성
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

// 변환 옵션
const transformerOptions = {};

// JSON 파일 읽기
fs.readFile(path.join(__dirname, 'tokens.json'), 'utf8', (err, data) => {
  if (err) throw err;
  const tokens = JSON.parse(data);

  // $metadata에 token key가 있음
  const tokenKeys = [...tokens.$metadata.tokenSetOrder];

  tokenKeys.forEach((key) => {
    // 변환 작업
    const resolved = transformTokens(
      tokens, // 변환할 파일
      key === 'light' || key === 'dark' ? ['global', key] : tokenKeys, // 참조 대상
      [...tokenKeys].filter((k) => k !== key), // 추출 제외 대상
      transformerOptions // 변환 옵션
    );

    // CSS 파일 생성
    const cssContent = generateCSS(resolved);
    fs.writeFileSync(
      path.join(cssDir, `${key}.css`),
      cssContent,
      (err) => {
        if (err) throw err;
      }
    );
  });
});

// JSON 데이터를 CSS 규칙으로 변환하는 함수
function generateCSS(tokenData) {
  let cssRules = '';

  // 모든 토큰을 순회하면서 CSS 변수 생성
  parseTokens(tokenData, '', cssRules);

  return `:root {\n${cssRules}}\n`;
}

// 재귀적으로 JSON 토큰을 순회하며 CSS 변수 생성
function parseTokens(tokens, parentKey, cssRules) {
  Object.entries(tokens).forEach(([key, value]) => {
    const currentKey = parentKey ? `${parentKey}-${key}` : key;

    if (typeof value === 'object' && value !== null && !value.hasOwnProperty('$value')) {
      // 객체일 경우, 재귀적으로 하위 속성을 탐색
      parseTokens(value, currentKey, cssRules);
    } else {
      // 값이 존재하는 경우, CSS 변수로 변환
      const resolvedValue = getTokenValue(value, tokens);
      if (typeof resolvedValue !== 'object') {
        cssRules += `--${currentKey.replace(/\s+/g, '-').toLowerCase()}: ${resolvedValue};\n`;
      }
    }
  });
}

// 토큰 값 추출 함수
function getTokenValue(tokenValue, allTokens) {
  if (typeof tokenValue === 'object' && tokenValue !== null) {
    if (tokenValue.hasOwnProperty('$value')) {
      // 객체 내의 $value 속성을 추출 및 참조 해석
      return resolveReferences(tokenValue.$value, allTokens);
    }
    return JSON.stringify(tokenValue); // 디버깅을 위해 JSON으로 변환
  }
  return tokenValue;
}

// 참조 해석 함수 (예: {dimension.sm} -> 해당 값으로 치환, 연산 지원)
function resolveReferences(value, allTokens) {
  if (typeof value !== 'string') return value;

  // '{' 와 '}' 사이의 문자열을 찾고, 이를 실제 값으로 치환
  const replaced = value.replace(/\{([^}]+)\}/g, (match, path) => {
    const keys = path.split('.');
    let resolvedValue = allTokens;

    for (let key of keys) {
      if (resolvedValue[key] !== undefined) {
        resolvedValue = resolvedValue[key];
      } else {
        console.warn(`Warning: Reference ${match} not found.`);
        return match; // 찾지 못한 경우 원래 참조 문자열을 반환
      }
    }

    // $value 속성 추출
    if (resolvedValue && typeof resolvedValue === 'object' && resolvedValue.hasOwnProperty('$value')) {
      return resolveReferences(resolvedValue.$value, allTokens); // 재귀적으로 참조된 값을 해석
    }
    return resolvedValue;
  });

  // 단순한 수학 연산 처리 (곱셈, 덧셈 등)
  try {
    return eval(replaced.replace(/[^\d\.\+\-\*\/\(\)\s]/g, ''));
  } catch (e) {
    return replaced;
  }
}