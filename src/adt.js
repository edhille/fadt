'use strict';

/** 
 * @module ADT
 *
 * @exports createDataType
 */

var merge = require('lodash.assignwith');

/**
 * @private
 */
function inherit(subClass, superClass) {
	if (typeof superClass !== 'function' && superClass !== null) {
		throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
	}
	
	subClass.prototype = Object.create(
		superClass && superClass.prototype, 
		{ constructor: { value: subClass, enumerable: false, writable: true, configurable: true  }
	});
	
	/* istanbul ignore else */
	if (superClass) subClass.__proto__ = superClass;

	subClass.inherit = inherit;
}

/**
 * @private
 */
function makeCloneable(obj) {
	var clone = {};

	Object.keys(obj).map(function openUpProp(prop) {
		Object.defineProperty(clone, prop, { value: obj[prop], enumerable: true, configurable: true, writable: true  });
	});

	return clone;
}

/**
 * @callback Constructor
 * @param params {object} - key/value parameters for instance consruction
 * @throws {TypeError} error thrown for any type validation
 */

/**
 * @name createDataType
 * @function
 * @description Generate Abstract Data Type constructor
 *
 * @param {Constructor} ctr - constructor function for validating/setting given params
 * @param {function} [ParentClass] - constructor for parent class to inherit from
 * @returns {function} Constructor
 *
 */
function createDataType(ctr, ParentClass) {
	var _constructor = function _constructor(params) {
		params = params || {};

		/* istanbul ignore else */
		if (ParentClass) {
			ParentClass.__childCall__ = true;
			ParentClass.call(this, params);
			ParentClass.__childCall__ = false;
		}
		
		ctr.call(this, params);

		/* istanbul ignore else */
		if (!_constructor.__childCall__ && Object.freeze) Object.freeze(this);
	};

	_constructor.prototype = Object.create(null);
	_constructor.prototype.constructor = _constructor;
	_constructor.prototype.next = function next(changes) {
		if (!changes || Object.keys(changes).length === 0) {
			return this;
		} else {
			return this.copy(changes);
		}
	};
	_constructor.prototype.copy = function copy(changes) {
		changes = changes || {};

		var clone = merge({}, makeCloneable(this), changes, function (a, b) {
			return b;
		});

		return new this.constructor(clone);
	};

	if (ParentClass) inherit(_constructor, ParentClass);

	return _constructor;
}

module.exports = createDataType;
