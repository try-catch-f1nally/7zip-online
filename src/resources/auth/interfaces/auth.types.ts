export type RegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type TokenPayload = {
  user: {
    id: string;
  };
};

export type UserData = {userId: string; accessToken: string; refreshToken: string};
