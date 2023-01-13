import fs from 'fs/promises';
import path from 'path';
import {path7za} from '7zip-bin';
import node7Zip from 'node-7z';
import ArchiveService, {ArchivingProgress, CreateOptions} from './interfaces/archive.service.interface';
import Config from '../../utils/@types/interfaces/config.interface';
import Logger from '../../utils/@types/interfaces/logger.interface';
import {BadRequestError} from '../../exceptions/api.exception';

type ArchivingInfo = {
  archive: string;
  withCompression: boolean;
  status: 'process' | 'success' | 'error';
  errorMessage?: string;
  archiveProgress: number;
  compressionProgress: number;
  timeStart: Date;
  timeEnd?: Date;
};

export default class ArchiveServiceImpl implements ArchiveService {
  private _config: Config;
  private _logger: Logger;
  private _usersArchivingInfoMap: {[userId: string]: ArchivingInfo} = {};

  constructor(config: Config, logger: Logger) {
    this._config = config;
    this._logger = logger;
  }

  getUserDir(userId: string) {
    return path.join(this._config.archive.uploadDirPath, userId);
  }

  async prepareUserDir(userId: string) {
    const userDir = this.getUserDir(userId);
    try {
      await fs.rm(userDir, {recursive: true, force: true});
    } catch (err) {
      if (err instanceof Object && 'code' in err && err.code === 'EBUSY') {
        throw new BadRequestError('Please wait for the completion of your previous request');
      }
    }
    await fs.mkdir(userDir, {recursive: true});
  }

  createArchive(userId: string, {format, password}: CreateOptions): void {
    const userDir = this.getUserDir(userId);
    const [archiveType, compressionExt] = format.split('.');
    const archive = `${userDir}${path.sep}Archive.${archiveType}`;
    const compressedArchive = `${userDir}${path.sep}Archive.${format}`;
    const source = `${userDir}${path.sep}*.*`;
    const zipOptions = {
      $bin: path7za,
      $progress: true,
      recursive: true,
      password,
      method: password && format === '7z' ? ['he'] : []
    };

    this._usersArchivingInfoMap[userId] = {
      archive: compressedArchive,
      withCompression: !!compressionExt,
      status: 'process',
      archiveProgress: 0,
      compressionProgress: 0,
      timeStart: new Date()
    };

    const runCompressing = () =>
      node7Zip
        .add(compressedArchive, archive, zipOptions)
        .on('progress', ({percent}) => (this._usersArchivingInfoMap[userId].compressionProgress = percent))
        .on('error', async (error: unknown) => {
          this._usersArchivingInfoMap[userId].status = 'error';
          this._logger.debug(`Error on creating archive ${compressedArchive}`, error);
          await fs.rm(userDir, {recursive: true, force: true});
        })
        .on('end', () => {
          this._usersArchivingInfoMap[userId].status = 'success';
          this._usersArchivingInfoMap[userId].timeEnd = new Date();
        });

    node7Zip
      .add(archive, source, zipOptions)
      .on('progress', ({percent}) => (this._usersArchivingInfoMap[userId].archiveProgress = percent))
      .on('error', async (error: unknown) => {
        this._usersArchivingInfoMap[userId].status = 'error';
        this._logger.debug(`Error on creating archive ${archive}`, error);
        await fs.rm(userDir, {recursive: true, force: true});
      })
      .on('end', () => {
        if (!compressionExt) {
          this._usersArchivingInfoMap[userId].status = 'success';
          this._usersArchivingInfoMap[userId].timeEnd = new Date();
        } else {
          runCompressing();
        }
      });
  }

  getArchivingProgress(userId: string): ArchivingProgress {
    if (!this._usersArchivingInfoMap[userId]) {
      throw new BadRequestError(`There is no archive in progress`);
    }
    const {
      status,
      withCompression,
      archiveProgress,
      compressionProgress,
      errorMessage = 'Unknown error'
    } = this._usersArchivingInfoMap[userId];
    if (status === 'process') {
      if (withCompression) {
        const percentage = Math.ceil(archiveProgress * 0.05 + compressionProgress * 0.95);
        return {status: 'process', percentage};
      }
      return {status: 'process', percentage: archiveProgress};
    }
    if (status === 'success') {
      return {status: 'success'};
    }
    return {status: 'error', errorMessage};
  }

  downloadArchive(userId: string) {
    const userArchivingInfo = this._usersArchivingInfoMap[userId];
    const callback = () => {
      setTimeout(async () => {
        try {
          await fs.rm(this.getUserDir(userId), {recursive: true, force: true});
          delete this._usersArchivingInfoMap[userId];
        } catch (error) {
          this._logger.error(`Failed to remove files of user with id ${userId}`);
        }
      }, 20 * 60 * 1000);
    };
    if (userArchivingInfo?.status === 'process') {
      throw new BadRequestError('Archive is not ready yet');
    }
    if (userArchivingInfo?.status === 'success') {
      return {archive: userArchivingInfo.archive, callback};
    }
    throw new BadRequestError('Archive for download not found');
  }
}
