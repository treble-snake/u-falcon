const {expect} = require('chai');
const {describe, it} = require('mocha');
const FalconResponse = require('../../../src/response/FalconResponse');

const INVALID_HEADER = 'Invalid header';

describe('FalconResponse', function () {

  const makeResponse = (res) => new FalconResponse(res);

  it('should provide changable cargo', function () {
    const response = makeResponse({});
    response.cargo.prop1 = 'value';
    response.cargo.num = 42;

    expect(response.cargo).to.be.deep.equal({
      prop1: 'value',
      num: 42
    });
  });

  describe('headers', function () {
    it('should throw on empty args', function () {
      const response = makeResponse();
      expect(() => response.addHeader()).to.throw(Error, INVALID_HEADER);
    });

    it('should throw on empty 2nd arg', function () {
      const response = makeResponse();
      expect(() => response.addHeader('name')).to.throw(Error, INVALID_HEADER);
    });

    it('should throw on empty string args', function () {
      const response = makeResponse();
      expect(() => response.addHeader('', '')).to.throw(Error, INVALID_HEADER);
    });

    it('should throw on empty string 2nd arg', function () {
      const response = makeResponse();
      expect(() => response.addHeader('name', '')).to.throw(Error, INVALID_HEADER);
    });

    it('should throw on non-string args', function () {
      const response = makeResponse();
      expect(() => response.addHeader(1, 2)).to.throw(Error, INVALID_HEADER);
    });

    it('should throw on non string 2nd arg', function () {
      const response = makeResponse();
      expect(() => response.addHeader('name', 2)).to.throw(Error, INVALID_HEADER);
    });

    it('should provide added headers', function () {
      const response = makeResponse()
        .addHeader('header-one', 'value-one')
        .addHeader('header-two', 'value-two');

      let result = {};
      response.withHeaders((name, value) => result[name] = value);

      expect(result).to.be.deep.equal({
        'header-one': 'value-one',
        'header-two': 'value-two'
      });
    });

    it('should rewrite header value', function () {
      const response = makeResponse()
        .addHeader('header-one', 'value-one')
        .addHeader('header-two', 'value-two')
        .addHeader('header-one', 'value-three');

      let result = {};
      response.withHeaders((name, value) => result[name] = value);

      expect(result).to.be.deep.equal({
        'header-one': 'value-three',
        'header-two': 'value-two'
      });
    });
  });

  describe('hasContentType', function () {
    it('should return false by default', function () {
      expect(makeResponse().hasContentType()).to.be.false;
    });

    it('should return false if other headers are set', function () {
      const response = makeResponse().addHeader('some-header', 'value');
      expect(response.hasContentType()).to.be.false;
    });

    it('should return true if content type is set', function () {
      const response = makeResponse().addHeader('content-type', 'text/html');
      expect(response.hasContentType()).to.be.true;
    });
  });

});