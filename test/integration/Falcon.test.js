const {expect} = require('chai');
const {describe, it} = require('mocha');
const got = require('got');
const Falcon = require('../../src/Falcon');
const Router = require('../../src/routing/Router');

const {
  url, useFalcon
} = require('../lib/server');

describe('Falcon', function () {

  it('should send HTML response if configured', function (done) {
    const router = new Router()
      .get('/', (res) => res.answer.ok('<div>A</div>'));
    const falcon = new Falcon()
      .use('/', router)
      .html();

    const makeRequest = async () => {
      try {
        const answer = await got(url());
        expect(answer.headers['content-type']).to.be.equal('text/html');
        expect(answer.body).to.be.equal('<div>A</div>');
        done();
      } catch (e) {
        done(e);
      }
    };

    useFalcon(falcon, makeRequest);
  });

  describe('Port checks', function () {
    it('should throw on listening to an invalid port', function (done) {
      const falcon = new Falcon();
      falcon.listen(null)
        .then(() => done('No exception'))
        .catch(e => {
          done();
        });
    });
  });

  it('should answer 500 if no answer provided', function (done) {
    const router = new Router().get('/', () => {
      // do nothing
    });
    const falcon = new Falcon().use('/', router);

    const makeRequest = async () => {
      try {
        await got(url(), {retry: 0});
        done('No 500');
      } catch (e) {
        try {
          const {error} = JSON.parse(e.body);
          expect(error.code).to.be.equal('INTERNAL');
          expect(error.message).to.be.equal('No answer provided');
          done();
        } catch (e) {
          done(e);
        }
      }
    };
    useFalcon(falcon, makeRequest);
  });

  it('should set port via setter', function (done) {
    const router = new Router()
      .get('/', (res) => res.answer.ok());
    const falcon = new Falcon()
      .use('/', router)
      .port(3333);

    const makeRequest = async () => {
      try {
        const answer = await got('http://localhost:3333');
        done();
      } catch (e) {
        done(e);
      }
    };

    useFalcon(falcon, makeRequest, false);
  });

  // todo: anything else to test here?
  it('should cancel request properly', function (done) {
    const router = new Router()
      .get('/', (res) => {
        return new Promise(resolve => {
          setTimeout(resolve, 1000);
          res.answer.ok();
        });
      });
    const falcon = new Falcon()
      .use('/', router);

    const makeRequest = async () => {
      const request = got(url());
      try {
        setTimeout(() => request.cancel(), 100);
        await request;
        done('Not cancelled');
      } catch (e) {
        e instanceof got.CancelError ?
          done() :
          done(e);
      }
    };

    useFalcon(falcon, makeRequest);
  });

  it('should shut down the server', function () {
    const router = new Router()
      .get('/', (res) => {
        return new Promise(resolve => {
          setTimeout(resolve, 1000);
          res.answer.ok();
        });
      });
    const falcon = new Falcon()
      .use('/', router);

    falcon.close();
  });
});