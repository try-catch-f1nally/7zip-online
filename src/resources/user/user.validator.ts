import UserValidator from './interfaces/user.validator.interface';

export default class UserValidatorImpl implements UserValidator {
  validateChangeEmail(userId: unknown, email: unknown) {
    return [];
  }

  validateChangePassword(userId: unknown, oldPassword: unknown, newPassword: unknown) {
    return [];
  }
}
