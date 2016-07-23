TypeScript Containers
=====================

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

Examples at the bottom of the README.

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
| PriorityQueue  | O(n)      | O(log(n)) | O(log(n)) | O(n)    |

### Ordered Containers

| Name              | Memory  | Insert  | Append  | Prepend | Member | Ref  | Next | Prev |
|-------------------|---------|---------|---------|---------|--------|------|------|------|
| ArrayVector       | O(n)    | O(n)    | O(n)    | O(n)    | O(n)   | O(1) | O(1) | O(1) |
| SingleLinkedList  | O(n)    | O(n)    | O(1)    | O(1)    | O(n)   | O(n) | O(1) | O(n) |
| DoubleLinkedList  | O(2n)   | O(n)    | O(1)    | O(1)    | O(n)   | O(n) | O(1) | O(1) |

### Queues

| Name           | Enqueue   | Dequeue    | Reschedule   |
|----------------|-----------|------------|--------------|
| Queue          | O(1)      | O(1)       | n.a.         |
| PriorityQueue  | O(log(n)) | O(1)       | O(log(n))    |

Consult the [API docs](http://samvv.github.io/project/sync-containers) for more information on how to use them.

## Examples

### Lists and vectors

```ts
import { SingleLinkedList } from "sync-containers"


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
import { HashSet } from "sync-containers"

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
import { PriorityQueue } from "sync-containers" 

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
import { NamedSet } from "sync-containers"

const users = new NamedSet<User>
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

`HashDict<K, V>` and `HashMutliDict<K, V>` are just generalizations of
`NamedSet<T>`, so using them should be pretty straightforward.

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


