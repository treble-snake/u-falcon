const _ = require('lodash');

/**
 * @param {string} url
 * @return string
 */
function trim(url) {
  return _.trim(url, '/');
}

/**
 * @param {string[]} parts
 * @return string
 */
const makeUrl = (parts) => {
  const url = parts
    .map(trim)
    .filter(_.identity)
    .join('/');

  return `/${url}`;
};

module.exports = makeUrl;