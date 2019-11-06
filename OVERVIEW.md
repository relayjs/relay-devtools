# Overview

The React DevTools extension consists of multiple pieces:

- The **frontend** portion is the extension you see (the Elements tree, the Profiler, etc.).
- The **backend** portion is invisible. It runs in the same context as React itself. When React commits changes to e.g. the DOM, the backend is responsible for notifying the frontend by sending a message through the **bridge** (an abstraction around e.g. `postMessage`).

One of the largest performance bottlenecks of the old React DevTools was the amount of bridge traffic. Each time React commits an update, the backend sends every fiber that changed across the bridge, resulting in a lot of (JSON) serialization. The primary goal for the DevTools rewrite was to reduce this traffic. Instead of sending everything across the bridge, **the backend should only send the minimum amount required to render the Elements tree**. The frontend can request more information (e.g. an element's props) on demand, only as needed.

The old DevTools also rendered the entire application tree in the form of a large DOM structure of nested nodes. A secondary goal of the rewrite was to avoid rendering unnecessary nodes by using a windowing library (specifically [react-window](https://github.com/bvaughn/react-window)).

## Elements panel

### Serializing the tree

Every React commit that changes the tree in a way DevTools cares about results in an "_operations_" message being sent across the bridge. These messages are lightweight patches that describe the changes that were made. (We don't resend the full tree structure like in legacy DevTools.)

The payload for each message is a typed array. The first two entries are numbers that identify which renderer and root the update belongs to (for multi-root support). Then the strings are encoded in a [string table](#string-table). The rest of the array depends on the operations being made to the tree.

No updates are required for most commits because we only send the following bits of information: element type, id, parent id, owner id, name, and key. Additional information (e.g. props, state) requires a separate ["_inspectElement_" message](#inspecting-an-element).

#### String table

The string table is encoded right after the first two numbers.

It consists of:

1. the total length of next items that belong to string table
2. for each string in a table:
   1. encoded size
   2. a list of its UTF encoded codepoints

For example, for `Foo` and `Bar` we would see:

```
[
  8,   // string table length
  3,   // encoded display name size
  70,  // "F"
  111, // "o"
  111, // "o"
  3,   // encoded display name size
  66,  // "B"
  97,  // "a"
  114, // "r"
]
```

Later operations will reference strings by a one-based index. For example, `1` would mean `"Foo"`, and `2` would mean `"Bar"`. The `0` string id always represents `null` and isn't explicitly encoded in the table.

#### Adding a root node

Adding a root to the tree requires sending 4 numbers:

1. add operation constant (`1`)
1. fiber id
1. element type constant (`8 === ElementTypeRoot`)
1. profiling supported flag

For example, adding a root fiber with an id of 1:

```js
[
  1, // add operation
  1, // fiber id
  8, // ElementTypeRoot
  1, // this root's renderer supports profiling
];
```

#### Adding a leaf node

Adding a leaf node takes a variable number of numbers since we need to decode the name (and potentially the key):

1. add operation constant (`1`)
1. fiber id
1. element type constant (e.g. `1 === ElementTypeClass`)
1. parent fiber id
1. owner fiber id
1. string table id for `displayName`
1. string table id for `key`

For example, adding a function component `<Foo>` with an id 2:

```js
[
  1, // add operation
  2, // fiber id
  1, // ElementTypeClass
  1, // parent id
  0, // owner id
  3, // encoded display name size
  1, // id of "Foo" displayName in the string table
  0, // id of null key in the string table (always zero for null)
];
```

#### Removing a node

Removing a fiber from the tree (a root or a leaf) requires sending:

1. remove operation constant (`2`)
1. how many items were removed
1. number of children
   - (followed by a children-first list of removed fiber ids)

For example, removing fibers with ids of 35 and 21:

```js
[
  2, // remove operation
  2, // number of removed fibers
  35, // first removed id
  21, // second removed id
];
```

#### Re-ordering children

1. re-order children constant (`3`)
1. fiber id
1. number of children
   - (followed by an ordered list of child fiber ids)

For example:

```js
[
  3, // re-order operation
  15, // fiber id
  2, // number of children
  35, // first child id
  21, // second child id
];
```

#### Updating tree base duration

While profiling is in progress, we send an extra operation any time a fiber is added or a updated in a way that affects its tree base duration. This information is needed by the Profiler UI in order to render the "snapshot" and "ranked" chart views.

1. tree base duration constant (`4`)
1. fiber id
1. tree base duration

For example, updating the base duration for a fiber with an id of 1:

```js
[
  4, // tree base duration operation
  1, // fiber id
  32, // new tree base duration value
];
```

## Reconstructing the tree

The frontend stores its information about the tree in a map of id to objects with the following keys:

- id: `number`
- parentID: `number`
- children: `Array<number>`
- type: `number` (constant)
- displayName: `string | null`
- key: `number | string | null`
- ownerID: `number`
- depth: `number` <sup>1</sup>
- weight: `number` <sup>2</sup>

<sup>1</sup> The `depth` value determines how much padding/indentation to use for the element when rendering it in the Elements panel. (This preserves the appearance of a nested tree, even though the view is a flat list.)

<sup>2</sup> The `weight` of an element is the number of elements (including itself) below it in the tree. We cache this property so that we can quickly determine the total number of Elements as well as to find the Nth element within that set. (This enables us to use windowing.) This value needs to be adjusted each time elements are added or removed from the tree, but we amortize this over time to avoid any big performance hits when rendering the tree.

#### Finding the element at index N

The tree data structure lets us impose an order on elements and "quickly" find the Nth one using the `weight` attribute.

First we find which root contains the index:

```js
let rootID;
let root;
let rootWeight = 0;
for (let i = 0; i < this._roots.length; i++) {
  rootID = this._roots[i];
  root = this._idToElement.get(rootID);
  if (root.children.length === 0) {
    continue;
  } else if (rootWeight + root.weight > index) {
    break;
  } else {
    rootWeight += root.weight;
  }
}
```

We skip the root itself because don't display them in the tree:

```js
const firstChildID = root.children[0];
```

Then we traverse the tree to find the element:

```js
let currentElement = this._idToElement.get(firstChildID);
let currentWeight = rootWeight;
while (index !== currentWeight) {
  for (let i = 0; i < currentElement.children.length; i++) {
    const childID = currentElement.children[i];
    const child = this._idToElement.get(childID);
    const { weight } = child;
    if (index <= currentWeight + weight) {
      currentWeight++;
      currentElement = child;
      break;
    } else {
      currentWeight += weight;
    }
  }
}
```

## Inspecting an element

When an element is mounted in the tree, DevTools sends a minimal amount of information about it across the bridge. This information includes its display name, type, and key- but does _not_ include things like props or state. (These values are often expensive to serialize and change frequently, which would add a significant amount of load to the bridge.)

Instead DevTools lazily requests additional information about an element only when it is selected in the "Components" tab. At that point, the frontend requests this information by sending a special "_inspectElement_" message containing the id of the element being inspected. The backend then responds with an "_inspectedElement_" message containing the additional details.

### Polling strategy

Elements can update frequently, especially in response to things like scrolling events. Since props and state can be large, we avoid sending this information across the bridge every time the selected element is updated. Instead, the frontend polls the backend for updates about once a second. The backend tracks when the element was last "inspected" and sends a special no-op response if it has not re-rendered since then.

### Inspecting hooks

Hooks present a unique challenge for the DevTools because of the concept of _custom_ hooks. (A custom hook is essentially any function that calls at least one of the built-in hooks. By convention custom hooks also have names that begin with "use".)

So how does DevTools identify custom functions called from within third party components? It does this by temporarily overriding React's built-in hooks and shallow rendering the component in question. Whenever one of the (overridden) built-in hooks are called, it parses the call stack to spot potential custom hooks (functions between the component itself and the built-in hook). This approach enables it to build a tree structure describing all of the calls to both the built-in _and_ custom hooks, along with the values passed to those hooks. (If you're interested in learning more about this, [here is the source code](https://github.com/bvaughn/react-devtools-experimental/blob/master/src/backend/ReactDebugHooks.js).)

> **Note**: DevTools obtains hooks info by re-rendering a component. Breakpoints and console logs will be invoked during this additional (shallow) render.

### Performance implications

To mitigate the performance impact of re-rendering a component, DevTools does the following:

- Only function components that use _at least one hook_ are rendered. (Props and state can be analyzed without rendering.)
- Rendering is always shallow.
- Rendering is throttled to occur, at most, once per second.
- Rendering is skipped if the component has not updated since the last time its properties were inspected.

## Profiler

The Profiler UI is a powerful tool for identifying and fixing performance problems. The primary goal of the new profiler is to minimize its impact (CPU usage) while profiling is active. This can be accomplished by:

- Minimizing bridge traffic.
- Making expensive computations lazy.

The majority of profiling information is stored on the backend. The backend push-notifies the frontend of when profiling starts or stops by sending a "_profilingStatus_" message. (The frontend also asks for the current status after mounting by sending a "_getProfilingStatus_" message.)

When profiling begins, the frontend takes a snapshot/copy of each root. This snapshot includes the id, name, key, and child IDs for each node in the tree. (This information is already present on the frontend, so it does not require any additional bridge traffic.) While profiling is active, each time React commits– the frontend also stores a copy of the "_operations_" message (described above). Once profiling has finished, the frontend can use the original snapshot along with each of the stored "_operations_" messages to reconstruct the tree for each of the profiled commits.

When profiling begins, the backend records the base durations of each fiber currently in the tree. While profiling is in progress, the backend also stores some information <sup>1</sup> about each commit:

- Commit time and duration
- Which elements were rendered during that commit.
- Which interactions (if any) were part of the commit.

This information will eventually be required by the frontend in order to render its profiling graphs, but it will not be sent across the bridge until profiling has completed (to minimize the performance impact of profiling).

<sup>1</sup> In the future, the backend may also store additional metadata (e.g. which props/states changed between rendered for a given component).

### Combining profiling data

Once profiling is finished, the frontend requests profiling data from the backend one renderer at a time by sending a "_getProfilingData_" message. The backend responds with a "_profilingData_" message that contains per-root commit timing and duration information. The frontend then combines this information with its own snapshots to form a complete picture of the profiling session. Using this data, charts and graphs are lazily computed (and incrementally cached) on demand, based on which commits and views are selected in the Profiler UI.

### Importing/exporting data

Because all of the data is merged in the frontend after a profiling session is completed, it can be exported and imported (as JSON), enabling profiling sessions to be shared between users.

At the moment, screenshots are not included in the exported data (to keep the export filesize small) but this could be changed in the future.
