export type TokenPayload = {
  user: {
    id: string;
  };
};

export type UserData = {userId: string; accessToken: string; refreshToken: string};
