const BodyParsingError = require('../../errors/BodyParsingError');
const parseJson = require('./parseJson');
const parseFormUrlencoded = require('./parseFormUrlencoded');
const parseMultipartData = require('./parseMultipartData');
// const debug = require('../../helpers/debug');

/**
 * @type {Map<string, function>}
 */
const BODY_PARSERS = new Map([
  ['application/json', parseJson],
  ['application/x-www-form-urlencoded', parseFormUrlencoded]
]);

/**
 * @param {string} type
 * @return {function(HttpResponse, Object): Promise<{body: Object, [files]: Object}>}
 * @throws BodyParsingError
 */
const getBodyParser = (type) => {
  // most often case
  if (BODY_PARSERS.has(type)) {
    return BODY_PARSERS.get(type);
  }

  if(type.startsWith('multipart/form-data')) {
    return parseMultipartData;
  }

  throw new BodyParsingError(`Content-type ${type} is not supported`);
};

module.exports = getBodyParser;