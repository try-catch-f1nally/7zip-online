export default interface UserService {
  changeEmail(userId: string, email: string): Promise<void>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
}
