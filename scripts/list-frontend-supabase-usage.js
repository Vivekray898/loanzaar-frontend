// scripts/list-frontend-supabase-usage.js
// Scans src/ for direct Supabase client usage that should be moved to server APIs
const fg = require('fast-glob');
const fs = require('fs');

(async function(){
  const patterns = ['src/**/*.js','src/**/*.ts','src/**/*.jsx','src/**/*.tsx'];
  const paths = await fg(patterns, { dot: true });
  const results = [];
  for (const p of paths) {
    const content = fs.readFileSync(p, 'utf8');
    if (/\bsupabase\b/.test(content) && /\.from\(\s*['\"]profiles['\"]/.test(content)) {
      results.push(p);
    }
  }

  if (results.length === 0) {
    console.log('No frontend direct profiles queries found.');
  } else {
    console.log('Files with direct profiles queries (client-side):');
    results.forEach(r => console.log(' -', r));
    console.log('\nRecommendation: Replace direct queries with fetch calls to /api/ routes that use the service role key.');
  }
})();