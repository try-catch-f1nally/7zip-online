import Ajv, {JSONSchemaType} from 'ajv';
import addFormats from 'ajv-formats';
import AuthValidator from './interfaces/auth.validator.interface';

export default class AuthValidatorImpl implements AuthValidator {
  private _registerValidator = this._compileRegisterValidator();
  private _loginValidator = this._compileLoginValidator();

  private _compileRegisterValidator() {
    const ajv = new Ajv();
    addFormats(ajv, ['email', 'password']);
    const schema: JSONSchemaType<{email: string; password: string}> = {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email'
        },
        password: {
          type: 'string',
          format: 'password'
        }
      },
      required: ['email', 'password'],
      additionalProperties: false
    };
    return ajv.compile(schema);
  }

  private _compileLoginValidator() {
    const ajv = new Ajv();
    const schema: JSONSchemaType<{email: string; password: string}> = {
      type: 'object',
      properties: {
        email: {type: 'string'},
        password: {type: 'string'}
      },
      required: ['email', 'password'],
      additionalProperties: false
    };
    return ajv.compile(schema);
  }

  validateRegister(email: unknown, password: unknown) {
    return [];
  }

  validateLogin(email: unknown, password: unknown) {
    return [];
  }
}
