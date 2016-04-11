/* globals describe: true, before: true, beforeEach: true, afterEach: true, it: true */
'use strict';

var chai = require('chai');
var expect = chai.expect;

var createDataType = require('../src/adt');

describe('Abstract Data Type', function () {
	var Child, GrandChild;

	before(function (done) {
		Child = createDataType(function (params) {
			this.simpleProp = params.simpleProp;
			this.objProp = params.objProp;
			this.arrProp = params.arrProp;
		});

		GrandChild = createDataType(function (/* params */) {
			this.added = 'value';
		}, Child);
		done();
	});

	describe('freezing objects', function () {
		var child;
		var grandChild;
		var params;

		beforeEach(function (done) {
			params = {
				simpleProp: 'original',
				objProp: { original: 'value' },
				arrProp: ['original', 'value']
			};

			child = new Child(params);
			grandChild = new GrandChild(params);

			done();
		});

		afterEach(function (done) {
			params = null;
			child = null;
			grandChild = null;

			done();
		});

		it('cannot alter the simpleProp', function (done) {
			expect(function () { child.simpleProp = 'changed'; }).to.throw();
			expect(function () { grandChild.simpleProp = 'changed'; }).to.throw();

			done();
		});

		it('should throw if you try to reassign an object property', function (done) {
			expect(function () { child.objProp = { changed: 'changed' }; }).to.throw();
			expect(function () { grandChild.objProp = { changed: 'changed' }; }).to.throw();

			done();
		});

		it('will not prevent alters to to properties of sub-objects', function (done) {
			expect(function () { child.objProp.original = 'changed'; }).not.to.throw();
			expect(function () { grandChild.objProp.original = 'changed'; }).not.to.throw();

			done();
		});

		it('cannot reassign the arrProp', function (done) {
			expect(function () { child.arrProp = ['changed', 'values']; }).to.throw();
			expect(function () { grandChild.arrProp = ['changed', 'values']; }).to.throw();

			done();
		});

		it('will not prevent alters to an Array property', function (done) {
			expect(function () { child.arrProp[0] = 'changed'; }).not.to.throw();
			expect(function () { grandChild.arrProp[0] = 'changed'; }).not.to.throw();

			done();
		});

		it('cannot add a property', function (done) {
			expect(function () { child.newProp = 'fail'; }).to.throw();
			expect(function () { grandChild.newProp = 'fail'; }).to.throw();

			done();
		});

		it('should not be able to alter instance by altering params', function (done) {
			params.simpleProp = 'changed';

			expect(child.simpleProp).to.equal('original');
			expect(grandChild.simpleProp).to.equal('original');

			done();
		});

		it('should not get stuck on objects with cycles', function (done) {
			var objA = new Child({});

			expect((new Child({ objProp: objA }))).to.be.instanceOf(Child);

			done();
		});
	});

	describe('cloning instances', function () {

		describe('no changes', function () {
			var origInstance;
			var clonedInstance;

			beforeEach(function (done) {
				origInstance = new GrandChild({ original: 'value', another: 'thing' });
				clonedInstance = origInstance.next();

				done();
			});

			afterEach(function (done) {
				origInstance = clonedInstance = null;

				done();
			});

			it('should have original instance equaling cloned instance', function (done) {
				expect(origInstance).to.equal(clonedInstance);

				done();
			});
		});

		describe('empty changes', function () {
			var origInstance;
			var clonedInstance;

			beforeEach(function (done) {
				origInstance = new GrandChild({ original: 'value', another: 'thing' });
				clonedInstance = origInstance.next({});

				done();
			});

			afterEach(function (done) {
				origInstance = clonedInstance = null;

				done();
			});

			it('should have original instance equaling cloned instance', function (done) {
				expect(origInstance).to.equal(clonedInstance);

				done();
			});
		});

		describe('with simple property changes', function () {
			var origInstance;
			var clonedInstance;
			var testArrProp;

			beforeEach(function (done) {
				testArrProp = ['thing'];
				origInstance = new Child({ simpleProp: 'value', arrProp: testArrProp });
				clonedInstance = origInstance.next({ simpleProp: 'changed' });

				done();
			});

			afterEach(function (done) {
				origInstance = clonedInstance = null;

				done();
			});

			it('should not have original instance equaling cloned instance', function (done) {
				expect(origInstance).not.to.equal(clonedInstance);

				done();
			});

			it('should have changed value in cloned instance', function (done) {
				expect(clonedInstance.simpleProp).to.equal('changed');

				done();
			});

			it('should have property that was not modified', function (done) {
				expect(clonedInstance.arrProp).to.equal(testArrProp);

				done();
			});
		});

		describe('with array property changes', function () {
			var origInstance;
			var clonedInstance;

			beforeEach(function (done) {
				origInstance = new Child({ arrProp: ['value'], simpleProp: 'thing' });
				clonedInstance = origInstance.next({ arrProp: ['changed'] });

				done();
			});

			afterEach(function (done) {
				origInstance = clonedInstance = null;

				done();
			});

			it('should not have original instance equaling cloned instance', function (done) {
				expect(origInstance).not.to.equal(clonedInstance);

				done();
			});

			it('should have changed value in cloned instance', function (done) {
				expect(clonedInstance.arrProp).not.to.have.same.members(origInstance.arrProp);

				done();
			});

			it('should have property that was not modified', function (done) {
				expect(clonedInstance.simpleProp).to.equal('thing');

				done();
			});
		});

		describe('using #copy', function () {
			var orig;
			var copy;

			beforeEach(function (done) {
				orig= new GrandChild({ original: 'value', another: 'thing' });
				copy = orig.copy();

				done();
			});

			afterEach(function (done) {
				orig = copy = null;

				done();
			});

			it('should have original instance that is not equal to cloned instance', function (done) {
				expect(orig).not.to.equal(copy);

				done();
			});

		});
	});

	describe('creating with no properties', function () {
		var instance;

		beforeEach(function (done) {
			instance = new Child();
			done();
		});

		it('should be able to create an instance', function (done) {
			expect(instance).to.be.instanceof(Child);
			done();
		});
	});

	describe('subclassing', function () {

		it('should throw error if superclass is not a function', function (done) {
			expect(function () {
				createDataType(function (/* params */) {
					this.shouldFail = true;
				}, 'FAIL!');
			}).to.throw(TypeError);
			done();
		});
	});
});
