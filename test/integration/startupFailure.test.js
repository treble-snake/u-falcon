const {describe, it} = require('mocha');
const Falcon = require('../../src/Falcon');
const PORT = 4321;

describe('startupFailure', function () {

  it('should throw when trying to listen the same port', async function () {
    const falcon1 = new Falcon();
    const falcon2 = new Falcon();
    try {
      await falcon1.listen(PORT);
      await falcon2.listen(PORT);
    } catch (e) {
      if(e.message === 'Server startup failed') {
        return;
      }

      throw e;
    } finally {
      falcon1.close();
    }

    throw new Error('Startup failure expected');
  });

});