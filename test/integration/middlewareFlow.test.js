const {expect} = require('chai');
const {describe, it} = require('mocha');
const sinon = require('sinon');
const got = require('got');
const Falcon = require('../../src/Falcon');
const Router = require('../../src/routing/Router');
const routers = require('../lib/routers');
const PORT = 4321;

const BASE_URL = 'http://localhost:4321';

function getUrl(url = '/') {
  return `${BASE_URL}${url}`;
}

/**
 * @param configFn
 * @param checksFn
 * @return {Promise<void>}
 */
async function withFalcon(configFn, checksFn) {
  const falcon = new Falcon();
  configFn(falcon);
  try {
    await falcon.listen(PORT);
    await checksFn();
  } finally {
    falcon.close();
  }
}

describe('middlewareFlow', function () {

  it('should preserve order of middleware execution', async function () {
    const m1 = sinon.spy();
    const m2 = sinon.spy();
    const m3 = sinon.spy();

    /** @param {Falcon} falcon */
    const config =
        falcon => falcon.use(m3).use(m2).use(m1).use('/', routers.dummy());
    const checks = async () => {
      await got(getUrl());
      sinon.assert.calledOnce(m1);
      sinon.assert.calledOnce(m2);
      sinon.assert.calledOnce(m3);

      sinon.assert.callOrder(m3, m2, m1);
    };

    await withFalcon(config, checks);
  });


  it('should stop chain execution on answer', async function () {
    const m1 = sinon.spy();
    const m2 = (res) => res.answer.ok({result: 42});
    const m3 = sinon.spy();

    /** @param {Falcon} falcon */
    const config =
      falcon => falcon.use(m1).use(m2).use(m3).use('/', routers.dummy());
    const checks = async () => {
      const result = await got(getUrl());

      expect(JSON.parse(result.body)).to.be.deep.equal({result: 42});
      sinon.assert.calledOnce(m1);
      sinon.assert.notCalled(m3);
    };

    await withFalcon(config, checks);
  });

  it('should carry cargo between middlewares', async function () {
    // const m1 = sinon.spy();
    // const m2 = (res) => res.answer.ok({result: 42});
    // const m3 = sinon.spy();
    //
    // /** @param {Falcon} falcon */
    // const config =
    //   falcon => falcon.use(m1).use(m2).use(m3).use('/', routers.dummy());
    // const checks = async () => {
    //   const result = await got(getUrl());
    //
    //   expect(JSON.parse(result.body)).to.be.deep.equal({result: 42});
    //   sinon.assert.calledOnce(m1);
    //   sinon.assert.notCalled(m3);
    // };
    //
    // await withFalcon(config, checks);
  });
});