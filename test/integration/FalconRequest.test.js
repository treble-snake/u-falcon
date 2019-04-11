const {expect} = require('chai');
const {describe, it} = require('mocha');
const got = require('got');
const Falcon = require('../../src/Falcon');
const Router = require('../../src/routing/Router');
const {withFalcon, createChecks} = require('../lib/server');
const PORT = 4321;

const BASE_URL = 'http://localhost:4321';

function url(url) {
  return `${BASE_URL}${url}`;
}

const jsonOptions = str => ({
  body: str,
  headers: {
    'content-type': 'application/json'
  }
});

describe('FalconRequest', function () {

  const makeGet = (checks, done, mountUrl = '/', reqUrl) => {
    const router = new Router().get(mountUrl, createChecks((res, req) => {
      checks(req);
    }, done));

    withFalcon(router, () => got(url(reqUrl || mountUrl)))
      .catch(done);
  };

  const makePost = (checks, done, options) => {
    options = options || {headers: {'content-type': 'application/x-www-form-urlencoded'}};
    const router = new Router().post('/', createChecks((res, req) => {
      checks(req);
    }, done));

    withFalcon(router, () => got.post(url('/'), options))
      .catch(done);
  };

  const postJson = (checks, done, str) => makePost(checks, done, jsonOptions(str));
  const postForm = (checks, done, obj) => makePost(checks, done, {
    form: true,
    body: obj
  });

  describe('method', function () {
    it('should return get', function (done) {
      const checks = (req) => expect(req.method).to.be.equal('get');
      makeGet(checks, done);
    });

    it('should return post', function (done) {
      const checks = (req) => expect(req.method).to.be.equal('post');
      makePost(checks, done);
    });
  });

  describe('url', function () {
    it('should return current url', function (done) {
      const checks = (req) => expect(req.url).to.be.equal('/some/path');
      makeGet(checks, done, '/some/path', '/some/path?q=1#hash');
    });
  });

  describe('query', function () {

    it('should return empty object on empty query', function (done) {
      const checks = req => expect(req.query).to.be.deep.equal({});
      makeGet(checks, done);
    });

    it('should parse property without value', function (done) {
      const checks = req => expect(req.query).to.be.deep.equal({prop: null});
      makeGet(checks, done, '/', '/?prop');
    });

    it('should parse properties with values', function (done) {
      const checks = req =>
        expect(req.query).to.be.deep.equal({prop: 'one', p2: '2'});
      makeGet(checks, done, '/', '/?prop=one&p2=2');
    });

    it('should parse properties with decoded values', function (done) {
      const checks = req => expect(req.query).to.be.deep.equal({prop: 'привет'});
      makeGet(checks, done, '/', '/?prop=%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82');
    });

    it('should parse fold duplicate properties', function (done) {
      const checks = req =>
        expect(req.query).to.be.deep.equal({prop: 'one', arr: 'a2'});
      makeGet(checks, done, '/', '/?prop=one&arr=a1&arr=a2');
    });

    it('should parse array properties', function (done) {
      const checks = req =>
        expect(req.query).to.be.deep.equal({prop: 'one', arr: ['a1', 'a2']});
      makeGet(checks, done, '/', '/?prop=one&arr[]=a1&arr[]=a2');
    });
  });

  describe('body', function () {
    describe('unsupported content type', function () {
      it('should return 400 on unsupported content type', async function () {
        const falcon = new Falcon().use('/', new Router().post('/', res => res.answer.ok()));
        try {
          await falcon.listen(PORT);
          await got.post(url('/'), {
            headers: {
              'content-type': 'unknown'
            }
          });
        } catch (e) {
          // todo: specify format
          expect(e.statusCode).to.be.equal(400);
          return;
        } finally {
          falcon.close();
        }

        throw new Error('Did not get status 400');
      });
    });

    describe('json', function () {
      const sendInvalidJson = async (json) => {
        const falcon = new Falcon().use('/', new Router().post('/', res => res.answer.ok()));
        try {
          await falcon.listen(PORT);
          await got.post(url('/'), jsonOptions(json));
        } catch (e) {
          expect(e.statusCode).to.be.equal(400);
          return;
        } finally {
          falcon.close();
        }

        throw new Error('Did not get status 400');
      };

      it('should answer 400 on empty json', async function () {
        await sendInvalidJson('');
      });

      it('should answer 400 on invalid json', async function () {
        await sendInvalidJson('{a": "b"}');
      });

      it('should parse json null', function (done) {
        const checks = req => expect(req.body).to.be.equal(null);
        postJson(checks, done, 'null');
      });

      it('should parse json primitive', function (done) {
        const checks = req => expect(req.body).to.be.equal(123);
        postJson(checks, done, '123');
      });

      it('should parse json object', function (done) {
        const obj = {
          a: 'str',
          b: 123,
          c: true,
          d: null,
          e: [1, 2, 3],
          j: {
            k: 'str',
            l: {
              m: 123
            }
          }
        };

        const checks = req => expect(req.body).to.be.deep.equal({...obj});
        postJson(checks, done, JSON.stringify(obj));
      });

      it('should parse big (2-chunked) json object', function (done) {
        const obj = require('../fixtures/2-chuck');

        const checks = req => expect(req.body).to.be.deep.equal({...obj});
        postJson(checks, done, JSON.stringify(obj));
      });

      it('should parse big (4-chunked) json object', function (done) {
        const obj = require('../fixtures/4-chuck');

        const checks = req => expect(req.body).to.be.deep.equal({...obj});
        postJson(checks, done, JSON.stringify(obj));
      });
    });

    describe('www-form-urlencoded', function () {
      it('should parse empty from', function (done) {
        const data = {};
        const checks = req => expect(req.body).to.be.deep.equal({...data});
        postForm(checks, done, data);
      });

      it('should parse simple from', function (done) {
        const data = {a: '1', b: 'str'};
        const checks = req => expect(req.body).to.be.deep.equal({...data});
        postForm(checks, done, data);
      });
    });
  });
});