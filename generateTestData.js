#!/usr/bin/env node

function randomIntegers(count) {
  const array = new Array(count);
  for (let i = 0; i < count; i++) {
    array[i] = i;
  }
  for (let i = 0; i < count; i++) {
    const j = Math.floor(Math.random() * count)
    const keep = array[i]
    array[i] = array[j]
    array[j] = keep
  }
  return array;
}

for (let i = 0; i < 10; i++) {
  fs.writeFileSync(
    path.join(__dirname, 'test', `numbers${i}.json`),
    JSON.stringify(randomIntegers(1000), undefined, 2),
    'utf8'
  );
}

