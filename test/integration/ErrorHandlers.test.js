const {expect} = require('chai');
const {describe, it} = require('mocha');
const got = require('got');
const Falcon = require('../../src/Falcon');
const Router = require('../../src/routing/Router');

const {
  withFalcon, url, useFalcon
} = require('../lib/server');

const routers = require('../lib/routers');


describe('ErrorHandlers', function () {

  describe('404 errors', function () {

    const make404Request = (checks, done) => async () => {
      try {
        await got(url('/non-extisting'));
        return done(new Error('No 404 error'));
      } catch (e) {
        checks(e);
        done();
      }
    };

    it('should return default 404 with json body', function (done) {
      const checks = (e) => {
        expect(e.statusCode).to.be.equal(404);
        expect(e.headers['content-type']).to.be.equal('application/json');

        const body = JSON.parse(e.body);
        expect(body).to.be.deep.equal({
          error: {
            code: 'ENDPOINT_NOT_FOUND',
            url: '/non-extisting'
          }
        });
      };

      withFalcon(routers.dummy(), make404Request(checks, done))
        .catch(e => done(e));
    });

    it('should return custom 404 with json body', function (done) {
      const checks = (e) => {
        expect(e.statusCode).to.be.equal(404);
        expect(e.headers['content-type']).to.be.equal('application/json');
        const body = JSON.parse(e.body);
        expect(body).to.be.deep.equal({myError: 'OOPSY', at: '/non-extisting'});
      };

      const falcon = new Falcon()
        .use('/', routers.dummy())
        .errorHandlers({
          notFound: (res, req) =>
            res.answer.notFound({myError: 'OOPSY', at: req.url})
        });

      useFalcon(falcon, make404Request(checks, done))
        .catch(e => done(e));
    });

    it('should return custom 404 with text body', function (done) {
      const checks = (e) => {
        expect(e.statusCode).to.be.equal(404);
        expect(e.headers['content-type']).to.be.equal('text/plain');
        expect(e.body).to.be.equal('Dammit, no /non-extisting');
      };

      const falcon = new Falcon()
        .use('/', routers.dummy())
        .errorHandlers({
          notFound: (res, req) => res.answer.notFound(`Dammit, no ${req.url}`)
        });

      useFalcon(falcon, make404Request(checks, done))
        .catch(e => done(e));
    });
  });


  describe('400 (invalid body) errors', function () {
    const make400Request = (checks, done) => async () => {
      try {
        await got.post(url('/'), {
          body: '',
          headers: {'content-type': 'application/json'}
        });
        return done(new Error('No 400 error'));
      } catch (e) {
        checks(e);
        done();
      }
    };

    it('should return body parsing (400) error with json body', function (done) {
      const checks = (e) => {
        expect(e.statusCode).to.be.equal(400);
        expect(e.headers['content-type']).to.be.equal('application/json');

        const body = JSON.parse(e.body);
        const {error} = body;
        expect(error).to.have.property('code', 'INVALID_BODY');
      };

      withFalcon(routers.dummy(['post']), make400Request(checks, done))
        .catch(e => done(e));
    });

    it('should return custom 400 with json body', function (done) {
      const checks = (e) => {
        expect(e.statusCode).to.be.equal(400);
        expect(e.headers['content-type']).to.be.equal('application/json');
        const body = JSON.parse(e.body);
        expect(body).to.be.deep.equal({myError: 'OOPSY'});
      };

      const falcon = new Falcon()
        .use('/', routers.dummy(['post']))
        .errorHandlers({
          invalidBody: (res, req) =>
            res.answer.badRequest({myError: 'OOPSY'})
        });

      useFalcon(falcon, make400Request(checks, done))
        .catch(e => done(e));
    });

    it('should return custom 400 with text body', function (done) {
      const checks = (e) => {
        expect(e.statusCode).to.be.equal(400);
        expect(e.headers['content-type']).to.be.equal('text/plain');
        expect(e.body).to.be.equal('Dammit, invalid json');
      };

      const falcon = new Falcon()
        .use('/', routers.dummy(['post']))
        .errorHandlers({
          invalidBody: (res, req) => res.answer.badRequest('Dammit, invalid json')
        });

      useFalcon(falcon, make400Request(checks, done))
        .catch(e => done(e));
    });
  });


  describe('500 (internal) errors', function () {
    const make500Request = (checks, done) => async () => {
      try {
        await got(url('/'), {retry: 0});
        return done(new Error('No 500 error'));
      } catch (e) {
        checks(e);
        done();
      }
    };

    const router = () => new Router().get('/', () => {
      throw new Error('Oops');
    });

    it('should return default internal (500) error with json body', function (done) {

      const checks = (e) => {
        expect(e.statusCode).to.be.equal(500);
        expect(e.headers['content-type']).to.be.equal('application/json');

        const body = JSON.parse(e.body);
        const {error} = body;
        expect(error).to.have.property('code', 'INTERNAL');
        expect(error).to.have.property('message', 'Oops');
      };

      withFalcon(router(), make500Request(checks, done))
        .catch(e => done(e));
    });

    it('should return default internal (500) error with json body for text rejections', function (done) {

      const checks = (e) => {
        expect(e.statusCode).to.be.equal(500);
        expect(e.headers['content-type']).to.be.equal('application/json');

        const body = JSON.parse(e.body);
        const {error} = body;
        expect(error).to.have.property('code', 'INTERNAL');
      };

      const router = new Router()
        .get('/', async (res, req) => {
          await 1;
          // using req after "return", hacky-hacky
          req._uReq.getHeader('content-type');
          res.answer.ok();
        });

      const falcon = new Falcon()
        .use(async (res, req) => {
          return Promise.resolve();
        })
        .use('/', router);

      useFalcon(falcon, make500Request(checks, done))
        .catch(e => done(e));
    });

    it('should return custom 500 with json body', function (done) {
      const checks = (e) => {
        expect(e.statusCode).to.be.equal(500);
        expect(e.headers['content-type']).to.be.equal('application/json');
        const body = JSON.parse(e.body);
        expect(body).to.be.deep.equal({myError: 'OOPSY', msg: 'Oops'});
      };

      const falcon = new Falcon()
        .use('/', router())
        .errorHandlers({
          internal: (e, res, req) =>
            res.answer.internal({myError: 'OOPSY', msg: e.message})
        });

      useFalcon(falcon, make500Request(checks, done))
        .catch(e => done(e));
    });

    it('should return custom 500 with text body', function (done) {
      const checks = (e) => {
        expect(e.statusCode).to.be.equal(500);
        expect(e.headers['content-type']).to.be.equal('text/plain');
        expect(e.body).to.be.equal('Dammit, invalid all');
      };

      const falcon = new Falcon()
        .use('/', router())
        .errorHandlers({
          internal: (e, res, req) => res.answer.internal('Dammit, invalid all')
        });

      useFalcon(falcon, make500Request(checks, done))
        .catch(e => done(e));
    });
  });


});