const {expect} = require('chai');
const {describe, it} = require('mocha');
const MultipartHandler = require('../../../src/request/body/multipart/MultipartHandler');

describe('MultipartHandler', function () {
  it('should manage errors', function (done) {
    const handler = new MultipartHandler({}, null, {});
    handler.parse()
      .then(() => done(new Error('Error expected')))
      .catch(() => done());
  });
});