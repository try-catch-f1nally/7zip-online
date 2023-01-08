import UserService from './interfaces/user.service.interface';
import {BadRequestError, WrongUserIdInTokenError} from '../../exceptions/api.exception';
import Config from '../../utils/@types/interfaces/config.interface';
import UserModel from './interfaces/user.model.interface';

export default class UserServiceImpl implements UserService {
  private _config: Config;
  private _userModel: UserModel;

  constructor(config: Config, userModel: UserModel) {
    this._config = config;
    this._userModel = userModel;
  }

  async changeName(userId: string, firstName: string, lastName: string) {
    const {modifiedCount} = await this._userModel.updateOne({_id: userId}, {$set: {firstName, lastName}});
    if (!modifiedCount) {
      throw new WrongUserIdInTokenError();
    }
  }

  async changeEmail(userId: string, email: string) {
    const existingUserWithEmail = await this._userModel.findOne({email});
    if (existingUserWithEmail) {
      throw new BadRequestError('User with such email already exist');
    }
    const {modifiedCount} = await this._userModel.updateOne({_id: userId}, {$set: {email}});
    if (!modifiedCount) {
      throw new WrongUserIdInTokenError();
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this._userModel.findById(userId);
    if (!user) {
      throw new WrongUserIdInTokenError();
    }
    if (!user.comparePassword(oldPassword)) {
      throw new BadRequestError('Incorrect old password');
    }
    user.password = newPassword;
    await user.save();
  }
}
