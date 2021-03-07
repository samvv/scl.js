
[![Build Status](https://travis-ci.org/samvv/scl.js.svg?branch=master)](https://travis-ci.org/samvv/scl.js) [![Coverage Status](https://coveralls.io/repos/github/samvv/scl.js/badge.svg?branch=master)](https://coveralls.io/github/samvv/scl.js?branch=master)

This is a curated, open-source project of common JavaScript collections with
full support for TypeScript. Initially started as a side-project to abstract
away some common patterns in other projects, this library continues to grow to
become a full standard library of efficient algorithms.

```
npm i scl
```

☝️ We could use a helping hand. If you think you're up for it,
[open an issue][4].

📖 Go straight to [the documentation][6]!

## Examples

Using the priority queue to sort some tasks on importance:

```ts
import { PriorityQueue } from "scl"

interface Task {
 priority: number
 description: string
}

const tasks = new PriorityQueue<Task>({
  compare: (a, b) => a.priority < b.priority
})

q.add({ description: 'Do the dishes.', priority: 5 })
q.add({ description: 'Buy food.', priority: 1 })
q.add({ description: 'Play some games.', priority: 52 })
q.add({ description: 'Go for a walk.', priority: 10 })
q.add({ description: 'Program like crazy.', priority: 20 })

const firstTask = q.pop()
assert.strictEqual(firstTask.description, 'Buy food.')
const secondTask = q.peek() // do not remove the task
assert.strictEqual(secondTask.description, 'Do the dishes.')
assert.strictEqual(q.size, 4)
```

Storing many different translations in the same dictionary:

```ts
import { TreeMultiDict } from "scl"

const d = new TreeMultiDict<number, string>()
d.emplace(1, 'uno')
d.emplace(2, 'dos')
d.emplace(1, 'one')
d.emplace(2, 'two')
d.emplace(2, 'duo')

console.log([...d.getValues(1)]); // will output ['one', 'uno']

console.log(d.hasKey(3)); // outputs false

const [added, pos] = d.emplace(3, 'tres')

console.log(d.size) // outputs 6

d.deleteAt(pos)

console.log(d.hasKey(3)); // outputs false
```

## Usage

The sources in this library target a relatively new ECMAScript version, so that
you are able to choose how much backwards-compatible the generated JavaScript
should be. You are expected to use this library with a bundler such as
[Webpack][1] or [Rollup][2]. Recent versions of NodeJS should also work without
any bundler.

There is experimental support for [tree shaking][7], which will result in much
smaller JavaScript bundles. If you encounter an issue with this, please take
your time to [report it][4].

## Documentation

All collections are documented using [TypeDoc][3], and [the latest
documentation is available here][6].

If you've found a mistake in the documentation or something is not quite clear,
don't hesitate to [open an issue][4].

## Support

Found an issue? A certain mistake? Need a certain kind of collection? [File an
issue][4] or [send me a pull request][5].

## Credits

Thanks to Wolfgang De Meuter's introductory course to algorithms and data
structures for teaching many of the concepts that are used in this library.

Many thanks to @w8r for providing a [reference implementation](https://github.com/w8r/avl) of the AVL-tree data structure.

## License

The MIT License

[1]: https://webpack.js.org/
[2]: https://rollupjs.org/
[3]: https://typedoc.org/
[4]: https://github.com/samvv/scl.js/issues/new
[5]: https://github.com/samvv/scl.js/fork
[6]: https://samvv.github.io/scl.js/
[7]: https://webpack.js.org/guides/tree-shaking/

