
import { expect } from "chai"
import { Sequence } from "../interfaces"
import { test } from "./_helpers"

test('Sequence.add() returns a cursor to the added element', (seq: Sequence<number>) => {
  const [added1, pos1] = seq.add(1);
  expect(added1).to.be.true;
  expect(pos1.value).to.equal(1);
});

test('Sequence.prepend() places the element at the beginning of the collection', (seq: Sequence<number>) => {
  seq.prepend(3);
  seq.prepend(2);
  seq.prepend(1);
  expect([...seq]).to.deep.equal([1, 2, 3]);
})

test('Sequence.prepend() returns a working cursor', (seq: Sequence<string>) => {
  seq.prepend('c');
  seq.prepend('b');
  const pos = seq.prepend('a');
  expect(pos).to.be.ok;
  expect(pos.value).to.equal('a');
  const prev = pos.prev!();
  expect(prev).to.be.null;
  const next = pos.next!();
  expect(next).to.be.ok;
  expect(next!.value).to.equal('b');
})

test('Sequence.append() places elements at the end of the collection', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  expect([...seq]).to.deep.equal(['a', 'b', 'c']);
})

test('Sequence.append() returns a working cursor', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  const pos = seq.append('c')
  expect(pos.value).to.equal('c')
  expect(pos).to.be.ok
  expect(pos.next!()).to.be.null
  const p = pos.prev!()
  expect(p).to.be.ok
  expect(p!.value).to.equal('b')
})

test('Sequence.insertBefore() inserts elements before a given position', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  expect(seq.size).to.equal(3);
  const pos = seq.at(1);
  expect(pos.value).to.equal('b');
  seq.insertBefore(pos, 'd');
  expect(seq.size).to.equal(4);
  expect([...seq]).to.deep.equal(['a', 'd', 'b', 'c']);
})

test('Sequence.insertBefore() returns a working cursor', (seq: Sequence<string>) => {
  seq.append('a');
  const pos = seq.append('c');
  const newPos = seq.insertBefore(pos, 'b');
  expect(newPos.value).to.equal('b');
  expect(newPos).to.be.ok;
  const p = newPos.prev!();
  expect(p).to.be.ok;
  expect(p!.value).to.equal('a');
  const n = newPos.next!();
  expect(n).to.be.ok;
  expect(n!.value).to.equal('c');
})

test('Sequence.insertBefore() returns a working cursor even when inserting at the beginning', (seq: Sequence<string>) => {
  const pos = seq.append('b');
  seq.append('c');
  expect(seq.size).to.equal(2);
  const newPos = seq.insertBefore(pos, 'a');
  expect(seq.size).to.equal(3);
  expect(newPos).to.be.ok;
  expect(newPos.value).to.equal('a');
  const p = newPos.prev!();
  expect(p).to.be.null;
  const n = newPos.next!();
  expect(n).to.be.ok;
  expect(n!.value).to.equal('b');
})

test('Sequence.insertAfter() returns a working cursor', (seq: Sequence<string>) => {
  const pos = seq.append('a');
  seq.append('c');
  const newPos = seq.insertAfter(pos, 'b')
  expect(newPos).to.be.ok
  expect(newPos.value).to.equal('b')
  const prev = newPos.prev!()
  expect(prev).to.be.ok
  expect(prev!.value).to.equal('a')
  const next = newPos.next!()
  expect(next).to.be.ok
  expect(next!.value).to.equal('c')
})

test('Sequence.insertAfter() returns a working cursor even when inserting at the end', (seq: Sequence<string>) => {

  seq.append('a');
  const pos = seq.append('b');
  expect(seq.size).to.equal(2);

  const newPos = seq.insertAfter(pos, 'c');
  expect(seq.size).to.equal(3);
  expect(newPos).to.be.ok;
  expect(newPos.value).to.equal('c');
  const prev = newPos.prev!();
  expect(prev).to.be.ok;
  expect(prev!.value).to.equal('b');
  const next = newPos.next!();
  expect(next).to.be.null;
})

test('Sequence.insertAfter() inserts elements after a given position', (seq: Sequence<string>) => {
  seq.append('a')
  seq.append('b')
  seq.append('c')
  const pos = seq.at(1)
  expect(pos.value).to.equal('b')
  seq.insertAfter(pos, 'd')
  expect([...seq]).to.deep.equal(['a', 'b', 'd', 'c'])
})


test('Sequence.at() returns a cursor to the correct element', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  expect(seq.at(0).value).to.equal('a');
  expect(seq.at(1).value).to.equal('b');
  expect(seq.at(2).value).to.equal('c');
})

test('Sequence.first() returns the first element', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  expect(seq.first()).to.equal('a');
})

test('Sequence.first() throws an error if the collection is empty', (seq: Sequence<string>) => {
  expect(() => seq.first()).to.throw(Error);
})

test('Sequence.last() returns the last element', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  expect(seq.last()).to.equal('c');
})

test('Sequence.last() throws an error if the collection is empty', (seq: Sequence<string>) => {
  expect(() => seq.last()).to.throw(Error);
})

