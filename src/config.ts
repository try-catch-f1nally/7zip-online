import path from 'path';
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
  archive: {
    fileSizeLimit: 2 * 1024 * 1024 * 1024,
    uploadDirPath: path.resolve('./uploads')
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
  urlencodedMiddlewareOptions: {
    extended: false,
    limit: '2gb'
  },
  jsonMiddlewareOptions: {
    limit: '2gb'
  },
  corsOptions: {
    credentials: true,
    origin: 'http://localhost:8080'
  }
};

export default config;
