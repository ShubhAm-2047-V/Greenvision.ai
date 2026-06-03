const fs = require('fs');

const kn_te_gu = JSON.parse(fs.readFileSync('translations_kn_te_gu.json', 'utf8'));

function updateContext(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the translations object
  const startIdx = content.indexOf('const translations = {');
  let endIdx = -1;
  let braces = 0;
  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '{') braces++;
    if (content[i] === '}') {
      braces--;
      if (braces === 0) {
        endIdx = i;
        break;
      }
    }
  }
  
  const translationsCode = content.substring(startIdx, endIdx + 1);
  // We'll evaluate it to get the object, but since it might not be strict JSON, we use eval
  const translations = eval('(' + translationsCode.replace('const translations = ', '').replace(/;$/, '') + ')');
  
  // Combine
  for (const lang of ['kn', 'te', 'gu']) {
    translations[lang] = {};
    for (const key of Object.keys(translations['en'])) {
      translations[lang][key] = kn_te_gu[lang][key] || translations['en'][key];
    }
  }
  
  const newTranslationsCode = 'const translations = ' + JSON.stringify(translations, null, 2) + ';';
  
  // Replace in content
  content = content.replace(translationsCode, newTranslationsCode);
  
  // Add support for new locales in useEffect
  content = content.replace("['en', 'hi', 'mr']", "['en', 'hi', 'mr', 'kn', 'te', 'gu']");
  
  // Add translateDynamic function
  const translateFunction = `
  const translateDynamic = async (text, targetLocale) => {
    const loc = targetLocale || locale;
    if (!text) return '';
    if (loc === 'en') return text;
    try {
      const res = await fetch(\`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=\${loc}&dt=t&q=\${encodeURIComponent(text)}\`);
      const data = await res.json();
      return data[0].map(item => item[0]).join('');
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };
`;
  
  // Add translateDynamic inside TranslationProvider
  if (!content.includes('translateDynamic')) {
    const tFuncStart = content.indexOf('const t = (key) =>');
    content = content.slice(0, tFuncStart) + translateFunction + '\n  ' + content.slice(tFuncStart);
  }
  
  // Add to provider value
  content = content.replace('setLocale: changeLocale, t }', 'setLocale: changeLocale, t, translateDynamic }');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

updateContext('src/context/TranslationContext.js');
try {
  updateContext('frontend/src/context/TranslationContext.js');
} catch (e) {
  console.log('frontend/src/context/TranslationContext.js not updated: ' + e.message);
}

console.log('Done updating context files.');
