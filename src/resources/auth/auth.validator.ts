import Ajv, {JSONSchemaType, ValidateFunction} from 'ajv';
import addFormats from 'ajv-formats';
import AuthValidator from './interfaces/auth.validator.interface';
import {LoginData, RegistrationData} from './interfaces/auth.types';

export default class AuthValidatorImpl implements AuthValidator {
  // TODO
  private _registerValidator: ValidateFunction<RegistrationData> = this._compileRegisterValidator();
  private _loginValidator: ValidateFunction<LoginData> = this._compileLoginValidator();

  private _compileRegisterValidator() {
    const ajv = new Ajv();
    addFormats(ajv, ['email', 'password']);
    const schema: JSONSchemaType<RegistrationData> = {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          minLength: 2,
          maxLength: 20
        },
        lastName: {
          type: 'string',
          minLength: 2,
          maxLength: 20
        },
        email: {
          type: 'string',
          format: 'email'
        },
        password: {
          type: 'string',
          format: 'password'
        }
      },
      required: ['firstName', 'lastName', 'email', 'password'],
      additionalProperties: false
    };
    return ajv.compile(schema);
  }

  private _compileLoginValidator() {
    const ajv = new Ajv();
    const schema: JSONSchemaType<LoginData> = {
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

  validateRegister(registrationData: any) {
    return [];
  }

  validateLogin(loginData: any) {
    return [];
  }
}
