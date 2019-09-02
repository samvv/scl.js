
Welcome to the documentation of the Standard Collections Library for JavaScript.

This package is available on [NPM](https://npmjs.com/package/scl):

```
npm i scl
```

Use the links on the right to browse through the provided collections. Each
collection describes how you should import it.

This module also exports some generics you can use to define functions that
work on a specific category of collections. For example, to have a function
that fills any kind of collection with numbers, you could do the following:

```ts
import { Collection } from "scl"

function fill(collection: Collection<number>) {
  collection.add(1)
  collection.add(2)
  collection.add(3)
  collection.add(4)
  collection.add(5)
}
```

The following table lists what kind of collections are available and how they
relate to one another:

| Container        | Type                  | Unique    | Order     |
|------------------|-----------------------|-----------|-----------|
| Bag              | T                     | No        | No        |
| Set              | T                     | Yes       | No        |
| Sequence         | T                     | No        | Yes       |
| Queuelike        | T                     | No        | Yes       |
| Dict             | Pair&lt;K, V&gt;      | Yes       | No        |
| ManyDict         | Pair&lt;K, V&gt;      | Depends\* | No        |
| MultiDict        | Pair&lt;K, V&gt;      | No        | No        |

If you found a problem with the documentation, you can open an issue on
[GitHub](https://github.com/samvv/scl.js/issues). If you like this library,
don't forget to star [the repository](https://github.com/samvv/scl.js) and
leave a thank-you note somewhere in your project.  

