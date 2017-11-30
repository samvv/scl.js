Change Log
==========

This document keeps track of any changes made to the software.

### v1.0.0

 - Fixed JavaScript not being pushed to registry

### v0.9.1

 - Some bugfixes in container implementations

### v0.9.0

 - Added a container type registration system
 - Made container composition work with some examples
 - Streamlined AVL and hash implementations
 - Switched to XXHash for much better hashing results
 - Removed UniqueContainer and MultiContainer interfaces
 - Renamed UnorderedContainer to Sequence and OrderedContainer to Structure
 
### v0.8.1


 - Updated the README

### v0.8.0

 - Rename UnorderedContainer to Sequence in interfaces
 - `add()` is now a required method of Container interface
 - Made iterator, next() and prev() optional in Cursor interface
 - Added tree-based dictionaries
 - Optimised min/max-search in AVL tree
 - Made order undefined for dictionaries
 - Removed sequenced list from hash implementation
 - Added basic support for container composition

### v0.7.2

 - Added variants of the hash-based dictionaries
 - Standard hash-based dictionary now replaces keys

### v0.7.1

 - Many fixes in hash implementation

### v0.7.0
  
 - Removed dangling ES6 wrappers
 - Added a hash set and hash dictionary 
 - Updated container API to include `deleteAt()`
 - Made all inserters return a cursor in container API
 - Updated list implementations to return cursors upon insertion
 - Added a tree set and tree dictionary
 - Removed unclear grid data structures

### v0.6.0

 - Introduced new cursor API for iterating through container elements
 - Updated vector, single-linked list and double-linked list to conform to new API
 - Added an AVL-tree implementation
 - Temporarily removed support for ES6 wrappers

### v0.5.1

 - Fixed missing compiled files in published package

### v0.5.0

 - Created a change log
 - Fixed missing stack implementation
 - Fixed `deleteAll` in list implementations
 - Added a queue implementation

### v0.4.1

 - Added a double-linked list implementation
 - Single-linked list insert is now always O(1)
 - Size querying of single-linked lists is no longer O(n)