test('Sequence.size reports the correct size', (seq: Sequence<string>) => {
  expect(seq.size).to.equal(0);
  seq.append('a');
  expect(seq.size).to.equal(1);
  seq.prepend('b');
  seq.append('c');
  expect(seq.size).to.equal(3);
  const pos = seq.at(1);
  seq.insertAfter(pos, 'd');
  expect(seq.size).to.equal(4);
  seq.insertBefore(pos, 'e');
  expect(seq.size).to.equal(5);
})

test('Sequence.toRange().values() generates the elements of the full sequence', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  seq.append('d');
  expect([...seq.toRange().values()]).to.deep.equal(['a','b','c','d']);
});

test('Sequence.toRange().size returns the correct size', (seq: Sequence<string>) => {
  expect(seq.toRange().size).to.equal(0);
  seq.add('a');
  expect(seq.toRange().size).to.equal(1);
  seq.add('b');
  expect(seq.toRange().size).to.equal(2);
  seq.add('c');
  expect(seq.toRange().size).to.equal(3);
});

test('Sequence.getAt() returns the element at the i-th position', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  expect(seq.getAt(0)).to.equal('a');
  expect(seq.getAt(1)).to.equal('b');
  expect(seq.getAt(2)).to.equal('c');
});

test('Sequence.getAt() throws a range error when the index is out of bounds;', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  expect(() => seq.getAt(3)).to.throw(RangeError);
});

test('Sequence.at().next() correcly traverses the elements of the container', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  seq.append('d');
  const r1 = seq.at(0);
  expect(r1).to.be.ok
  expect(r1.value).to.equal('a');
  const r2 = r1.next!();
  expect(r2).to.be.ok
  expect(r2!.value).to.equal('b');
  expect(r2).to.be.ok
  const r3 = r2!.next!();
  expect(r3).to.be.ok
  expect(r3!.value).to.equal('c');
  const r4 = r3!.next!();
  expect(r4).to.be.ok
  expect(r4!.value).to.equal('d');
  const r5 = r4!.next!();
  expect(r5).to.be.null;
});

test('Sequence.at().prev() correcly traverses the elements of the container in reverse order', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  seq.append('d');
  const r1 = seq.at(seq.size - 1);
  expect(r1).to.be.ok
  expect(r1.value).to.equal('d');
  const r2 = r1.prev!();
  expect(r2).to.be.ok
  expect(r2!.value).to.equal('c');
  expect(r2).to.be.ok
  const r3 = r2!.prev!();
  expect(r3).to.be.ok
  expect(r3!.value).to.equal('b');
  const r4 = r3!.prev!();
  expect(r4).to.be.ok
  expect(r4!.value).to.equal('a');
  const r5 = r4!.prev!();
  expect(r5).to.be.null;
});

test('Sequence.deleteAt() deletes the correct element', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  seq.append('d');
  const pos = seq.at(1);
  seq.deleteAt(pos);
  expect([...seq]).to.deep.equal(['a', 'c', 'd']);
});

test('Sequence.deleteAt() deletes the correct element even at the beginning', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  seq.append('d');
  const pos = seq.at(0);
  seq.deleteAt(pos);
  expect([...seq]).to.deep.equal(['b', 'c', 'd']);
});

test('Sequence.deleteAt() deletes the correct element even at the end', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  seq.append('d');
  const pos = seq.at(3);
  seq.deleteAt(pos);
  expect([...seq]).to.deep.equal(['a', 'b', 'c']);
});

test('Sequence.delete() deletes the first occurrence of the given element', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  seq.append('d');
  expect(seq.size).to.equal(4);
  seq.delete('b');
  expect(seq.size).to.equal(3);
  expect([...seq]).to.deep.equal(['a', 'c', 'd']);
});

test('Sequence.delete() can delete an element at the beginning of the collection', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  seq.append('d');
  expect(seq.size).to.equal(4);
  seq.delete('a');
  expect(seq.size).to.equal(3);
  expect(seq.first()).to.equal('b');
  expect([...seq]).to.deep.equal(['b', 'c', 'd']);
});

test('Sequence.delete() can delete an element at the end of the collection', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('c');
  seq.append('d');
  expect(seq.size).to.equal(4);
  seq.delete('d');
  expect(seq.size).to.equal(3);
  expect(seq.last()).to.equal('c');
  expect([...seq]).to.deep.equal(['a', 'b', 'c']);
});

test('Sequence.deleteAll() deletes all occurrences of the given element', (seq: Sequence<string>) => {
  seq.append('a');
  seq.append('b');
  seq.append('a');
  seq.append('a');
  seq.append('c');
  seq.append('d');
  seq.append('a');
  expect(seq.size).to.equal(7);
  seq.deleteAll('a');
  expect(seq.first()).to.equal('b');
  expect(seq.last()).to.equal('d');
  expect(seq.size).to.equal(3);
  expect([...seq]).to.deep.equal(['b', 'c', 'd']);
});


test('Sequence.clear() clears the collection', (seq: Sequence<string>) => {
  seq.append('a')
  seq.append('b')
  seq.append('c')
  expect([...seq]).to.deep.equal(['a', 'b', 'c']);
  seq.clear();
  expect([...seq]).to.deep.equal([])
})

