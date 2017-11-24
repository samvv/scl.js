
This is a curated, open-source collection of common JavaScript containers with
full support for TypeScript. Initially started as a side-project to abstract
away some common patterns in other projects, this library grows to become 
a full standard library for JavaScript and friends.

:point_up: We could use a helping hand. If you think you're up for it,
[open an issue](https://github.com/samvv/typescript-containers/issues/new).

## Overview

### Interfaces

**scl** provides some interfaces which you can use as a template to define your
own custom containers, which in turn allows you to make use of one of the
various algoritms that come shipped with this library. Documentation for these
interfaces is pending.

| Container        | Type                  | Unique | Order     |
|------------------|-----------------------|--------|-----------|
| Bag              | T                     | No     | No        |
| Set              | T                     | Yes    | No        |
| List             | T                     | No     | Yes       |
| Vector           | T                     | No     | Yes       |
| Queuelike        | T                     | No     | Yes       |
| Dict             | Pair&lt;K, V&gt;      | Yes    | No        |
| MultiDict        | Pair&lt;K, V&gt;      | No     | No        |

### Implementations

A :heavy_check_mark: indicates that the implementation has been completed. On the other hand, a
missing :heavy_check_mark: means that implementation is stil pending or only
partially completed.

#### Unordered Containers

|                    | Name               | Add       | Remove    | Member    |
|--------------------|--------------------|-----------|-----------|-----------|
|                    | set/tree           | O(log(n)) | O(log(n)) | O(log(n)) |
|                    | dict/tree          | O(log(n)) | O(log(n)) | O(log(n)) |
|                    | set/es6            | O(1)      | O(1)      | O(1)      |
|                    | dict/string        | O(1)      | O(1)      | O(1)      |
|                    | dict/es6           | O(1)      | O(1)      | O(1)      |
|                    | dict/multi/string  | O(1)      | O(1)      | O(1)      |
|                    | dict/multi/es6     | O(1)      | O(1)      | O(1)      |
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

Consult the [API docs](http://samvv.github.io/project/sync-containers) for more information on how to use them.

## Support

You might also be interested in knowing [how this library's iterators
work](http://github.com/samvv/typescript-containers/wiki/Iterators).

Need to go asynchronous? Check out our [asynchronous
containers](https://github.com/samvv/typescript-async-containers) library.

Found an issue? A certain mistake? Need a certain kind of container? [File an
issue](https://github.com/samvv/typescript-containers/issues) or [send me a
pull request](https://github.com/samvv/typescript-containers/pulls).

## Credits

Thanks to Wolfgang De Meuter's introductory course to algorithms and data
structures for teaching many of the concepts that are used in this library.

Many thanks to @w8r for providing a [reference implementation](https://github.com/w8r/avl) of the AVL-tree data structure.

## License

Copyright 2017 Sam Vervaeck

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

