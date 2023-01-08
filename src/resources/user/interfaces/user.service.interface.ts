export default interface UserService {
  changeName(userId: string, firstName: string, lastName: string): Promise<void>;
  changeEmail(userId: string, email: string): Promise<void>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
}
