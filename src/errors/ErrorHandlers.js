/**
 * @param {FalconResponse} res
 * @param {FalconRequest} req
 */
const notFoundHandler = (res, req) => {
  res.answer.notFound({error: {code: 'ENDPOINT_NOT_FOUND', url: req.url}});
};

/**
 * @param {FalconResponse} res
 * @param {FalconRequest} req
 */
const invalidBodyHandler = (res, req) => {
  res.answer.badRequest({error: {code: 'INVALID_BODY'}});
};

/**
 * @param {string|Error} e
 * @param {FalconResponse} res
 * @param {FalconRequest} req
 * @param {boolean} isProduction
 */
const internalErrorHandler = (e, res, req, isProduction) => {
  // todo: default production filters
  res.answer.internal(typeof e === 'string' ?
    {error: {code: 'INTERNAL', message: e}} :
    {
      error: {
        code: 'INTERNAL',
        name: e.name,
        message: e.message,
        stack: e.stack
      }
    });
};

module.exports = {
  notFoundHandler,
  invalidBodyHandler,
  internalErrorHandler
};