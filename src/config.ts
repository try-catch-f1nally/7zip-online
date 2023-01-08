import Config from './utils/@types/interfaces/config.interface';

const config: Config = {
  port: 3000,
  shutdownTimeoutInSeconds: 3,
  baseUrl: '/api',
  dbUri: 'mongodb://localhost:27017/7zip-online',
  auth: {
    accessSecret: 'access-key',
    refreshSecret: 'refresh-key',
    accessTokenTtlInSeconds: 30 * 60,
    refreshTokenTtlInSeconds: 30 * 24 * 60 * 60
  },
  internalErrorHttpMessage: 'Something went wrong, please try again later',
  notFoundErrorHttpMessage: 'Route not found',
  log4js: {
    appenders: {all: {type: 'stdout'}},
    categories: {
      default: {appenders: ['all'], level: 'all'}
    }
  },
  morganFormat: 'dev',
  urlencodedMiddlewareOptions: {extended: false}
};

export default config;
