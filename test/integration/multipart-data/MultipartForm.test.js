const {expect} = require('chai');
const {describe, it} = require('mocha');
const got = require('got');
const FormData = require('form-data');
const fs = require('fs');
const {withFalcon, createChecks, url} = require('../../lib/server');
const Router = require('../../../src/routing/Router');


describe('MultipartFormData', function () {
  it('should parse text fields', function (done) {
    const form = new FormData();
    form.append('text_field_1', 'text value 1');
    form.append('text_field_2', 'text value 2');

    function checks(res, req) {
      const {body} = req;
      expect(body.text_field_1).to.be.equal('text value 1');
      expect(body.text_field_2).to.be.equal('text value 2');
    }

    const router = new Router().post('/', createChecks(checks, done));
    withFalcon(router, () => got.post(url(), {body: form}))
      .catch(done);
  });

  it('should parse file fields', function (done) {
    const form = new FormData();
    form.append('file_field', fs.createReadStream('./test/fixtures/github.png'));

    function checks(res, req) {
      const {body} = req;
      expect(body.file_field).to.be.equal('File:github.png');
    }

    const router = new Router().post('/', createChecks(checks, done));
    withFalcon(router, () => got.post(url(), {body: form}))
      .catch(done);
  });
});