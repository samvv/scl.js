TypeScript Containers
=====================

> A collection of typed containers for JavaScript.

```
npm install --save sync-containers
```

This is my personal collection of common JavaScript containers, plain and simple.
I was fed up with writing the same boilerplate code over and over again, and I
needed a library over which I had some control. I ended up writing my own.

| Container        | Type                  | Unique | Order     |
|------------------|-----------------------|--------|------------
| Bag              | T                     | No     | No        |
| Set              | T                     | Yes    | No        |
| List             | T                     | No     | Yes       |
| Vector           | T                     | No     | Yes       |
| Dict             | Pair&lt;K, V&gt;      | Yes    | No        |
| MultiDict        | Pair&lt;K, V&gt;      | No     | No        |
| NamedSet         | Pair&lt;string, V&gt; | Yes    | No        |

### Unordered Containers

| Name           | Memory | Insert | Append | Prepend
|----------------|--------|--------|--------|-------------

### Ordered Containers

| Name              | Memory  | Insert  | Append  | Prepend | Member | Ref  | Next | Prev | 
|-------------------|---------|---------|---------|---------|--------|------|------|------|
| ArrayVector       | O(n)    | O(n)    | O(n)    | O(n)    | O(n)   | O(1) | O(1) | O(1) | 
| SingleLinkedList  | O(n)    | O(n)    | O(1)    | O(1)    | O(n)   | O(n) | O(1) | O(n) |
| DoubleLinkedList  | O(2n)   | O(n)    | O(1)    | O(1)    | O(n)   | O(n) | O(1) | O(1) |

Found an issue? Need a certain kind of container? [File an
issue](https://github.com/samvv/typescript-containers/issues) or [send me a
pull request](https://github.com/samvv/typescript-containers/pulls).

