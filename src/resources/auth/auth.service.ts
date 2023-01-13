import jwt from 'jsonwebtoken';
import {BadRequestError, UnauthorizedError, WrongUserIdInTokenError} from '../../exceptions/api.exception';
import AuthService from './interfaces/auth.service.interface';
import Config from '../../utils/@types/interfaces/config.interface';
import UserModel from '../user/interfaces/user.model.interface';
import {TokenPayload} from './interfaces/auth.types';

export default class AuthServiceImpl implements AuthService {
  private _config: Config;
  private _userModel: UserModel;

  constructor(config: Config, userModel: UserModel) {
    this._config = config;
    this._userModel = userModel;
  }

  async register(email: string, password: string) {
    const candidate = await this._userModel.findOne({email});
    if (candidate) {
      throw new BadRequestError('User with such email already exists');
    }
    const user = await this._userModel.create({email, password});
    const payload = {user: {id: user.id}};
    const tokens = this._generateTokens(payload);
    user.token = tokens.refreshToken;
    await user.save();

    return {...tokens, userId: user.id};
  }

  async login(email: string, password: string) {
    const user = await this._userModel.findOne({email});
    if (!user?.comparePassword(password)) {
      throw new BadRequestError('Wrong email or password');
    }
    const payload = {user: {id: user.id}};
    const tokens = this._generateTokens(payload);
    user.token = tokens.refreshToken;
    await user.save();

    return {...tokens, userId: user.id};
  }

  async logout(refreshToken: string) {
    const payload = this._decodeExpiredToken(refreshToken, this._config.auth.refreshSecret);
    if (payload === null) {
      throw new UnauthorizedError('Invalid refresh token provided');
    }

    const user = await this._userModel.findById(payload.user.id);
    if (!user) {
      throw new WrongUserIdInTokenError();
    }
    user.token = undefined;
    await user.save();
  }

  async refresh(refreshToken: string) {
    const invalidTokenError = new UnauthorizedError('Invalid refresh token provided');

    const payload = this._decodeExpiredToken(refreshToken, this._config.auth.refreshSecret);
    if (payload === null) {
      throw invalidTokenError;
    }

    const user = await this._userModel.findOne({_id: payload.user.id});
    if (!user) {
      throw new WrongUserIdInTokenError();
    }
    const currentToken = user.token;
    user.token = undefined;
    await user.save();

    if (currentToken !== refreshToken) {
      throw invalidTokenError;
    }
    const tokens = this._generateTokens({user: {id: user.id}});
    user.token = tokens.refreshToken;
    await user.save();

    return {...tokens, userId: user.id};
  }

  validateAccessToken(token: string) {
    const {accessSecret} = this._config.auth;
    try {
      const decoded = jwt.verify(token, accessSecret);
      if (this._isTokenPayload(decoded)) {
        return decoded;
      }
    } catch {}
    return null;
  }

  validateRefreshToken(token: string) {
    const {refreshSecret} = this._config.auth;
    try {
      const decoded = jwt.verify(token, refreshSecret);
      if (this._isTokenPayload(decoded)) {
        return decoded;
      }
    } catch {}
    return null;
  }

  _isTokenPayload(decoded: string | jwt.JwtPayload): decoded is TokenPayload {
    return (
      // prettier-ignore
      typeof decoded === 'object' &&
      'user' in decoded &&
      'id' in decoded.user &&
      typeof decoded.user.id === 'string'
    );
  }

  _decodeExpiredToken(token: string, secretKey: string) {
    let payload;
    try {
      payload = jwt.verify(token, secretKey);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const decoded = Buffer.from(token.split('.')[1], 'base64').toString();
        payload = JSON.parse(decoded);
      }
    }
    if (this._isTokenPayload(payload)) {
      return payload;
    }
    return null;
  }

  _generateTokens(payload: object | string | Buffer) {
    const {accessSecret, refreshSecret, accessTokenTtlInSeconds, refreshTokenTtlInSeconds} = this._config.auth;
    return {
      accessToken: jwt.sign(payload, accessSecret, {expiresIn: accessTokenTtlInSeconds}),
      refreshToken: jwt.sign(payload, refreshSecret, {expiresIn: refreshTokenTtlInSeconds})
    };
  }
}
