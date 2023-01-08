import {ValidationError} from '../../../exceptions/api.exception';

export default interface AuthValidator {
  validateRegister(registrationData: any): ValidationError[];
  validateLogin(loginData: any): ValidationError[];
}
