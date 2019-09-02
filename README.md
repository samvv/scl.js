
[![Build Status](https://travis-ci.org/samvv/scl.js.svg?branch=master)](https://travis-ci.org/samvv/scl.js) [![Coverage Status](https://coveralls.io/repos/github/samvv/scl.js/badge.svg?branch=master)](https://coveralls.io/github/samvv/scl.js?branch=master)

This is a curated, open-source project of common JavaScript collections with
full support for TypeScript. Initially started as a side-project to abstract
away some common patterns in other projects, this library grows to become 
a full standard library for JavaScript and friends.

:point_up: We could use a helping hand. If you think you're up for it,
[open an issue](https://github.com/samvv/scl.js/issues/new).

```ts
import TreeDict from "scl/dict/multi/tree"

const d = new TreeDict();
d.emplace(1, 'uno');
d.emplace(2, 'dos');
d.emplace(1, 'one');
d.emplace(2, 'two');
d.emplace(2, 'duo');

console.log(d.getValues(1)); // will output ['one', 'uno']

console.log(d.hasKey(3)); // outputs false

const pos = d.emplace(3, 'tres');

console.log([...d]) // outputs [1, 2, 3] in order

d.deleteAt(pos)

console.log([...d]) // outputs [1, 2] in order

```

### Implementations

A :heavy_check_mark: indicates that the implementation has been completed. On the other hand, a
missing :heavy_check_mark: means that implementation is stil pending or only
partially completed.

#### Unordered Containers

|                    | Name               | Add       | Remove    | Member    |
|--------------------|--------------------|-----------|-----------|-----------|
| :heavy_check_mark: | set/tree           | O(log(n)) | O(log(n)) | O(log(n)) |
| :heavy_check_mark: | set/hash           | O(1)      | O(1)      | O(1)      |
| :heavy_check_mark: | dict/tree          | O(log(n)) | O(log(n)) | O(log(n)) |
| :heavy_check_mark: | dict/hash          | O(1)      | O(1)      | O(1)      |
| :heavy_check_mark: | dict/many/tree     | O(log(n)) | O(log(n)) | O(log(n)) |
| :heavy_check_mark: | dict/many/hash     | O(1)      | O(1)      | O(1)      |
| :heavy_check_mark: | dict/multi/tree    | O(log(n)) | O(log(n)) | O(log(n)) |
| :heavy_check_mark: | dict/multi/hash    | O(1)      | O(1)      | O(1)      |
| :heavy_check_mark: | queue              | O(1)      | O(1)      | O(n)      |
| :heavy_check_mark: | stack              | O(1)      | O(1)      | O(n)      |
| :heavy_check_mark: | priority-queue     | O(log(n)) | O(log(n)) | O(n)      |


#### Ordered Containers

|                    | Name               | Memory  | Insert  | Append  | Prepend | Member | At   | Next | Prev |
|--------------------|--------------------|---------|---------|---------|---------|--------|------|------|------|
| :heavy_check_mark: | vector             | O(n)    | O(n)    | O(n)    | O(n)    | O(n)   | O(1) | O(1) | O(1) |
| :heavy_check_mark: | list/single        | O(n)    | O(1)    | O(1)    | O(1)    | O(n)   | O(n) | O(1) | O(1) |
| :heavy_check_mark: | list/double        | O(2n)   | O(1)    | O(1)    | O(1)    | O(n)   | O(n) | O(1) | O(1) |

#### Queue-like structures

|                    | Name           | Enqueue   | Dequeue    | Reschedule   |
|--------------------|----------------|-----------|------------|--------------|
| :heavy_check_mark: | stack          | O(1)      | O(1)       | n.a.         |
| :heavy_check_mark: | queue          | O(1)      | O(1)       | n.a.         |
| :heavy_check_mark: | priority-queue | O(log(n)) | O(1)       | O(log(n))    |

#### Special structures

|                    | Name     | Insert    | Delete    | Successor | Predecessor |
|--------------------|----------|-----------|-----------|-----------|-------------|
| :heavy_check_mark: | AVL tree | O(log(n)) | O(log(n)) | O(log(n)) | O(log(n))   | 

Consult the [API docs](http://samvv.github.io/project/sync-collections) for more information on how to use them.

## Support

Found an issue? A certain mistake? Need a certain kind of collection? [File an
issue](https://github.com/samvv/scl.js/issues) or [send me a
pull request](https://github.com/samvv/scl.js/pulls).

## Credits

Thanks to Wolfgang De Meuter's introductory course to algorithms and data
structures for teaching many of the concepts that are used in this library.

Many thanks to @w8r for providing a [reference implementation](https://github.com/w8r/avl) of the AVL-tree data structure.

## License

The MIT License

