import {ValidationError} from '../../../exceptions/api.exception';

export default interface UserValidator {
  validateChangeName(userId: any, firstName: any, lastName: any): ValidationError[];
  validateChangeEmail(userId: any, email: any): ValidationError[];
  validateChangePassword(userId: any, oldPassword: any, newPassword: any): ValidationError[];
}
