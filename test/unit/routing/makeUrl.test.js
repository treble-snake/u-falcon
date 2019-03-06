const {expect} = require('chai');
const {describe, it} = require('mocha');
const makeUrl = require('../../../src/routing/makeUrl');

describe('makeUrl', function () {
  it('should return / for / input', function () {
    expect(makeUrl(['/']))
      .to.be.equal('/');
  });

  it('should return normal form of single normalized input item', function () {
    expect(makeUrl(['/path']))
      .to.be.equal('/path');
  });

  it('should return normal form of single word input item', function () {
    expect(makeUrl(['path']))
      .to.be.equal('/path');
  });

  it('should strip slash from the end of a single word input item', function () {
    expect(makeUrl(['path/']))
      .to.be.equal('/path');
  });

  it('should strip slash from the end of a single url input item', function () {
    expect(makeUrl(['/path/']))
      .to.be.equal('/path');
  });

  it('should strip all slashes from the end of a single word input item', function () {
    expect(makeUrl(['path////']))
      .to.be.equal('/path');
  });

  it('should strip all slashes from the end of a multi word input item', function () {
    expect(makeUrl(['/some/log/path////']))
      .to.be.equal('/some/log/path');
  });

  it('should reduce several root urls', function () {
    expect(makeUrl(['/', '/', '/']))
      .to.be.equal('/');
  });

  it('should concat several words', function () {
    expect(makeUrl(['some', 'long', 'path']))
      .to.be.equal('/some/long/path');
  });

  it('should concat heterogeneous url', function () {
    expect(makeUrl(['/', '/some/url', '/', '/', 'long////', '////path']))
      .to.be.equal('/some/url/long/path');
  });
});