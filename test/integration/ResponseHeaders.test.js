const {expect} = require('chai');
const {describe, it} = require('mocha');
const got = require('got');
const Router = require('../../src/routing/Router');

const {
  url, withFalcon
} = require('../lib/server');

describe('ResponseHeaders', function () {

  it('should respond with custom headers', function (done) {
    const router = new Router()
      .get('/',
        /**
         * @param {FalconResponse} res
         * @param req
         */
        (res, req) => {
          res.addHeader('content-type', 'application/xml');
          res.answer.ok('<?xml version="1.1" encoding="UTF-8" ?><root></root>');
        });

    async function sendRequest() {
      try {
        const answer = await got(url());
        expect(answer.headers['content-type']).to.be.equal('application/xml');
        done();
      } catch (e) {
        done(e);
      }
    }

    withFalcon(router, sendRequest);
  });
});