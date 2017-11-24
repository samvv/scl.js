
const TEST_SET_COUNT = 9;

export function forEachTestSet(callback) {
  for (let i = 1; i <= TEST_SET_COUNT; ++i) {
    callback(require(`./numbersInsert${i}`), require(`./numbersRemove${i}`), i);
  }
}

