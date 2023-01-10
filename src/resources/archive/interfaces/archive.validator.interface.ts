import {ValidationError} from '../../../exceptions/api.exception';

export default interface ArchiveValidator {
  validateCreateArchive(createOptions: unknown): ValidationError[];
}
