import {LoginData, RegistrationData, TokenPayload, UserData} from './auth.types';

export default interface AuthService {
  register(registrationData: RegistrationData): Promise<UserData>;
  login(loginData: LoginData): Promise<UserData>;
  logout(refreshToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<UserData>;
  validateAccessToken(token: string): TokenPayload | null;
  validateRefreshToken(token: string): TokenPayload | null;
}
