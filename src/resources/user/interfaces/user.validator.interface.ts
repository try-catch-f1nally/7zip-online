import {ValidationError} from '../../../exceptions/api.exception';

export default interface UserValidator {
  validateChangeEmail(userId: unknown, email: unknown): ValidationError[];
  validateChangePassword(userId: unknown, oldPassword: unknown, newPassword: unknown): ValidationError[];
}
