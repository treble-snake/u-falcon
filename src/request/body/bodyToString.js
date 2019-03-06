/**
 * @param {HttpResponse} uRes
 * @return {Promise<string>}
 */
const bodyToString = (uRes) => new Promise((resolve) => {
  let result;

  uRes.onData((arrayBuffer, isLast) => {
    // this doesn't copy data in memory
    const chunk = Buffer.from(arrayBuffer);

    if (isLast) {
      if (result) {
        return resolve(Buffer.concat([result, chunk]).toString());
      }

      return resolve(chunk.toString());
    }

    if (result) {
      result = Buffer.concat([result, chunk]);
      return;
    }

    result = Buffer.from(chunk); // copying data
  });
});

module.exports = bodyToString;