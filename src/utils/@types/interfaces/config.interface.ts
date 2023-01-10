import {CorsOptions} from 'cors';
import {OptionsJson, OptionsUrlencoded} from 'body-parser';
import {CookieParseOptions} from 'cookie-parser';
import log4js from 'log4js';

export default interface Config {
  port: number;
  shutdownTimeoutInSeconds: number;
  baseUrl: string;
  dbUri: string;
  auth: {
    accessSecret: string;
    refreshSecret: string;
    accessTokenTtlInSeconds: number;
    refreshTokenTtlInSeconds: number;
  };
  archive: {
    fileSizeLimit: number;
    uploadDirPath: string;
  };
  internalErrorHttpMessage: string;
  notFoundErrorHttpMessage: string;
  log4js: log4js.Configuration;
  corsOptions?: CorsOptions;
  morganFormat: string;
  jsonMiddlewareOptions?: OptionsJson;
  urlencodedMiddlewareOptions?: OptionsUrlencoded;
  cookieParserOptions?: {
    secret?: string | string[];
    options?: CookieParseOptions;
  };
}
