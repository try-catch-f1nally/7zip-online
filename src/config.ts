import path from 'path';
import Config from './utils/@types/interfaces/config.interface';

const config: Config = {
  port: Number(process.env.PORT) || 8080,
  shutdownTimeoutInSeconds: 3,
  baseUrl: '/api',
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/7zip-online',
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-key',
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
    extended: false
  },
  corsOptions: {
    credentials: true,
    origin: 'http://localhost:3000'
  }
};

export default config;
