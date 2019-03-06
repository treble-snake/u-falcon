const Falcon = require('../src/Falcon');
const Router = require('../src/routing/Router');

const falcon = new Falcon();

const PORT = 3000;

const innerRouter = new Router()
  .get('/inner', (res, req) => {
    console.log('This is /inner controller');
    res.answer.ok('Hello from inside');
  });

const mainRouter = new Router()
  .use('/lvl2', innerRouter)
  .get('/', (res, req) => {
    console.log('This is / controller');
    const result = {result: 'Hello world'};
    res.answer.ok(result);
  })
  .get('/yo', (res, req) => {
    console.log('This is Yo controller');
    res.answer.ok('<div style="text-align: center">Yo!</div>');
  })
  .post('/yo', (res, req) => {
    console.log('This is YO POST controller');
    res.addHeader('accept-version', '1.0.5');
    res.answer.noContent();
  });

const otherRouter = new Router()
  .get('/two', (res, req) => {
    console.log('This is OTHER controller');
    res.answer.ok('Hey 2');
  });

falcon
  .use(async function rLog(res, req) {
    console.warn('Setting cargo');
    console.warn('On url: ', req.url);
    res.cargo.agent = req.getHeader('User-Agent');
    res.cargo.first = Math.random();
    res.cargo['prop' + Math.floor(Math.random() * 100)] = 'Yo';
  })
  .use('/', mainRouter)
  .use((res) => {
    console.log('This is only before other router, cargo:', res.cargo);
  })
  .use('/other', otherRouter)
  .listen(PORT)
  .then(() => {
    console.log('Listening on ', PORT);
  })
  .catch((e) => {
    console.warn('Failed', e);
  });