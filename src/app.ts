import * as http from 'http';
import express from 'express';
import Config from './utils/@types/interfaces/config.interface';
import Logger from './utils/@types/interfaces/logger.interface';
import Database from './utils/@types/interfaces/database.interface';

export default class Application {
  private readonly _app: express.Application = express();
  private readonly _config: Config;
  private readonly _logger: Logger;
  private readonly _database: Database;
  private readonly _middlewares: Array<express.RequestHandler>;
  private readonly _routers: Array<express.Router>;
  private readonly _defaultHandler: express.RequestHandler;
  private readonly _errorHandler: express.ErrorRequestHandler;
  private _server: http.Server | null = null;

  constructor(
    config: Config,
    logger: Logger,
    database: Database,
    middlewares: Array<express.RequestHandler>,
    routers: Array<express.Router>,
    defaultHandler: express.RequestHandler,
    errorHandler: express.ErrorRequestHandler
  ) {
    this._config = config;
    this._logger = logger;
    this._database = database;
    this._middlewares = middlewares;
    this._routers = routers;
    this._defaultHandler = defaultHandler;
    this._errorHandler = errorHandler;

    this._registerShutdownHooks();
    this._registerHandlers();
  }

  async start() {
    this._logger.info('Starting application...');
    await this._database.connect();
    this._startListening();
  }

  async stop() {
    this._logger.info('Stopping application...');
    await this._database.close();
    this._logger.info('Application successfully stopped');
  }

  private _registerHandlers() {
    this._app.use(...this._middlewares);
    this._app.use(this._config.baseUrl, ...this._routers);
    this._app.use(this._errorHandler);
    this._app.use('*', this._defaultHandler);
  }

  private _registerShutdownHooks() {
    const gracefulShutdown = async () => {
      this._logger.info('Stopping server from accepting new connections...');
      this._server?.close();
      await new Promise((resolve) => setTimeout(resolve, this._config.shutdownTimeoutInSeconds * 1000));
      this._server?.closeAllConnections();
      await this.stop();
      process.exit();
    };
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  }

  private _startListening() {
    const port = this._config.port;
    const cb = () => this._logger.info(`Application started listening on port ${port}`);
    this._server = this._app.listen(port, cb);
  }
}
