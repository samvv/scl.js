TypeScript Containers
=====================

> A collection of typed containers for JavaScript.

This is my personal collection of common JavaScript containers, plain and simple.
I was fed up with writing the same boilerplate code over and over again, and I
needed a library over which I had some control. I ended up writing my own.

| Container | Type             | Unique |
|-----------|------------------|--------|
| Bag       | T                | No     |
| Set       | T                | Yes    |
| Dict      | Pair&lt;K, V&gt; | Yes    |
| MultiDict | Pair&lt;K, V&gt; | No     |

Besides from the containers provided above, there are some additional containers:

 - **NamedSet<T>**: behaves the same as `MultiDict<string, T>` but without compile errors.

Found an issue? Need a certain kind of container? [File an
issue](https://github.com/samvv/typescript-containers/issues) or [send me a
pull request](https://github.com/samvv/typescript-containers/pulls).

