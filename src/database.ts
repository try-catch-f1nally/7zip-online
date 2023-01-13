import mongoose from 'mongoose';
import Config from './utils/@types/interfaces/config.interface';
import Logger from './utils/@types/interfaces/logger.interface';
import Database from './utils/@types/interfaces/database.interface';

export default class MongoDB implements Database {
  private _config: Config;
  private _logger: Logger;

  constructor(config: Config, logger: Logger) {
    this._config = config;
    this._logger = logger;
  }

  async connect() {
    this._logger.info('Connecting to DB...');
    await mongoose.connect(this._config.dbUri);
    this._logger.info('Successfully connected to MongoDB');
  }

  async close() {
    this._logger.info('Disconnecting from DB...');
    await mongoose.connection.close();
    this._logger.info('Successfully disconnected from MongoDB');
  }
}
