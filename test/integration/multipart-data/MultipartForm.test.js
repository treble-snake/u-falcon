const {expect} = require('chai');
const {describe, it} = require('mocha');
const got = require('got');
const FormData = require('form-data');
const fs = require('fs');
const md5File = require('md5-file');

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

  it('should parse small file field', function (done) {
    const form = new FormData();
    const FIXTURE = './test/fixtures/github.png';
    form.append('file_field', fs.createReadStream(FIXTURE));

    function checks(res, req) {
      const {body} = req;
      try {
        expect(body.file_field.filename).to.be.equal('github.png');
        expect(body.file_field.mimetype).to.be.equal('image/png');
        const originalHash = md5File.sync(FIXTURE);
        expect(md5File.sync(body.file_field.path)).to.be.equal(originalHash);
      } finally {
        fs.unlinkSync(body.file_field.path);
      }
    }

    const router = new Router().post('/', createChecks(checks, done));
    withFalcon(router, () => got.post(url(), {body: form}))
      .catch(done);
  });

  it('should parse big file field', function (done) {
    const form = new FormData();
    const FIXTURE = './test/fixtures/big.jpg';
    form.append('file_field', fs.createReadStream(FIXTURE));

    function checks(res, req) {
      const {body} = req;
      try {
        expect(body.file_field.filename).to.be.equal('big.jpg');
        expect(body.file_field.mimetype).to.be.equal('image/jpeg');
        const originalHash = md5File.sync(FIXTURE);
        expect(md5File.sync(body.file_field.path)).to.be.equal(originalHash);
      } finally {
        fs.unlinkSync(body.file_field.path);
      }
    }

    const router = new Router().post('/', createChecks(checks, done));
    withFalcon(router, () => got.post(url(), {body: form}))
      .catch(done);
  });
});