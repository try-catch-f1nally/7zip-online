import {TokenPayload, UserData} from './auth.types';

export default interface AuthService {
  register(email: string, password: string): Promise<UserData>;
  login(email: string, password: string): Promise<UserData>;
  logout(refreshToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<UserData>;
  validateAccessToken(token: string): TokenPayload | null;
  validateRefreshToken(token: string): TokenPayload | null;
}
