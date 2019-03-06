const {expect} = require('chai');
const {describe, it} = require('mocha');
const Falcon = require('../../../src/Falcon');
const Router = require('../../../src/routing/Router');

const INCORRECT = 'Incorrect middleware';
const EMPTY_URL = 'URL cannot be empty';

describe('addingMiddleware', function () {

  it('should throw on adding primitive as middleware', function () {
    expect(() => new Falcon().use(1)).to.throw(Error, INCORRECT);
  });

  it('should throw on adding object as middleware', function () {
    expect(() => new Falcon().use({})).to.throw(Error, INCORRECT);
  });

  it('should throw on adding router with primitive as url', function () {
    expect(() => new Falcon().use(1, new Router())).to.throw(Error, INCORRECT);
  });

  it('should throw on adding router with empty url', function () {
    expect(() => new Falcon().use('', new Router())).to.throw(Error, EMPTY_URL);
  });

  it('should throw on adding primitive as router url', function () {
    expect(() => new Falcon().use(1, new Router())).to.throw(Error, INCORRECT);
  });

  it('should throw on adding object as router url', function () {
    expect(() => new Falcon().use({}, new Router())).to.throw(Error, INCORRECT);
  });

  it('should not throw on adding function and router', function () {
    new Falcon().use(Function(), new Router());
  });

  it('should not throw on adding extended router', function () {
    class MyRouter extends Router {

    }

    new Falcon().use('/', new MyRouter());
  });
});