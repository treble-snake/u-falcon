const {expect} = require('chai');
const {describe, it} = require('mocha');
const FalconAnswer = require('../../../src/response/FalconAnswer');

describe('FalconAnswer', function () {

  describe('hasAnswer', function () {
    it('should not have answer by default', function () {
      const answer = new FalconAnswer();
      expect(answer.hasAnswer()).to.be.false;
    });

    it('should have an answer after answering method call', function () {
      const answer = new FalconAnswer();
      answer.ok();
      expect(answer.hasAnswer()).to.be.true;
    });
  });


  it('should throw on a duplicate answer', function () {
    const answer = new FalconAnswer();
    answer.ok();

    expect(() => answer.ok()).to.throw(Error, 'Already answered');
  });

  it('should thow on getting an absent answer', function () {
    const answer = new FalconAnswer();
    expect(() => answer.getAnswer()).to.throw(Error, 'No answer');
  });

  it('should answer with empty data', function () {
    const answer = new FalconAnswer();
    answer.ok();

    expect(answer.getAnswer()).to.be.deep.equal({code: 200, data: ''});
  });

  it('should answer 200 with data', function () {
    const answer = new FalconAnswer();
    answer.ok({prop: 'some'});

    expect(answer.getAnswer()).to.be.deep.equal({
      code: 200,
      data: {prop: 'some'}
    });
  });

  it('should answer 201 with data', function () {
    const answer = new FalconAnswer();
    answer.created({prop: 'some'});

    expect(answer.getAnswer()).to.be.deep.equal({
      code: 201,
      data: {prop: 'some'}
    });
  });

  it('should answer 204 with no data', function () {
    const answer = new FalconAnswer();
    answer.noContent({prop: 'some'});

    expect(answer.getAnswer()).to.be.deep.equal({code: 204, data: ''});
  });

  it('should answer 400 with data', function () {
    const answer = new FalconAnswer();
    answer.badRequest({prop: 'some'});

    expect(answer.getAnswer()).to.be.deep.equal({
      code: 400,
      data: {prop: 'some'}
    });
  });

  it('should answer 401 with data', function () {
    const answer = new FalconAnswer();
    answer.notAuthorized({prop: 'some'});

    expect(answer.getAnswer()).to.be.deep.equal({
      code: 401,
      data: {prop: 'some'}
    });
  });

  it('should answer 403 with data', function () {
    const answer = new FalconAnswer();
    answer.forbidden({prop: 'some'});

    expect(answer.getAnswer()).to.be.deep.equal({
      code: 403,
      data: {prop: 'some'}
    });
  });

  it('should answer 404 with data', function () {
    const answer = new FalconAnswer();
    answer.notFound({prop: 'some'});

    expect(answer.getAnswer()).to.be.deep.equal({
      code: 404,
      data: {prop: 'some'}
    });
  });

  it('should answer 500 with data', function () {
    const answer = new FalconAnswer();
    answer.internal({prop: 'some'});

    expect(answer.getAnswer()).to.be.deep.equal({
      code: 500,
      data: {prop: 'some'}
    });
  });


});