const Router = require('../../src/routing/Router');

function dummy(methods = ['get']) {
  const router = new Router();
  methods.forEach(it => {
    router[it]('/', (res) => res.answer.ok());
  });
  return router;
}

module.exports = {
  dummy
};