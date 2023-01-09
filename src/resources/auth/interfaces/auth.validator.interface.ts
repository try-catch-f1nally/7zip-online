import {ValidationError} from '../../../exceptions/api.exception';

export default interface AuthValidator {
  validateRegister(email: unknown, password: unknown): ValidationError[];
  validateLogin(email: unknown, password: unknown): ValidationError[];
}
