const got = require('got');
const Falcon = require('../../src/Falcon');
const PORT = 4321;

const BASE_URL = 'http://localhost:4321';

function url(url = '/') {
  return `${BASE_URL}${url}`;
}

/**
 * @param {Router} router
 * @param {function} makeRequest
 * @return {Promise<void>}
 */
async function withFalcon(router, makeRequest) {
  const falcon = new Falcon({
    uploadDir: './test/fixtures/upload'
  })
    .use('/', router);

  try {
    await falcon.listen(PORT);
    await makeRequest();
  } finally {
    falcon.close();
  }
}

async function useFalcon(falcon, makeRequest, defaultPort = true) {
  try {
    await falcon.listen(defaultPort ? PORT : undefined);
    await makeRequest();
  } finally {
    falcon.close();
  }
}

const createChecks = (checks, done) => (res, req) => {
  try {
    checks(res, req);
    done();
  } catch (e) {
    done(e);
  }
  res.answer.ok();
};

module.exports = {
  withFalcon,
  useFalcon,
  url,
  createChecks
};