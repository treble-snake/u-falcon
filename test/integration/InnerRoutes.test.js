const {expect} = require('chai');
const {describe, it} = require('mocha');
const got = require('got');
const Falcon = require('../../src/Falcon');
const Router = require('../../src/routing/Router');
const {url, useFalcon} = require('../lib/server');


describe('InnerRoutes', function () {

  it('should inner', function (done) {

    const router = new Router()
      .get('/lvl1', (res) => res.answer.ok('lvl1'));

    const innerRouter1 = new Router()
      .get('/lvl2', (res) => res.answer.ok('lvl2'));

    const innerRouter2 = new Router()
      .get('/lvl3', (res) => res.answer.ok('lvl3'));

    innerRouter1
      .use('/inner2', innerRouter2);
    router
      .use('/inner1', innerRouter1);


    const falcon = new Falcon()
      .use('/start', router);

    const makeRequest = async () => {
      try {
        let result;

        result = await got(url('/start/lvl1'));
        expect(result.body).to.be.equal('lvl1');

        result = await got(url('/start/inner1/lvl2'));
        expect(result.body).to.be.equal('lvl2');

        result = await got(url('/start/inner1/inner2/lvl3'));
        expect(result.body).to.be.equal('lvl3');

        done();
      } catch (e) {
        done(e);
      }
    };

    useFalcon(falcon, makeRequest);
  });
});