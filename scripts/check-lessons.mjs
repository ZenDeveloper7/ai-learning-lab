import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await fs.readFile(new URL(path, root), 'utf8'));
const course = await read('app/course.json');
const contents = (await Promise.all(course.map(module => read(`app/lessons/module-${String(module.id).padStart(2, '0')}.json`)))).flat();
const expected = course.flatMap(module => module.lessons);
assert.equal(contents.length, expected.length);
assert.equal(new Set(contents.map(lesson => lesson.id)).size, expected.length);
assert.equal(new Set(contents.map(lesson => lesson.question)).size, expected.length);
let wordCount = 0;
for (const outline of expected) {
  const lesson = contents.find(content => content.id === outline.id);
  assert.ok(lesson, `Missing lesson ${outline.id}`);
  assert.equal(lesson.title, outline.title);
  assert.equal(lesson.scope, outline.scope);
  for (const field of ['explanation', 'mechanism', 'example']) {
    assert.ok(Array.isArray(lesson[field]) && lesson[field].length >= 2, `${lesson.id}: incomplete ${field}`);
    assert.ok(lesson[field].every(part => typeof part === 'string' && part.trim().length > 20));
  }
  for (const field of ['use', 'caution', 'question', 'answer']) assert.ok(typeof lesson[field] === 'string' && lesson[field].trim().length > 20, `${lesson.id}: missing ${field}`);
  const prose = [...lesson.explanation, ...lesson.mechanism, ...lesson.example, lesson.use, lesson.caution, lesson.question, lesson.answer].join(' ');
  assert.ok(!/\b(?:TODO|TBD|lorem ipsum)\b/i.test(prose), `${lesson.id}: placeholder`);
  wordCount += prose.split(/\s+/).length;
  for (const source of lesson.sources) assert.equal(new URL(source.url).protocol, 'https:');
}
console.log(`Validated ${contents.length} complete lessons, ${contents.length} unique self-checks, ${wordCount.toLocaleString()} teaching words.`);
