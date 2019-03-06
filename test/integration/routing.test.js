const {expect} = require('chai');
const {describe, it} = require('mocha');
const got = require('got');
const Falcon = require('../../src/Falcon');
const Router = require('../../src/routing/Router');
const PORT = 4321;

const BASE_URL = 'http://localhost:4321';

function getUrl(url) {
  return `${BASE_URL}${url}`;
}

/**
 * @param {string[]} urls
 * @return {Router}
 */
function routerFor(urls) {
  return urls.reduce((router, url) => {
    return router.get(url, res => res.answer.ok(`${url} route`));
  }, new Router());
}

/**
 * @param mountPath
 * @param routePaths
 * @param {function(): Promise} checks
 * @return {Promise<void>}
 */
async function withFalcon(mountPath, routePaths, checks) {
  const falcon = new Falcon()
    .use(mountPath, routerFor(routePaths));
  try {
    await falcon.listen(PORT);
    await checks();
  } finally {
    falcon.close();
  }
}

describe('routing', function () {

  it('should should handle root route mounted on root', async function () {
    const mountPath = '/';
    const routePaths = ['/', '/path'];
    const checks = async () => {
      const res = await got(getUrl('/'));

      expect(res.statusCode).to.be.equal(200);
      expect(res.body).to.be.equal('/ route');
    };

    await withFalcon(mountPath, routePaths, checks);
  });

  it('should should handle named route mounted on root', async function () {
    const mountPath = '/';
    const routePaths = ['/', '/path'];
    const checks = async () => {
      const res = await got(getUrl('/path'));

      expect(res.statusCode).to.be.equal(200);
      expect(res.body).to.be.equal('/path route');
    };

    await withFalcon(mountPath, routePaths, checks);
  });

  it('should should handle root route mounted on named path', async function () {
    const mountPath = '/section';
    const routePaths = ['/', '/path'];
    const checks = async () => {
      const res = await got(getUrl('/section'));

      expect(res.statusCode).to.be.equal(200);
      expect(res.body).to.be.equal('/ route');
    };

    await withFalcon(mountPath, routePaths, checks);
  });

  it('should should handle named route used on root', async function () {
    const mountPath = '/section';
    const routePaths = ['/', '/path'];
    const checks = async () => {
      const res = await got(getUrl('/section/path'));

      expect(res.statusCode).to.be.equal(200);
      expect(res.body).to.be.equal('/path route');
    };

    await withFalcon(mountPath, routePaths, checks);
  });
});