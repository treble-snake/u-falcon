// todo: add some debug
if(process.env.DEBUG_PINO) {
  const pino = require('pino');
  const pinoDebug = require('pino-debug');
  pinoDebug(pino({
    prettyPrint: true,
    level: 'debug'
  }));
}

const debug = require('debug')('falcon');

module.exports = debug;