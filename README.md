TypeScript Containers
=====================

> A collection of typed containers for JavaScript.

```
npm install --save sync-containers
```

This is my personal collection of common JavaScript containers, plain and simple.
I was fed up with writing the same boilerplate code over and over again, and I
needed a library over which I had some control. I ended up writing my own.

:point_up: We could use a helping hand. If you think you're up for it, [open an issue](https://github.com/samvv/typescript-containers/issues/new).

### Interfaces

| Container        | Type                  | Unique | Order     |
|------------------|-----------------------|--------|-----------|
| Bag              | T                     | No     | No        |
| Set              | T                     | Yes    | No        |
| List             | T                     | No     | Yes       |
| Vector           | T                     | No     | Yes       |
| PriorityQueue    | T                     | No     | No        |
| Dict             | Pair&lt;K, V&gt;      | Yes    | No        |
| NamedSet         | Pair&lt;string, V&gt; | Yes    | No        |
| MultiDict        | Pair&lt;K, V&gt;      | No     | No        |

### Unordered Containers

| Name           | Memory    | Add       | Remove    | Member  |
|----------------|-----------|-----------|-----------|---------|
| HashSet        | O(n)      | O(1)      | O(1)      | O(1)    |
| NamedSet       | O(n)      | O(1)      | O(1)      | O(1)    |
| PriorityQueue  | Memory(n) | O(log(n)) | O(log(n)) | O(n)    |

### Ordered Containers

| Name              | Memory  | Insert  | Append  | Prepend | Member | Ref  | Next | Prev | Implemented |
|-------------------|---------|---------|---------|---------|--------|------|------|------|--------------
| ArrayVector       | O(n)    | O(n)    | O(n)    | O(n)    | O(n)   | O(1) | O(1) | O(1) | ✓           |
| SingleLinkedList  | O(n)    | O(n)    | O(1)    | O(1)    | O(n)   | O(n) | O(1) | O(n) | ✓           |
| DoubleLinkedList  | O(2n)   | O(n)    | O(1)    | O(1)    | O(n)   | O(n) | O(1) | O(1) | ✓           |

### Queues

| Name           | Enqueue   | Dequeue    | Reschedule   | Implemented |
|----------------------------------------------------------------------|
| Queue          | O(1)      | O(1)       | n.a.         |             | 
| PriorityQueue  | O(log(n)) | O(1)       | O(log(n))    | in progress |

Consult the [API docs](http://samvv.github.io/project/typescript-containers/api) for more information on how to use them.

You might also be interested in knowing [how this library's iterators work](http://github.com/samvv/typescript-containers/wiki/Iterators).

Need to go asynchronous? Check out our [asynchronous containers](https://github.com/samvv/typescript-async-containers) library.

Found an issue? A certain mistake? Need a certain kind of container? [File an
issue](https://github.com/samvv/typescript-containers/issues) or [send me a
pull request](https://github.com/samvv/typescript-containers/pulls).


