const {expect} = require('chai');
const {describe, it} = require('mocha');
const ChunkReader = require('../../../src/request/body/multipart/ChunkReader');

const BOUNDARY = '----------------------------608452250017861756937623';

const buffer = str => Buffer.from(str, 'utf-8');

describe('ChunkReader', function () {

  it('should process 1-item text chunk', function () {
    const chunk = `----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="someProp"\r
\r
the value\r
----------------------------608452250017861756937623--\r
`;
    const reader = new ChunkReader(BOUNDARY)
      .read(buffer(chunk))
      .finalize();

    expect(reader.isFinished()).to.be.true;
    const fields = reader.getFields();
    expect(fields.length).to.be.equal(1);
    const [field] = fields;

    expect(field.name).to.be.equal('someProp');
    expect(field.value).to.be.equal('the value');
  });

  it('should be unfinished without final new line', function () {
    const chunk = `----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="someProp"`;
    const reader = new ChunkReader(BOUNDARY)
      .read(buffer(chunk))
      .finalize();

    expect(reader.isFinished()).to.be.false;
  });

  describe('2-items text', function () {
    function check(reader) {
      expect(reader.isFinished()).to.be.true;
      const fields = reader.getFields();
      expect(fields.length).to.be.equal(2);
      const [field1, field2] = fields;

      expect(field1.name).to.be.equal('someProp');
      expect(field1.value).to.be.equal('the value');

      expect(field2.name).to.be.equal('someProp2');
      expect(field2.value).to.be.equal('the value\nmultiline');
    }

    it('should process 2-item text chunk', function () {
      const chunk = `----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="someProp"\r
\r
the value\r
----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="someProp2"\r
\r
the value\r
multiline\r
----------------------------608452250017861756937623--\r
`;
      const reader = new ChunkReader(BOUNDARY)
        .read(buffer(chunk))
        .finalize();

      check(reader);
    });

    it('should process 2-item text chunk split by header', function () {
      const chunk = `----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="someProp"\r
\r
the value\r
----------------------------608452250017861756937623\r
Content-Disposition: fo`;
      const chunk2 = `rm-data; name="someProp2"\r
\r
the value\r
multiline\r
----------------------------608452250017861756937623--\r
`;
      const reader = new ChunkReader(BOUNDARY)
        .read(buffer(chunk))
        .read(buffer(chunk2))
        .finalize();

      check(reader);
    });

    it('should process 2-item text chunk split by value', function () {
      const chunk = `----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="someProp"\r
\r
the val`;
      const chunk2 = `ue\r
----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="someProp2"\r
\r
the value\r
multiline\r
----------------------------608452250017861756937623--\r
`;
      const reader = new ChunkReader(BOUNDARY)
        .read(buffer(chunk))
        .read(buffer(chunk2))
        .finalize();

      check(reader);
    });

    it('should process 2-item text chunk split by boundary', function () {
      const chunk = `----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="someProp"\r
\r
the value\r
----------------------------60845`;
      const chunk2 = `2250017861756937623\r
Content-Disposition: form-data; name="someProp2"\r
\r
the value\r
multiline\r
----------------------------608452250017861756937623--\r
`;
      const reader = new ChunkReader(BOUNDARY)
        .read(buffer(chunk))
        .read(buffer(chunk2))
        .finalize();

      check(reader);
    });

    it('should process 2-item text chunk split by parts', function () {
      const chunk = `----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="someProp"\r
\r
the value`;
      const chunk2 = `\r
----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="someProp2"\r
\r
the value\r
multiline\r`;

      const chunk3 = `
----------------------------608452250017861756937623--\r
`;
      const reader = new ChunkReader(BOUNDARY)
        .read(buffer(chunk))
        .read(buffer(chunk2))
        .read(buffer(chunk3))
        .finalize();

      check(reader);
    });
  });

  describe('1-item file', function () {
    it('should handle 1 file', function () {

      const chunk = `----------------------------608452250017861756937623\r
Content-Disposition: form-data; name="the_file"; filename="test.txt"\r
Content-Type: text/plain\r
\r
bang bang\r
ololo\r
----------------------------608452250017861756937623--\r
`;

      const reader = new ChunkReader(BOUNDARY)
        .read(buffer(chunk))
        .finalize();

      console.log(reader.getFields());
    });
  });
});