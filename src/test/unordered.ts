
import { Collection } from "../interfaces"
import { expect } from "chai"
import { test } from "./_helpers"

test('Container.has() correctly reports added elements as being present', (coll: Collection<string>) => {
  expect(coll.has('a')).to.be.false;
  coll.add('a');
  expect(coll.has('a')).to.be.true;
  expect(coll.has('b')).to.be.false;
  coll.add('b');
  expect(coll.has('b')).to.be.true;
  expect(coll.has('d')).to.be.false;
  coll.add('d');
  expect(coll.has('d')).to.be.true;
})

test('Coontainer.delete() successfully removes elements', (coll: Collection<string>) => {
  coll.add('a');
  coll.add('b');
  coll.add('d');
  expect(coll.has('a')).to.be.true;
  coll.delete('a');
  expect(coll.has('a')).to.be.false;
  expect(coll.has('b')).to.be.true;
  coll.delete('b');
  expect(coll.has('b')).to.be.false;
  expect(coll.has('d')).to.be.true;
  coll.delete('d');
  expect(coll.has('d')).to.be.false;
});

test('reports the correct size', (coll: Collection<string>) => {
  expect(coll.size).to.equal(0);
  coll.add('a');
  expect(coll.size).to.equal(1);
  coll.add('b');
  expect(coll.size).to.equal(2);
  coll.add('coll');
})

