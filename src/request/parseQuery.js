const queryString = require('query-string');

/**
 * @param {string} query
 * @return {Object}
 */
const parseQuery = (query) => {
  return queryString.parse(query, {
    arrayFormat: 'bracket' // todo: configurable?
  });
};


module.exports = parseQuery;