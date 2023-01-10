export type SupportedFormats = 'zip' | '7z' | 'wim' | 'tar' | 'tar.gz' | 'tar.xz' | 'tar.bz2';

export type CreateOptions = {
  format: SupportedFormats;
  password?: string;
};

export type ArchivingProgress = StatusProcess | StatusSuccess | StatusError;

type StatusProcess = {
  status: 'process';
  percentage: number;
};

type StatusError = {
  status: 'error';
  message: string;
};

type StatusSuccess = {
  status: 'success';
};

export default interface ArchiveService {
  getUserDir(userId: string): string;
  prepareUserDir(userId: string): Promise<void>;
  createArchive(userId: string, createOptions: CreateOptions): void;
  getArchivingProgress(userId: string): ArchivingProgress;
  downloadArchive(userId: string): {archive: string; callback: () => void};
}
