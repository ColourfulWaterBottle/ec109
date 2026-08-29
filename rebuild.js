// Rebuilds the embedded DATA object in index.html from the 6 source JSON files.
// Run with: node rebuild.js
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

const ct = read('data-consumer-theory.json');
const pw = read('data-producer-welfare.json');
const gt = read('data-gametheory-marketstructure.json');
const lct = read('data-learn-consumer-theory.json');
const lpw = read('data-learn-producer-welfare.json');
const lgt = read('data-learn-gametheory-marketstructure.json');

function tag(arr, block) {
  return arr.map(item => ({ ...item, block }));
}

const blocks = [ct, pw, gt].map(b => ({
  id: b.block,
  label: b.blockLabel,
  topics: b.topics,
}));

const flashcards = [
  ...tag(ct.flashcards, ct.block),
  ...tag(pw.flashcards, pw.block),
  ...tag(gt.flashcards, gt.block),
];
const mcq = [
  ...tag(ct.mcq, ct.block),
  ...tag(pw.mcq, pw.block),
  ...tag(gt.mcq, gt.block),
];
const openEnded = [
  ...tag(ct.openEnded, ct.block),
  ...tag(pw.openEnded, pw.block),
  ...tag(gt.openEnded, gt.block),
];
const lessons = [
  ...lct.lessons.map(l => ({ ...l, block: lct.block })),
  ...lpw.lessons.map(l => ({ ...l, block: lpw.block })),
  ...lgt.lessons.map(l => ({ ...l, block: lgt.block })),
];

const DATA = { blocks, flashcards, mcq, openEnded, lessons };
const dataLine = 'const DATA = ' + JSON.stringify(DATA) + ';';

const htmlPath = path.join(dir, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const marker = '/* ============================================================ */';
const startAnchor = 'const DATA = ';
const startIdx = html.indexOf(startAnchor);
if (startIdx === -1) throw new Error('Could not find "const DATA = " in index.html');
const endIdx = html.indexOf(marker, startIdx);
if (endIdx === -1) throw new Error('Could not find end marker after DATA block');

const newHtml = html.slice(0, startIdx) + dataLine + '\n' + html.slice(endIdx);
fs.writeFileSync(htmlPath, newHtml);

console.log('Rebuilt DATA block:');
console.log('  blocks:', blocks.length);
console.log('  flashcards:', flashcards.length);
console.log('  mcq:', mcq.length);
console.log('  openEnded:', openEnded.length);
console.log('  lessons:', lessons.length);
