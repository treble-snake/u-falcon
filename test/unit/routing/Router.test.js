const {expect} = require('chai');
const {describe, it} = require('mocha');
const Router = require('../../../src/routing/Router');

describe('Router', function () {

  const getRouter = () => new Router();

  it('should have empty array of handlers by default', function () {
    expect(getRouter().listHandlers()).to.be.deep.equal([]);
  });

  it('should add GET handler', function () {
    const router = getRouter();
    const handler = () => ({});
    router.get('/some-url', handler);

    expect(router.listHandlers()).to.be.deep.equal([{
      method: 'get',
      url: '/some-url',
      handler
    }]);
  });

  it('should add POST handler', function () {
    const router = getRouter();
    const handler = () => ({});
    router.post('/some-url', handler);

    expect(router.listHandlers()).to.be.deep.equal([{
      method: 'post',
      url: '/some-url',
      handler
    }]);
  });

  it('should add ANY handler', function () {
    const router = getRouter();
    const handler = () => ({});
    router.any('/some-url', handler);

    expect(router.listHandlers()).to.be.deep.equal([{
      method: 'any',
      url: '/some-url',
      handler
    }]);
  });
});