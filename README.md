# FADt

Functional Abstract Data-types

[![Build Status](https://travis-ci.org/edhille/fadt.svg?branch=master)](https://travis-ci.org/edhille/fadt)
[![Coverage Status](https://coveralls.io/repos/github/edhille/fadt/badge.svg?branch=master)](https://coveralls.io/github/edhille/fadt?branch=master)
[![Dependencies](https://david-dm.org/edhille/fadt.svg)](https://david-dm.org/edhille/fadt)

This is a simple library for definining immutable data-only classes, no
methods allowed. It also provides a "copy" method to create a modified copy of
an instance with the provided changes applied.

## A Simple Example

### Step One: Define your data-types

```javascript
import { createDataType, existy } from 'fadt';

const MyBaseDataType = createDataType(function (params) {
	if (!existy(params.fooCount)) throw new TypeError('"fooCount" is required');
	
	this.fooCount = params.fooCount;
	this.isBar = params.isBar || false;
	this.bazDescription = params.bazDescription || 'This is some serious baz!';
});

const MyChildDataType = createDataType(function (params) {
	if (!existy(params.subObject)) throw new TypeError('"subObject" is required');

	this.subObject = params.subObject;
	this.children = params.children || [];

	this.bazDescription = 'We only using the finest, artisinal baz'
}, MyBaseDataType);
```

### Step Two: Use them
```
try {
  const myData = new MyBaseDataType({
    fooCount: 1,
    isBar: true,
    bazDescription: 'I am baz!'
  });

  console.log(`isBar(${myData.isBar}), ${myData.fooCount}`); // bar(true), 1

  const myNextData = myData.next({ isBar: false });

  console.log(`bar(${myNextData.isBar}), ${myNextData.fooCount}`); // bar(false), 1
} catch (e) {
  console.error(`Oh no! ${e.message}`);
}
```

# API Reference
<a name="module_ADT"></a>
## ADT

* [ADT](#module_ADT)
    * [~createDataType(ctr, [ParentClass])](#module_ADT..createDataType) ⇒ <code>function</code>
    * [~Constructor](#module_ADT..Constructor) : <code>function</code>

<a name="module_ADT..createDataType"></a>
### ADT~createDataType(ctr, [ParentClass]) ⇒ <code>function</code>
Generate Abstract Data Type constructor

**Kind**: inner method of <code>[ADT](#module_ADT)</code>  
**Returns**: <code>function</code> - Constructor  

| Param | Type | Description |
| --- | --- | --- |
| ctr | <code>Constructor</code> | constructor function for validating/setting given params |
| [ParentClass] | <code>function</code> | constructor for parent class to inherit from |

<a name="module_ADT..Constructor"></a>
### ADT~Constructor : <code>function</code>
**Kind**: inner typedef of <code>[ADT](#module_ADT)</code>  
**Throws**:

- <code>TypeError</code> error thrown for any type validation


| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | key/value parameters for instance consruction |



## FAQ

### Why are you using stinky, old ES5 class syntax? Get with the program and
use the shiny, new ES2015 class syntax!

The astute reader will indeed notice that this library is using ES5 class
syntax. The reason for this is that the base constructor needs to fire last,
after all it's child classes have initialized in order to properly freeze the
instance. ES2015 classes require that the `super` method be invoked before any
other code in a `constructor`.
