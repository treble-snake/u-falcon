const {expect} = require('chai');
const {describe, it} = require('mocha');
const got = require('got');
const Router = require('../../src/routing/Router');

const {
  url, withFalcon
} = require('../lib/server');

function sendHeaders(map) {
  return () => got(url(), {headers: map});
}

describe('RequestHeaders', function () {

  it('should save all headers', function (done) {
    const router = new Router()
      .get('/', (res, req) => {
        try {
          expect(req.getHeader('my-header-1')).to.be.equal('my-value-1');
          expect(req.getHeader('MY-header-2')).to.be.equal('my-value-2');
          expect(req.getHeader('my-HEADER-3')).to.be.equal('my-value-3');
          done();
        } catch (e) {
          done(e);
        } finally {
          res.answer.ok();
        }
      });

    withFalcon(router, sendHeaders({
      'my-header-1': 'my-value-1',
      'my-header-2': 'my-value-2',
      'my-header-3': 'my-value-3'
    }));
  });
});