import crypto from 'crypto';
import {Schema, model} from 'mongoose';
import UserModel, {User, UserDocument} from './interfaces/user.model.interface';

const UserSchema = new Schema<UserDocument, UserModel>(
  {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, unique: true, required: true, lowercase: true},
    password: {type: String, required: true},
    salt: {type: String, required: true, default: crypto.randomBytes(16).toString('hex')},
    token: {type: String}
  },
  {
    methods: {
      comparePassword(password: string) {
        return _hashPassword(password, this.salt) === this.password;
      }
    }
  }
);

UserSchema.index({email: 1});

UserSchema.pre<UserDocument>('save', function () {
  if (this.isModified('password')) {
    this.password = _hashPassword(this.password, this.salt);
  }
});

function _hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 10, 64, 'sha512').toString('hex');
}

export default model<UserDocument, UserModel>('User', UserSchema);
