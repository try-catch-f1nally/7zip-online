import UserValidator from './interfaces/user.validator.interface';

export default class UserValidatorImpl implements UserValidator {
  // TODO

  validateChangeName(userId: any, firstName: any, lastName: any) {
    return [];
  }

  validateChangeEmail(userId: any, email: any) {
    return [];
  }

  validateChangePassword(userId: any, oldPassword: any, newPassword: any) {
    return [];
  }
}
