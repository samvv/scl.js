Standard JavaScript Containers Library
======================================

> A collection of typed containers for JavaScript.

```
npm install --save sync-containers
```

This is my personal collection of common JavaScript containers, plain and simple.
I was fed up with writing the same boilerplate code over and over again, and I
needed a library over which I had some control. I ended up writing my own.

:point_up: We could use a helping hand. If you think you're up for it,
[open an issue](https://github.com/samvv/typescript-containers/issues/new).

:warning: These containers have not extensively been tested just yet. However,
I do make use of them in my projects, so most common use cases should work.
Above that, you are invited to make use of them and report any issue on GitHub.

The interfaces are fully documented. You can find the full documentation
[here](https://samvv.github.io/typescript-containers).

Examples at the bottom of the README.

### Interfaces

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
missing :heavy_check_mark: means that implementation is stil pending.

### Unordered Containers

|                    | Name              | Memory    | Add       | Remove    | Member  |
|--------------------|-------------------|-----------|-----------|-----------|---------|
| :heavy_check_mark: | set/string        | O(n)      | O(1)      | O(1)      | O(1)    |
| :heavy_check_mark: | set/es6           | O(2n)     | O(1)      | O(1)      | O(1)    |
| :heavy_check_mark: | dict/string       | O(n)      | O(1)      | O(1)      | O(1)    |
| :heavy_check_mark: | dict/es6          | O(2n)     | O(1)      | O(1)      | O(1)    |
| :heavy_check_mark: | dict/multi/string | O(n)      | O(1)      | O(1)      | O(1)    |
| :heavy_check_mark: | dict/multi/es6    | O(2n)     | O(1)      | O(1)      | O(1)    |
|                    | queue             | O(n)      | O(1)      | O(1)      | O(n)    |
| :heavy_check_mark: | stack             | O(n)      | O(1)      | O(1)      | O(n)    |
|                    | priority-queue    | O(n)      | O(log(n)) | O(log(n)) | O(n)    |

### Ordered Containers

|                    | Name               | Memory  | Insert  | Append  | Prepend | Member | At   | Next | Prev |
|--------------------|--------------------|---------|---------|---------|---------|--------|------|------|------|
| :heavy_check_mark: | vector       | O(n)    | O(n)    | O(n)    | O(n)    | O(n)   | O(1) | O(1) | O(1) |
| :heavy_check_mark: | list/single        | O(n)    | O(n)    | O(1)    | O(1)    | O(n)   | O(n) | O(1) | O(n) |
|                    | list/double        | O(2n)   | O(n)    | O(1)    | O(1)    | O(n)   | O(n) | O(1) | O(1) |

### Queue-like structures

|                    | Name           | Enqueue   | Dequeue    | Reschedule   |
|--------------------|----------------|-----------|------------|--------------|
| :heavy_check_mark: | stack          | O(1)      | O(1)       | n.a.         |
|                    | queue          | O(1)      | O(1)       | n.a.         |
|                    | priority-queue | O(log(n)) | O(1)       | O(log(n))    |

Consult the [API docs](http://samvv.github.io/project/sync-containers) for more information on how to use them.

## Examples

### Lists and vectors

```ts
import SingleLinkedList from "sync-containers/list/single"

const difficulties = new SingleLinkedList<string>()

difficulties.append('hard'))
difficulties.prepend(('easy'))
difficulties.insertBefore(difficulties.end(), 'medium')) // takes long for SL-lists

for (const level of difficulties)
  console.log(level)

// Output:
// easy
// medium
// hard

difficulties.clear()
// container now empty
```

The same example can be used with an `ArrayVector`, the only difference being
that operations have a different time complexity (see the tables above).

### Sets

```ts
import HashSet from "sync-containers/set/es6"

interface Service { name: string }

const testService = new TestService()
    , fooService = new FooService()

const services = new HashSet<Service>()
services.add(testService)
services.has(testService) // true
services.has(fooService) // false
services.add(fooService)
services.add(testService) // throws error: already added

// order of iteration is NOT guaranteed!
for (const service of services)
  console.log(service.name)

set.remove(testService)
```

### Queues and priority queues

Building on top of the first example:

```ts
import PriorityQueue from "sync-containers/priority-queue" 

interface Level {
  difficulty: number
}

class EasyLevel implements Level { difficulty = 1 }
class HardLevel implements Level { difficulty = 2 }
class MasterLevel implements Level { difficulty = 3 }

const levels = new PriorityQueue<Level>((a, b) => a.difficulty < b.difficulty)
levels.enqueue(new HardLevel())
levels.enqueue(new EasyLevel())
levels.enqueue(new MasterLevel())

levels.dequeue() // easy level
levels.dequeue() // hard level
levels.dequeue() // master level
```

The same example can be used with a normal queue, the only difference being
that levels will be `dequeue()`-ed in the order they were inserted.

### Dictionaries 

```ts
// a named set is a special kind of dict
import StringDict "sync-containers/dict/string"

const users = new StringDict<User>()
users.addPair("bertie", {
  email: "bertie@yahoo.com"
})
users.add({
  key: "benjamin"
  value: {
    email: "benjamin@gmail.com"
  }
})

users.hasKey("benjamin") // true
users.hasKey("anne") // false

users.getValue("benjamin") // { email: ... }
users.getValue("mary") // throws error

for (const pair of users)
  console.log(`User ${pair.key} has email ${pair.value.email}`)

```

## Credits 

Thanks to [Wolfang de Meuter](https://soft.vub.ac.be/soft/user/128) of the
[Software Langagues Lab](https://soft.vub.ac.be/soft/) for teaching me the data
structures which are contained in this library and for providing a reference
implementation which highly influenced this library.

## Support

You might also be interested in knowing [how this library's iterators work](http://github.com/samvv/typescript-containers/wiki/Iterators).

Need to go asynchronous? Check out our [asynchronous containers](https://github.com/samvv/typescript-async-containers) library.

Found an issue? A certain mistake? Need a certain kind of container? [File an
issue](https://github.com/samvv/typescript-containers/issues) or [send me a
pull request](https://github.com/samvv/typescript-containers/pulls).


